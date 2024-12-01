const Placement = require('../models/Placement');
const User = require('../models/User');

const updateStudentResumeURL = async (req, res) => {
  try {
    const { id } = req.params;
    const { resumeURL } = req.body;

    // Validate input
    if (!resumeURL) {
      return res.status(400).json({ message: 'resumeURL is required' });
    }

    // Find and update the resume URL
    const updatedUser = await User.findOneAndUpdate(
      { _id: id, userType: 'student' }, // Ensure the user is a student
      { $set: { resumeURL } },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({
      message: 'Resume URL updated successfully',
      updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      message: 'An error occurred while updating the resume URL',
      error: error.message,
    });
  }
};

const updateStudentImageURL = async (req, res) => {
  try {
    const { id } = req.params;
    const { imgURL } = req.body;

    // Validate input
    if (!imgURL) {
      return res.status(400).json({ message: 'imgURL is required' });
    }

    // Find and update the resume URL
    const updatedUser = await User.findOneAndUpdate(
      { _id: id, userType: 'student' }, // Ensure the user is a student
      { $set: { studentImgURL: imgURL } },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({
      message: 'Student Image updated successfully',
      updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      message: 'An error occurred while updating the Student Image',
      error: error.message,
    });
  }
};

const updateStudentProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate if the user exists and is a student
    const user = await User.findOne({ _id: id, userType: 'student' });
    if (!user) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Update fields
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true },
    );

    res.status(200).json({
      message: 'Profile updated successfully',
      updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      message: 'An error occurred while updating the profile',
      error: error.message,
    });
  }
};

const getStudentProfileById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if the user exists and is a student
    const user = await User.findOne({ _id: id, userType: 'student' });
    if (!user) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: 'An error occurred while get student record',
      error: error.message,
    });
  }
};

const getJobsList = async (req, res) => {
  const { studentId } = req.params;

  try {
    let jobs;
    // Fetch jobs and populate company details
    if (studentId == 0) {
      jobs = await Placement.find({ status: 'Active' })
        .populate('company', 'companyName companyImgUrl')
        .sort({ crAt: -1 })
        .limit(3);
    } else {
      jobs = await Placement.find({ status: 'Active' })
        .populate('company', 'companyName companyImgUrl')
        .sort({ crAt: -1 });
    }

    // Format the response with application status for the current student
    const formattedJobs = jobs.map((job) => {
      const alreadyApplied = job.applicants.some(
        (applicant) => applicant.student.toString() === studentId,
      );

      return {
        _id: job._id,
        title: job.jobTitle,
        company: job.company,
        job: job,
        company: job.company?.companyName || 'Unknown',
        salary: job.salary || 'Not disclosed',
        location: job.location,
        description: job.description,
        tags: job.skills,
        interviewMode: job.interviewMode,
        lastDateForApply: job.deadline,
        datePosted: job.createdAt || job.crAt || '25-Nov-2024',
        logo: job.company?.companyImgUrl || 'default-logo-url.png',
        applicationStatus: alreadyApplied ? 'Applied' : 'New',
      };
    });

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

const getAppliedJobsByStudentId = async (req, res) => {
  const { studentId } = req.params;

  try {
    // Validate if the student exists
    const student = await User.findById(studentId);
    if (!student || student.userType !== 'student') {
      return res
        .status(404)
        .json({ message: 'Student not found or invalid user type' });
    }

    // Fetch all placements the student has applied for
    const appliedJobs = await Placement.find({
      'applicants.student': studentId,
    })
      .populate('company', 'companyName companyImgUrl location') // Populate company details
      .select(
        'jobTitle description type salary location skills deadline applicants.status applicants.student applicants.interviewDetails',
      ); 

    if (!appliedJobs || appliedJobs.length === 0) {
      return res
        .status(200)
        .json({ message: 'No jobs found for this student', appliedJobs: [] });
    }

    // Filter applicant-specific data for the student
    const jobsWithStatus = appliedJobs.map((job) => {
      const applicantData = job.applicants.find(
        (applicant) => applicant?.student?.toString() === studentId,
      );
      return {
        jobTitle: job.jobTitle,
        description: job.description,
        type: job.type,
        salary: job.salary,
        location: job.location,
        skills: job.skills,
        deadline: job.deadline,
        company: job.company,
        status: applicantData ? applicantData.status : 'Not Found',
        interviewDetails: applicantData?.interviewDetails || {},
      };
    });

    res.status(200).json({ appliedJobs: jobsWithStatus });
  } catch (error) {
    console.error('Error fetching applied jobs:', error);
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
};

const getStudentsAppliedJobs = async (req, res) => {
  try {
    // Fetch placements where students have applied
    const appliedJobs = await Placement.find({
      'applicants.student': { $exists: true },
    })
      .populate({
        path: 'company',
        select: 'companyName industry location companyImgUrl', // Select company details
      })
      .populate({
        path: 'applicants.student',
        select: 'firstName lastName state skills studentImgURL emailID', // Select student details
      })
      .lean();

    // Map through each job and extract relevant details
    const allAppliedJobs = appliedJobs.map((job) => {
      return {
        jobTitle: job.jobTitle,
        description: job.description,
        type: job.type,
        salary: job.salary,
        location: job.location,
        skills: job.skills,
        deadline: job.deadline,
        company: job.company, // Populated company details
        applicants: job.applicants.map((applicant) => ({
          student: applicant.student, // Populated student details
          applicationStatus: applicant.status,
          interviewDetails: applicant.interviewDetails,
        })),
      };
    });
    res.status(200).json({ allAppliedJobs });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: err.message });
  }
};

module.exports = {
  updateStudentProfile,
  updateStudentResumeURL,
  getStudentProfileById,
  getJobsList,
  updateStudentImageURL,
  getAppliedJobsByStudentId,
  getStudentsAppliedJobs,
};
