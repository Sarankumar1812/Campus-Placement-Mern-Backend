const express = require('express');
const {
  updateStudentProfile,
  updateStudentResumeURL,
  getStudentProfileById,
  updateStudentImageURL,
  getJobsList,
  getAppliedJobsByStudentId,
  getStudentsAppliedJobs,
} = require('../controllers/studentController');

const studentRouter = express.Router();

studentRouter.post('/update-profile/:id', updateStudentProfile);
studentRouter.post('/update-resumeurl/:id', updateStudentResumeURL);
studentRouter.post('/update-imageurl/:id', updateStudentImageURL);
studentRouter.get('/job-list/:studentId', getJobsList);
studentRouter.get('/:id', getStudentProfileById);
studentRouter.get('/applied-jobs/:studentId', getAppliedJobsByStudentId);
studentRouter.get('/students-applied-jobs/:id', getStudentsAppliedJobs);

module.exports = studentRouter;
