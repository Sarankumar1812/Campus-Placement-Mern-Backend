const Placement = require('../models/Placement');
const User = require('../models/User');

const getCollegeDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const totalStudents = await User.countDocuments({ userType: 'student' });

    const collegeDetails = await User.findOne({
      _id: id,
      userType: 'college-staff',
    }).select(
      'firstName lastName emailID phone collegeName staffID staffImgURL',
    );

    const totalJobs = await Placement.countDocuments({ status: 'Active' });

    const studentsApplied = await Placement.aggregate([
      { $unwind: '$applicants' }, // Flatten the applicants array
      {
        $group: {
          _id: '$applicants.student', // Group by student ID
        },
      },
      { $count: 'count' }, // Count unique students
    ]);
    const totalStudentsApplied =
      studentsApplied.length > 0 ? studentsApplied[0].count : 0;

    const studentsPlaced = await Placement.aggregate([
      { $unwind: '$applicants' },
      {
        $match: {
          'applicants.status': 'Selected', // Only selected applicants
        },
      },
      {
        $group: {
          _id: '$applicants.student',
        },
      },
      { $count: 'count' },
    ]);
    const totalStudentsPlaced =
      studentsPlaced.length > 0 ? studentsPlaced[0].count : 0;

    const data = {
      totalStudents,
      collegeDetails,
      totalJobs,
      totalStudentsApplied,
      totalStudentsPlaced,
    };

    res.status(200).json({
      message: 'College Details fetched successfully',
      data,
    });
  } catch (error) {
    res.status(500).json({
      message: 'An error occurred while retrieving college details',
      error: error.message,
    });
  }
};

const getCollegeSummaryDetails = async (req, res) => {
  try {
    // Fetch department data
    const departmentData = await User.aggregate([
      { $match: { userType: 'student' } },
      { $unwind: '$education' },
      {
        $group: {
          _id: '$education.department',
          totalStudents: { $sum: 1 },
        },
      },
    ]);

    const placedData = await Placement.aggregate([
      { $unwind: '$applicants' },
      { $match: { 'applicants.status': 'Selected' } },
      {
        $lookup: {
          from: 'users',
          localField: 'applicants.student',
          foreignField: '_id',
          as: 'student',
        },
      },
      { $unwind: '$student' },
      { $unwind: '$student.education' },
      {
        $group: {
          _id: '$student.education.department',
          placedStudents: { $sum: 1 },
        },
      },
    ]);

    // Transform data to visualization format
    const labels = departmentData.map((dept) => dept._id);
    const totalStudents = departmentData.map((dept) => dept.totalStudents);
    const placedStudents = labels.map((label) => {
      const placed = placedData.find((p) => p._id === label);
      return placed ? placed.placedStudents : 0;
    });

    const departmentPlacementData1 = {
      labels,
      datasets: [
        {
          label: 'Total Students',
          data: totalStudents,
          backgroundColor: 'rgba(153,102,255,0.6)', // Purple
        },
        {
          label: 'Placed Students',
          data: placedStudents,
          backgroundColor: 'rgba(22, 163, 74,0.6)', // Green
        },
      ],
    };

    res.json(departmentPlacementData1);
  } catch (err) {
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
};

const getRecentPlacements = async (req, res) => {
  try {
    const recentPlacements = await Placement.find({
      'applicants.status': 'Selected',
    })
      .populate('company', 'companyName') // Populate companyName from User schema
      .populate('applicants.student', 'firstName lastName') // Populate student details
      .sort({ updatedAt: -1 }) // Sort by recent updates
      .limit(5); // Limit to the 5 most recent placements

    const response = recentPlacements.map((placement) => {
      return placement.applicants
        .filter((applicant) => applicant.status === 'Selected') // Filter only selected students
        .map((applicant) => ({
          jobTitle: placement.jobTitle,
          salary: placement.salary,
          companyName: placement.company?.companyName || 'Unknown Company', // Include companyName
          studentName: `${applicant.student.firstName} ${applicant.student.lastName}`, // Include student name
        }));
    });

    res.json(response.flat()); // Flatten nested arrays into a single array
  } catch (err) {
    console.error('Error fetching recent placements:', err);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
};

const getStudentsList = async (req, res) => {
  try {
    const studentsList = await User.find({ userType: 'student' });
    if (!studentsList) {
      return res.status(404).json({ message: 'Students data not found' });
    }

    res.status(200).json({
      message: 'Students list fetched successfully',
      studentsList,
    });
  } catch (error) {
    res.status(500).json({
      message: 'An error occurred while retrieving students list',
      error: error.message,
    });
  }
};

const getCompanyList = async (req, res) => {
  try {
    const companiesList = await User.find({ userType: 'company' });
    if (!companiesList) {
      return res.status(404).json({ message: 'Companies data not found' });
    }

    res.status(200).json({
      message: 'Companies list fetched successfully',
      companiesList,
    });
  } catch (error) {
    res.status(500).json({
      message: 'An error occurred while retrieving Companies list',
      error: error.message,
    });
  }
};

const updateCollegeProfile = async (req, res) => {
  try {
    const { id } = req.params; // ID of the college to update
    const {
      lastName,
      firstName,
      collegeName,
      location,
      staffID,
      staffImgURL,
      state,
      city,
    } = req.body; // Destructure request body

    // Validate required fields (if necessary)
    if (!collegeName || !location) {
      return res
        .status(400)
        .json({ message: 'College name and location are required.' });
    }

    // Find and update the college-specific fields
    const updatedProfile = await User.findByIdAndUpdate(
      id,
      {
        lastName,
        firstName,
        collegeName,
        location,
        staffID,
        staffImgURL,
        state,
        city,
      },
      { new: true, runValidators: true }, // Return the updated document and run schema validation
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: 'College profile not found.' });
    }

    res.status(200).json({
      message: 'College profile updated successfully.',
      data: updatedProfile,
    });
  } catch (error) {
    console.error('Error updating college profile:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


const updateCollegeImageURL = async (req, res) => {
  try {
    const { id } = req.params;
    const { imgURL } = req.body;

    // Validate input
    if (!imgURL) {
      return res.status(400).json({ message: 'imgURL is required' });
    }

    // Find and update the resume URL
    const updatedUser = await User.findOneAndUpdate(
      { _id: id, userType: 'college-staff' }, // Ensure the user is a student
      { $set: { staffImgURL: imgURL } },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'College not found' });
    }

    res.status(200).json({
      message: 'Image updated successfully',
      updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      message: 'An error occurred while updating the profile image',
      error: error.message,
    });
  }
};

module.exports = {
  getStudentsList,
  getCompanyList,
  getCollegeDetails,
  getCollegeSummaryDetails,
  getRecentPlacements,
  updateCollegeProfile,
  updateCollegeImageURL
};
