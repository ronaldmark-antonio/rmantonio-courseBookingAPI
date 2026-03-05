const express = require('express');
const enrollmentController = require('../controllers/enrollment');
const auth = require("../auth")
const { verify, verifyAdmin } = auth;
const router = express.Router();

router.post('/enroll', verify, enrollmentController.enroll)
router.get('/get-enrollments', verify, enrollmentController.getEnrollments);

module.exports = router;