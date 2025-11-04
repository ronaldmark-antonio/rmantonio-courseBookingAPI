//[SECTION] Dependencies and Modules
const express = require('express');
const userController = require('../controllers/user');
const passport = require('passport');
const { verify, isLoggedIn } = require("../auth");

//[SECTION] Routing Component
const router = express.Router();

//[SECTION] Checking if the email already exists
router.post("/check-email", userController.checkEmailExists);

//[SECTION] Route for User Registration
router.post("/register", userController.registerUser);

//[SECTION] Route for User Login
router.post("/login", userController.loginUser);


//[Section] Activity: Route for retrieving user details
router.get("/details", verify, userController.getProfile);

// reset password:
router.post("/reset-password", userController.resetPassword);

// updating profile:
router.put("/update-profile", userController.updateProfile);

//[SECTION] Google Login
//[SECTION] Route for initiating the google OAuth consent screen
router.get('/google',
	passport.authenticate('google', {
		//scopes that are allowed when retrieving user data
		scope: ['email', 'profile'],
		//allows the oauth consent screen to be prompted when the route is accessed and lets the user select the google account they wish to proceed with
		// if removed, automatically redirects the user to /google/success route
		prompt: "select_account"
	}
));

//[SECTION] Route for callback URL for Google OAuth authentication
router.get('/google/callback', 
	//if the authentication is unsuccessful, redirect to "users/failed" route
	passport.authenticate('google', {
		failureRedirect: '/users/failed'
	}),
	//If authentication is successful, redirect to "/users/success" route
	function (req, res) {
		res.redirect('/users/success')
	}
)

//[SECTION]Route for failed Google OAuth authentication
router.get("/failed", (req, res) => {
	console.log('User is not authenticated')
	res.send("Failed")
})

//[SECTION] Route for successful google oAuth authentication
router.get("/success", isLoggedIn, (req,res) => {
	console.log('You are logged in')
	console.log(req.user)
	res.send(`Welcome ${req.user.displayName}`)
})


//[SECTION] Route for logging out of the application
router.get("/logout", (req, res) => {
	req.session.destroy((err) => {
		if(err) {
			console.log('Error while destroying session', err)
		} else {
			req.logout(() => {
				console.log('You are logged out')

				res.redirect('/')
			})
		}
	})
})


module.exports = router;


