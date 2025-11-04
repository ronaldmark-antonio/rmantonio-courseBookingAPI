//for configuring environment variables.
require('dotenv').config()

//Passport is an authentication middleware for Node.js. It can be added in any express-based web application. It has comprehensive set of strategies and methods that support authentication using a username and password, Facebook, Twitter, etc.
const passport = require("passport");

//Strategies are algorithms that are used for specific purposes. In this case authenticating the application using the Google API console project 0Auth Client ID credentials.
const GoogleStrategy = require('passport-google-oauth20').Strategy;

//This configures passport to use the Google OAuth 2.0 authentication strategy
//Uses the google API console project OAuth client ID credentials (eg. client ID and client Secret) to authorize the app to connect to the google api
//"callbackURL" is the defined route on how the request will be handles later once a google login has been implemented.
passport.use(new GoogleStrategy({
	clientID: process.env.clientID,
	clientSecret: process.env.clientSecret,
	callbackURL: "http://localhost:4000/users/google/callback",
	passReqToCallback: true
}, 

//This is the callback function that gets executed when a user is successfully authenticated
//returns the "profile" of the email used in the google login containing the user information (e.g email, firstname, lastname)
function(request, accessToken, refreshToken, profile, done) {
	return done(null, profile)
}
));

//This function is used to serialize the user object into a session.
//In this case, the entire user object is serialiezed
//The serialized user object is then stored in the session.
//keeps the user logged in
passport.serializeUser(function(user, done) {
	done(null,user)
})

//This function is used to deserialize the user object into a session.
//It retrieves the serialized user object from the session and passes it  to the "done" call back
//lets you user user data later(e.g. show their name on the page)
passport.deserializeUser(function(user, done) {
	done(null,user)
})