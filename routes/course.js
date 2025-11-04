//[SECTION] Activity: Dependencies and Modules
const express = require("express");
const courseController = require("../controllers/course");

const auth = require("../auth");

const { verify, verifyAdmin } = require("../auth");

//[SECTION] Activity: Routing Component
const router = express.Router();

//[SECTION] Activity: Route for creating a course
router.post("/", verify, verifyAdmin, courseController.addCourse); 

//[SECTION] Activity: Route for retrieving all courses
router.get("/all", verify, verifyAdmin, courseController.getAllCourses);

//[SECTION] Activity: Route for retrieving all active courses
router.get("/", courseController.getAllActive);

// Course search:
router.post("/search", courseController.searchCourses);

//[SECTION] Activity: Route for retrieving a specific course
router.get("/specific/:courseId", courseController.getCourse);

//[SECTION] Route for updating a course (Admin)
router.patch("/:courseId", verify, verifyAdmin, courseController.updateCourse);

//[SECTION] Activity: Route to archiving a course (Admin)
router.patch("/:courseId/archive", verify, verifyAdmin, courseController.archiveCourse);

//[SECTION] Activity: Route to activating a course (Admin)
router.patch("/:courseId/activate", verify, verifyAdmin, courseController.activateCourse);



//[SECTION] Activity: Export Route System
// Allows us to export the "router" object that will be accessed in our "index.js" file
module.exports = router;