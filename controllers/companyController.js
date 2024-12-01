const Placement = require('../models/Placement');
const User = require('../models/User');
const mongoose = require('mongoose');

const createJob = async (req, res) => {
  try {
    const {
      jobTitle,
      jobDescription,
      jobType,
      salary,
      deadline,
      companyId,
      technicalSkills,
      jobLocation,
      interviewMode,
    } = req.body;

    const job = await Placement.create({
      jobTitle,
      description: jobDescription,
      type: jobType,
      salary,
      deadline,
      company: companyId,
      skills: technicalSkills,
      location: jobLocation,
      interviewMode,
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// View all jobs created by the company
const getAllJobs = async (req, res) => {
  try {
    const jobs = await Placement.find().sort({ crAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching jobs' });
  }
};

const applyJobById = async (req, res) => {
  const { studentId } = req.body; // Student ID is passed in the body
  const { jobId } = req.params; // Job ID is passed in the URL

  try {
    // Find the job
    const job = await Placement.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if student has already applied
    const alreadyApplied = job.applicants.some(
      (applicant) => applicant.student.toString() === studentId,
    );

    if (alreadyApplied) {
      return res
        .status(400)
        .json({ message: 'Student has already applied for this job' });
    }

    // Add the student to the applicants list
    job.applicants.push({ student: studentId });
    await job.save();

    res.status(200).json({ message: 'Application submitted successfully' });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error applying for job', error: error.message });
  }
};

const viewJobs = async (req, res) => {
  try {
    // Fetch jobs and populate company details
    const jobs = await Placement.find()
      .populate('company', 'companyName companyImgUrl') // Populate company name and logo
      .sort({ crAt: -1 });

    // Format the response
    const formattedJobs = jobs.map((job) => ({
      _id: job._id,
      title: job.jobTitle,
      company_Id: job.company._id || 0,
      company: job.company?.companyName || 'Unknown',
      salary: job.salary || 'Not disclosed',
      location: job.location,
      description: job.description,
      tags: job.skills,
      interviewMode: job.interviewMode,
      lastDateForApply: job.deadline,
      logo: job.company?.companyImgUrl || 'default-logo-url.png',
    }));

    res.status(200).json({
      message: 'Job listings fetched successfully',
      jobs: formattedJobs,
    });
  } catch (error) {
    res.status(500).json({
      message: 'An error occurred while fetching job listings',
      error: error.message,
    });
  }
};

// View applications for a job
// const viewApplications = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!id) {
//       return res.status(400).json({ message: 'Company ID is required' });
//     }

//     // Fetch jobs and populate applicants
//     const jobs = await Placement.find({ company: id })
//       .populate('applicants.student');

//     if (!jobs || jobs.length === 0) {
//       return res
//         .status(404)
//         .json({ message: 'No job applications found for this company' });
//     }

//     // Transform applicants into the desired structure
//     const formattedApplications = [];
//     jobs.forEach((job) => {
//       const { jobTitle } = job; // Extract the jobTitle for each job
//       job.applicants.forEach((applicant) => {
//         const { student, status } = applicant;
//         formattedApplications.push({
//           id: applicant._id, // Unique ID for the application
//           jobTitle, // Add the jobTitle
//           studentName: `${student.firstName} ${student.lastName}`,
//           department: student.education?.[0]?.department || 'N/A',
//           email: student.emailID,
//           phone: student.phone,
//           skills: student.skills,
//           socialProfile: student.socialProfile,
//           gender: student.gender,
//           state: student.state,
//           city: student.city,
//           jobCreatedDate: student.city,
//           status: status || 'N/A',
//           isActive: status === 'Active' ? true : false,
//           resumeLink: student.resumeURL,
//           profileImage: student.studentImgURL || '/default-profile.jpg',
//         });
//       });
//     });

//     res.status(200).json(formattedApplications);
//   } catch (error) {
//     console.error('Error fetching applications:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

const viewApplications = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Company ID is required' });
    }

    // Fetch jobs and populate applicants
    const jobs = await Placement.find({ company: id }).populate(
      'applicants.student',
    );

    if (!jobs || jobs.length === 0) {
      return res
        .status(404)
        .json({ message: 'No job applications found for this company' });
    }

    // Transform applicants into the desired structure
    const formattedApplications = [];
    jobs.forEach((job) => {
      const { jobTitle } = job; // Extract the jobTitle for each job
      job.applicants.forEach((applicant) => {
        const { student, status, createdAt } = applicant;
        formattedApplications.push({
          id: applicant._id, // Unique ID for the application
          jobTitle, // Add the jobTitle
          studentName: `${student.firstName} ${student.lastName}`,
          department: student.education?.[0]?.department || 'N/A',
          email: student.emailID,
          phone: student.phone,
          skills: student.skills,
          socialProfile: student.socialProfile,
          gender: student.gender,
          state: student.state,
          city: student.city,
          jobCreatedDate: createdAt || '', // Use createdAt from applicant
          status: status || 'N/A',
          isActive: status === 'Active' ? true : false,
          resumeLink: student.resumeURL,
          profileImage: student.studentImgURL || '/default-profile.jpg',
        });
      });
    });

    // Sort the applications by createdAt in descending order
    formattedApplications.sort(
      (a, b) => new Date(b.jobCreatedDate) - new Date(a.jobCreatedDate),
    );

    res.status(200).json(formattedApplications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update application status
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Placement.findOneAndUpdate(
      { 'applicants._id': req.params.id },
      { $set: { 'applicants.$.status': status } },
      { new: true },
    );
    if (!application)
      return res.status(404).json({ message: 'Application not found' });
    res.status(200).json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// API to get company details and application stats
const getCompanyDetails = async (req, res) => {
  try {
    const companyId = req.params.id;
    // Validate the ObjectId
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ error: 'Invalid company ID.' });
    }

    // Fetch company details from User schema
    const companyDetails = await User.findById(companyId);

    if (!companyDetails) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Calculate application statistics
    const placements = await Placement.find({ company: companyId });

    let totalReceived = 0;
    let totalPending = 0;
    let totalShortlisted = 0;
    let totalSelected = 0;
    let totalRejected = 0;

    placements.forEach((placement) => {
      placement.applicants.forEach((applicant) => {
        totalReceived++;
        if (applicant.status === 'Shortlisted') totalShortlisted++;
        if (applicant.status === 'Selected') totalSelected++;
        if (applicant.status === 'Rejected') totalRejected++;
      });
    });

    // Construct response
    const response = {
      company: {
        _id: companyDetails._id,
        companyName: companyDetails.companyName,
        industry: companyDetails.industry,
        location: companyDetails.location,
        totalEmployees: companyDetails.totalEmployees,
        companyLogoUrl: companyDetails.companyImgUrl,
        hrName: companyDetails.hrName,
        companyPhoneNumber: companyDetails.companyPhoneNumber,
        companyDescription: companyDetails.companyDescription,
      },
      applications: {
        totalReceived,
        totalPending,
        totalShortlisted,
        totalSelected,
        totalRejected,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching company details:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getRecentApplications = async (req, res) => {
  try {
    const companyId = req.params.id;

    // Validate the ObjectId
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ error: 'Invalid company ID.' });
    }

    // Fetch the most recent 5 applications
    const placements = await Placement.find({ company: companyId })
      .populate({
        path: 'applicants.student', // Populate the 'student' field
        select: 'firstName lastName', // Select the required fields
      })
      .select('jobTitle applicants') // Fetch only the necessary fields
      .sort({ 'applicants.createdAt': -1 }) // Sort by most recent (descending order)
      .limit(5); // Limit to 5 records

    // Construct the response with recent applications
    const recentApplications = [];
    placements.forEach((placement) => {
      placement.applicants.forEach((applicant) => {
        if (applicant.student) {
          recentApplications.push({
            id: applicant._id, // Unique applicant ID
            jobTitle: placement.jobTitle,
            studentName: `${applicant.student.firstName} ${applicant.student.lastName}`,
          });
        }
      });
    });

    // Send only the top 5 recent applications
    res.status(200).json({
      message: 'Recent Applications',
      data: recentApplications.slice(0, 5), // Ensure the response contains at most 5 records
    });
  } catch (error) {
    console.error('Error fetching recent applications:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const getApplicationOverview = async (req, res) => {
  try {
    // Aggregate data from the Placement collection
    const data = await Placement.aggregate([
      {
        $project: {
          jobTitle: 1,
          applicationsReceived: { $size: '$applicants' },
          studentsSelected: {
            $size: {
              $filter: {
                input: '$applicants',
                as: 'applicant',
                cond: { $eq: ['$$applicant.status', 'Selected'] },
              },
            },
          },
        },
      },
    ]);

    // Format the data for the chart
    const responseData = {
      labels: data.map((item) => item.jobTitle),
      datasets: [
        {
          label: 'Applications Received',
          data: data.map((item) => item.applicationsReceived),
          backgroundColor: 'rgba(75,192,192,0.6)',
        },
        {
          label: 'Students Selected',
          data: data.map((item) => item.studentsSelected),
          backgroundColor: 'rgba(75,192,192,1)',
        },
      ],
    };

    res.status(200).json(responseData);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: 'Failed to fetch applications overview data' });
  }
};

const updateJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status } = req.body;

    // Find the placement by ID and update its Status to "De-Active"
    const placement = await Placement.findByIdAndUpdate(
      jobId,
      { status: status },
      { new: true, runValidators: true }, // Returns the updated document
    );

    if (!placement) {
      return res.status(404).json({ message: 'Placement not found' });
    }

    res
      .status(200)
      .json({ message: 'Placement deactivated successfully', placement });
  } catch (error) {
    console.error(error);
  }
};

const updateCompanyImageURL = async (req, res) => {
  try {
    const { id } = req.params;
    const { imgURL } = req.body;

    // Validate input
    if (!imgURL) {
      return res.status(400).json({ message: 'imgURL is required' });
    }

    // Find and update the resume URL
    const updatedUser = await User.findOneAndUpdate(
      { _id: id, userType: 'company' }, // Ensure the user is a student
      { $set: { companyImgUrl: imgURL } },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({
      message: 'Company Image updated successfully',
      updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      message: 'An error occurred while updating the Company Image',
      error: error.message,
    });
  }
};

const updateCompanyProfile = async (req, res) => {
  try {
    const { id } = req.params; // Get the user ID from the URL parameter
    const {
      companyName,
      companyImgUrl,
      industry,
      location,
      totalEmployees,
      hrName,
      companyPhoneNumber,
      companyDescription,
    } = req.body; // Destructure the updated fields from the request body

    // Validate request body (optional)
    if (!companyName || !companyPhoneNumber) {
      return res
        .status(400)
        .json({ message: 'Company name and phone number are required.' });
    }

    // Find and update the company profile
    const updatedProfile = await User.findByIdAndUpdate(
      id,
      {
        companyName,
        companyImgUrl,
        industry,
        location,
        totalEmployees,
        hrName,
        companyPhoneNumber,
        companyDescription,
      },
      { new: true, runValidators: true }, // Return the updated document and run validation
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: 'Company profile not found.' });
    }

    res.status(200).json({
      message: 'Company profile updated successfully.',
      data: updatedProfile,
    });
  } catch (error) {
    console.error('Error updating company profile:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
const scheduleInterview = async (req, res) => {
  try {
    const { date, time, mode, meetLinkorLocation } = req.body;

    const application = await Placement.findOneAndUpdate(
      { 'applicants._id': req.params.id },
      {
        $set: {
          'applicants.$.interviewDetails': {
            date,
            time,
            mode,
            meetLinkorLocation,
          },
        },
      },
      { new: true }, // Return the updated document
    );
    if (!application)
      return res.status(404).json({ message: 'Application not found' });
    res.status(200).json(application);

    res.status(200).json({
      message: 'Interview Scheduled successfully',
      application,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

module.exports = {
  createJob,
  viewJobs,
  getAllJobs,
  viewApplications,
  updateApplicationStatus,
  getCompanyDetails,
  getApplicationOverview,
  getRecentApplications,
  applyJobById,
  updateJobStatus,
  updateCompanyImageURL,
  scheduleInterview,
  updateCompanyProfile,
};
