const express = require('express');
const {
  createJob,
  viewApplications,
  updateApplicationStatus,
  getAllJobs,
  getCompanyDetails,
  getRecentApplications,
  getApplicationOverview,
  applyJobById,
  updateCompanyImageURL,
  updateJobStatus,
  scheduleInterview,
  updateCompanyProfile,
} = require('../controllers/companyController');

const companyRouter = express.Router();

companyRouter.post('/jobs', createJob);
companyRouter.get('/jobs', getAllJobs);
companyRouter.get('/:id/details', getCompanyDetails);
companyRouter.get('/:id/recent-applications', getRecentApplications);
companyRouter.get('/:id/applications-overview', getApplicationOverview);
companyRouter.post('/jobs/:jobId/apply', applyJobById);
companyRouter.get('/jobs/:id/applications', viewApplications);
companyRouter.put('/applications/:id/status', updateApplicationStatus);
companyRouter.patch('/applications/:id/schedule-interview', scheduleInterview);
companyRouter.patch('/change-jobs-status/:jobId', updateJobStatus);
companyRouter.post('/update-imageurl/:id', updateCompanyImageURL);
companyRouter.post('/update-profile/:id', updateCompanyProfile);

module.exports = companyRouter;
