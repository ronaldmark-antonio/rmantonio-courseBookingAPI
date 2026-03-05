const Course = require("../models/Course");
const { errorHandler } = require('../auth');

module.exports.addCourse = (req, res) => {

    let newCourse = new Course({
        name : req.body.name,
        description : req.body.description,
        price : req.body.price
    });

    Course.findOne({ name: req.body.name })

    .then(existingCourse => {

        if (existingCourse) {
            return res.status(409).send({ message: 'Course already exists'})

        } else {

            return newCourse.save()
 
            .then(result => res.status(201).send({
                success: true,
                message: 'Course added successfully',
                result: result
            }))
            .catch(error => errorHandler(error, req, res));
        }
    })
    .catch(error => errorHandler(error, req, res))
}; 

module.exports.getAllCourses = (req, res) => {
    return Course.find({})
    .then(result => {
        // if the result is not null send status 30 and its result
        if(result.length > 0){
            return res.status(200).send(result);
        }
        else{
            // 404 for not found courses
            return res.status(404).send({ message: 'No courses found'});
        }
    })
    .catch(error => errorHandler(error, req, res));
};

module.exports.getAllActive = (req, res) => {

    Course.find({ isActive : true }).then(result => {
        if (result.length > 0){
            return res.status(200).send(result);
        }
        else {
            return res.status(404).send({ message: 'No active courses found'})
        }
    }).catch(err => res.status(500).send(err));

};

module.exports.getCourse = (req, res) => {
    Course.findById(req.params.courseId)
    .then(course => {
        if(course) {
            return res.status(200).send(course);
        } else {
            return res.status(404).send({ message: 'Course not found'});
        }
    })
    .catch(error => errorHandler(error, req, res)); 
};

module.exports.updateCourse = (req, res)=>{

    let updatedCourse = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price
    }

    return Course.findByIdAndUpdate(req.params.courseId, updatedCourse)
    .then(course => {
        if (course) {
            res.status(200).send({success: true, message: 'Course updated successfully'});
        } else {
            res.status(404).send({ message: 'Course not found'});
        }
    })
    .catch(error => errorHandler(error, req, res));
};

module.exports.archiveCourse = (req, res) => {
  
    let updateActiveField = {
        isActive: false
    };

    Course.findByIdAndUpdate(req.params.courseId, updateActiveField)
        .then(course => {
            if (course) {
                if (!course.isActive) {
                    return res.status(200).send('Course already archived');
                }
                return res.status(200).send({success: true,
                    message: 'Course archived successfully'
                });
            } else {
                return res.status(404).send({message: 'Course not found'});
            }
        })
        .catch(error => errorHandler(error, req, res));
};

module.exports.activateCourse = (req, res) => {
  
    let updateActiveField = {
        isActive: true
    }

    Course.findByIdAndUpdate(req.params.courseId, updateActiveField)
        .then(course => {
            if (course) {
                if (course.isActive) {
                    return res.status(200).send({message: 'Course already activated',
                        course: course
                });
                }
                return res.status(200).send({success: true,
                    message: 'Course activated successfully'
                });
            } else {
                return res.status(404).send({message: 'Course not found'});
            }
        })
        .catch(error => errorHandler(error, req, res));
};

module.exports.searchCourses = async (req, res) => {
  try {
    const { courseName } = req.body;

    if (!courseName) {
      return res.status(400).json({ message: "Course name is required" });
    }

    const courses = await Course.find({
      name: { $regex: courseName, $options: "i" }
    });

    if (courses.length === 0) {
      return res.status(404).json({ message: "No courses found" });
    }

    res.status(200).json({
      message: "Courses found",
      results: courses
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};