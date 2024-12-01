const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    userType: {
      type: String,
      enum: ['student', 'company', 'college-staff'],
      required: true,
    },
    firstName: { type: String, required: true },
    lastName: { type: String },
    emailID: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    collegeName: { type: String },
    staffID: { type: String },
    staffImgURL: { type: String },

    // Student-specific fields
    studentID: { type: String },
    profileHeadLine: { type: String, default: '' },
    gender: { type: String },
    state: { type: String },
    city: { type: String },
    studentImgURL: { type: String },
    resumeURL: { type: String },
    skills: [{ type: String }],
    socialProfile: {
      LinkedInUrl: { type: String },
      GithubUrl: { type: String },
    },
    education: [
      {
        educationType: { type: String },
        collegeName: { type: String },
        department: { type: String },
        specialization: { type: String },
        startYear: { type: Number },
        endYear: { type: Number },
      },
    ],
    projects: [
      {
        projectTitle: { type: String },
        projectDescription: { type: String },
        projectSkills: { type: String },
        projectLink: { type: String },
      },
    ],

    // Company-specific fields
    companyName: { type: String },
    companyImgUrl: { type: String },
    industry: { type: String },
    location: { type: String },
    totalEmployees: { type: Number },
    hrName: { type: String },
    companyPhoneNumber: { type: String },
    companyDescription: { type: String },
  },
  {
    timestamps: {
      createdAt: 'crAt',
      updatedAt: 'upAt',
    },
  },
);

const User = mongoose.model('User', userSchema);

module.exports = User;
