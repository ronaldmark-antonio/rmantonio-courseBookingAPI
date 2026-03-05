const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Enrollment = require("../models/Enrollment");
const auth = require('../auth');

const { errorHandler } = auth;

module.exports.checkEmailExists = (req, res) => {
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
        res.status(400).send({ message: "Invalid email format"})
    }
};

module.exports.registerUser = async (req, res) => {
    try {

        if (typeof req.body.firstName !== 'string' || typeof req.body.lastName !== 'string') {
            return res.status(400).send({ message: 'Invalid data type' });
        }

        if (!req.body.email.includes("@")) {
            return res.status(400).send({ message: 'Invalid email format' });
        }

        const existingUser = await User.findOne({ email: req.body.email });

        if (existingUser) {
            return res.status(409).send({ message: "Email already exists" });
        }

        if (req.body.mobileNo.length !== 11) {
            return res.status(400).send({ message: 'Mobile number is invalid' });
        }

        if (req.body.password.length < 8) {
            return res.status(400).send({ message: 'Password must be atleast 8 characters long' });
        }

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

module.exports.loginUser = (req, res) => {
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
         return res.status(400).send(false);
    }
};

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

module.exports.resetPassword = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

        const token = authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ message: "Invalid token format" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    const userId = decoded.id;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
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

module.exports.updateProfile = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Invalid token format" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    const userId = decoded.id;
    const { firstName, lastName, mobileNo } = req.body;

    if (!firstName && !lastName && !mobileNo) {
      return res.status(400).json({ message: "No fields provided to update" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, mobileNo },
      { new: true, runValidators: true }
    ).select("-password");

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