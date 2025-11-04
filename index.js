//[SECTION] Dependencies and Modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport')
const session = require('express-session')
require('./passport')

//[SECTION] Routes
const userRoutes = require('./routes/user');
//[SECTION] Activity: Allows access to routes defined within our application
const courseRoutes = require("./routes/course");
const enrollmentRoutes = require("./routes/enrollment");

//[SECTION] Environment Setup
// const PORT = 4000;
require('dotenv').config();


//[SECTION] Server setup
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
    //to be updated when we connect this to our client
    origin: ['http://localhost:3000', 'http://localhost:4000', 'http://localhost:5173','http://localhost:5174'],
    credentials: true,
    optionsSuccessStatus: 200
};

//Allow all resources
app.use(cors(corsOptions));

//[SECTION] google login
//Creates a session with the given data
//resave prevents the session from overwriting the secret while the session is active
app.use(session({
    secret: process.env.clientSecret,
    resave: false,
    saveUninitialized: false
}));

//starts passport in the 
//use case: needed to use passport's features(google login)
app.use(passport.initialize());

//enables passport session suport (log in once, stay logged in)
//connects the passport to session so that the user  stays logged in between pages
app.use(passport.session());

app.use(cors(corsOptions));

//[SECTION] Database Setup
mongoose.connect(process.env.MONGODB_STRING)

mongoose.connection.once('open', () => console.log('Now connected to MongoDB Atlas.'))

//[SECTION] Backend Routes
app.use("/users", userRoutes);
//[SECTION] Activity: Add course routes
app.use("/courses", courseRoutes);
app.use("/enrollments", enrollmentRoutes);


//[SECTION] Server Gateway Response

if(require.main === module) {
    app.listen( process.env.PORT || 3000, () => {
        console.log(`API is now online on port ${ process.env.PORT || 3000 }`);
    })
}


module.exports = { app, mongoose };
