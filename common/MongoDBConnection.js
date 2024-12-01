const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect( process.env.MONGODB_URL,
      // 'mongodb+srv://nishanthgiri123:T2IgxzQUoSskM0Ty@cluster0.gpxfjbf.mongodb.net/pms',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    );
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
