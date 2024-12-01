const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { jwtConstants } = require('../common/jwtConstants');

const signup = async (req, res) => {
  const {
    userType,
    firstName,
    lastName,
    emailID,
    phone,
    password,
    staffID,
    company,
    studentID,
    location,
    totalEmployees,
    industry,
  } = req.body;

  try {
    const newUser = new User({
      userType,
      firstName,
      lastName,
      emailID,
      phone,
      password,
      staffID:
        userType === 'college-staff' || userType === 'company'
          ? staffID
          : undefined,
      companyName: userType === 'company' ? company : undefined,
      studentID: userType === 'student' ? studentID : undefined,
      location,
      totalEmployees,
      industry,
    });

    const savedUser = await newUser.save();

    res
      .status(201)
      .json({ message: 'User registered successfully', user: savedUser });
  } catch (error) {
    console.error('Error saving user:', error.message);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

const signin = async (req, res) => {
  try {
    const { emailID, password } = req.body;

    let userExists = await User.findOne({ emailID: emailID });

    if (!userExists) {
      return res.json({ message: 'emailID not found!' });
    }
    if (userExists) {
      let pwdCheck = password === userExists.password;
      if (!pwdCheck) {
        return res.json({ message: 'Password is invalid!' });
      }
      let userToken = jwt.sign(
        {
          _id: userExists._id,
          firstName: userExists.firstName,
          lastName: userExists.lastName,
          userType: userExists.userType,
          collegeName: userExists.collegeName || '',
          subTitle:
            userExists.collegeName ||
            userExists.companyName ||
            userExists.profileHeadLine ||
            '',
          imgUrl:
            userExists.companyImgUrl ||
            userExists.studentImgURL ||
            userExists.staffImgURL ||
            '',
        },
        jwtConstants.secretKey,
        { expiresIn: jwtConstants.exp_time },
      );

      let userData = {
        _id: userExists._id,
        firstName: userExists.firstName,
        lastName: userExists.lastName,
        userType: userExists.userType,
        userToken,
      };
      return res.status(200).json({
        status: 200,
        userData,
      });
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    // Validate user by email
    const user = await User.findOne({ emailID: email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
};

module.exports = {
  signup,
  signin,
  forgotPassword,
};
