const express = require('express');
const {
  getStudentsList,
  getCompanyList,
  getCollegeDetails,
  getCollegeSummaryDetails,
  getRecentPlacements,
  updateCollegeProfile,
  updateCollegeImageURL,
} = require('../controllers/collegeController');
const { getApplicationOverview } = require('../controllers/companyController');

const collegeRouter = express.Router();

collegeRouter.get('/get-students-list', getStudentsList);
collegeRouter.get('/get-companies-list', getCompanyList);
collegeRouter.get('/get-college-details/:id', getCollegeDetails);
collegeRouter.get('/get-college-summary/:id', getCollegeSummaryDetails);
collegeRouter.get('/get-recent-placement/:id', getRecentPlacements);
collegeRouter.post('/update-profile/:id', updateCollegeProfile);
collegeRouter.post('/update-imageurl/:id', updateCollegeImageURL);

collegeRouter.get(
  '/get-college-application-overview/:id',
  getApplicationOverview,
);

module.exports = collegeRouter;
