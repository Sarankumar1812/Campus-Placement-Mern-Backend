// const mongoose = require('mongoose');

// const placementSchema = new mongoose.Schema(
//   {
//     jobTitle: { type: String, required: true },
//     company: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//     description: { type: String, required: true },
//     type: { type: String, enum: ['Full-Time', 'Internship'], required: true },
//     salary: { type: Number, required: true },
//     location: { type: String, required: true },
//     skills: { type: [String], required: true },
//     experience: { type: String },
//     interviewMode: { type: String, required: true },
//     deadline: { type: Date, required: true },
//     applicants: [
//       {
//         student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//         status: {
//           type: String,
//           enum: ['Pending', 'Shortlisted', 'Rejected', 'Selected'],
//           default: 'Pending',
//         },
//         interviewDetails: {
//           date: { type: String },
//           time: { type: String },
//           mode: { type: String, enum: ['Online', 'Offline', 'College'] },
//           meetLinkorLocation: { type: String },
//         },
//       },
//     ],
//     status: {
//       type: String,
//       enum: ['Active', 'De-Active'],
//       default: 'Active',
//       required: true,
//     },
//   },
//   {
//     timestamps: {
//       createdAt: 'crAt',
//       updatedAt: 'upAt',
//     },
//   },
// );

// module.exports = mongoose.model('Placement', placementSchema);


const mongoose = require('mongoose');

// Define a subdocument schema for applicants
const applicantSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['Pending', 'Shortlisted', 'Rejected', 'Selected'],
      default: 'Pending',
    },
    interviewDetails: {
      date: { type: String },
      time: { type: String },
      mode: { type: String, enum: ['Online', 'Offline', 'College'] },
      meetLinkorLocation: { type: String },
    },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  }
);

// Define the main schema
const placementSchema = new mongoose.Schema(
  {
    jobTitle: { type: String, required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    description: { type: String, required: true },
    type: { type: String, enum: ['Full-Time', 'Internship'], required: true },
    salary: { type: Number, required: true },
    location: { type: String, required: true },
    skills: { type: [String], required: true },
    experience: { type: String },
    interviewMode: { type: String, required: true },
    deadline: { type: Date, required: true },
    applicants: [applicantSchema], // Use the subdocument schema here
    status: {
      type: String,
      enum: ['Active', 'De-Active'],
      default: 'Active',
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: 'crAt',
      updatedAt: 'upAt',
    },
  }
);

module.exports = mongoose.model('Placement', placementSchema);
