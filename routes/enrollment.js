const express = require('express');
const enrollmentController = require('../controllers/enrollment');
const auth = require("../auth")

const { verify, verifyAdmin } = auth;

//Routing component
const router = express.Router();

//[SECTION] Route to enroll a user to a course
router.post('/enroll', verify, enrollmentController.enroll)
//[SECTION] Activity: Route to get the user's enrollements array
router.get('/get-enrollments', verify, enrollmentController.getEnrollments);

module.exports = router;