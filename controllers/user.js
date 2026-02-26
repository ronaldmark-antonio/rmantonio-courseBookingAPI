//[SECTION] Dependencies and Modules
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Enrollment = require("../models/Enrollment");
const auth = require('../auth');

const { errorHandler } = auth;

//[SECTION] Check if the email already exists

module.exports.checkEmailExists = (req, res) => {
    //check if the email from the request body contains an "@" symbol
    if (req.body.email.includes("@")) {
    return User.find({ email : req.body.email })
    .then(result => {

        if (result.length > 0) {

            return res.status(409).send({ message: "Duplicate email found"});

        } else {

            return res.status(404).send({ message: "No duplicate email found"});

        };
    })
    .catch(error => errorHandler(error, req, res));
    } else {
        //if the email does not contain an "@", send a 400 (bad request) status with "false" to indicate invalid input
        res.status(400).send({ message: "Invalid email format"})
    }
};


//[SECTION] User registration
module.exports.registerUser = async (req, res) => {
    try {

        // Validate first & last name
        if (typeof req.body.firstName !== 'string' || typeof req.body.lastName !== 'string') {
            return res.status(400).send({ message: 'Invalid data type' });
        }

        // Validate email format
        if (!req.body.email.includes("@")) {
            return res.status(400).send({ message: 'Invalid email format' });
        }

        // CHECK IF EMAIL ALREADY EXISTS
        const existingUser = await User.findOne({ email: req.body.email });

        if (existingUser) {
            return res.status(409).send({ message: "Email already exists" });
        }

        // Validate mobile number
        if (req.body.mobileNo.length !== 11) {
            return res.status(400).send({ message: 'Mobile number is invalid' });
        }

        // Validate password length
        if (req.body.password.length < 8) {
            return res.status(400).send({ message: 'Password must be atleast 8 characters long' });
        }

        // Create new user
        let newUser = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            mobileNo: req.body.mobileNo,
            password: bcrypt.hashSync(req.body.password, 10)
        });

        await newUser.save();

        return res.status(201).send({
            message: 'User registered successfully'
        });

    } catch (error) {
        errorHandler(error, req, res);
    }
};

//[SECTION] User authentication
module.exports.loginUser = (req, res) => {
    //if the request includes the @ symbol
    if (req.body.email.includes("@")) {
        return User.findOne({ email : req.body.email })
    .then(result => {
        if(result == null){
            return res.status(404).send({ message: 'No email found'});
        } else {
            const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);
            if (isPasswordCorrect) {
                return res.status(200).send({
                    message: 'User logged in succesfully',
                    access : auth.createAccessToken(result)
                 });
            } else {
                return res.status(401).send({message: 'Incorrect email or password'});
            }
        }
    })
    .catch(error => errorHandler(error, req, res));

    } else {
         //if the email does not contain an "@", send a bad request status with false value
         return res.status(400).send(false);
    }
};


//[Section] Activity: Retrieve user details
/*
    Steps:
    1. Retrieve the user document using it's id
    2. Change the password to an empty string to hide the password
    3. Return the updated user record
*/
module.exports.getProfile = (req, res) => {

    return User.findById(req.user.id)
    .then(user => {

        if(!user) {
            //if the user has an invalid token, we would be sending a message 'invalid signature'
            return res.status(403).send({message: 'invalid signature'})
        } else {
            user.password = "";
            res.status(200).send(user)
        }
       
    })
    .catch(error => errorHandler(error, req, res));
};

// Reset Password:
module.exports.resetPassword = async (req, res) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1]; // Expect "Bearer <token>" => ["Bearer", "token"]

    if (!token) return res.status(401).json({ message: "Invalid token format" });

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // Make sure JWT_SECRET is in .env
    } catch (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    // Extract userId from token
    const userId = decoded.id;

    // Extract new password from request body
    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    const user = await User.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// Updating profile:
module.exports.updateProfile = async (req, res) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1]; // "Bearer <token>"
    if (!token) return res.status(401).json({ message: "Invalid token format" });

    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    const userId = decoded.id;

    // Extract fields from request body
    const { firstName, lastName, mobileNo } = req.body;

    if (!firstName && !lastName && !mobileNo) {
      return res.status(400).json({ message: "No fields provided to update" });
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, mobileNo },
      { new: true, runValidators: true }
    ).select("-password"); // Exclude password from response

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};