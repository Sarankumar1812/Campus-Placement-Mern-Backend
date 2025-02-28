const express = require('express');
const cors = require('cors');
const routes = require('./routes/routes');
const connectDB = require('./common/MongoDBConnection');
const companyRouter = require('./routes/companyRoutes');
const studentRouter = require('./routes/studentRouter');
const collegeRouter = require('./routes/collegeRouter');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// ✅ Enable CORS with specific frontend URL
app.use(cors({
  origin: 'https://campus-placement-mern-frontend.vercel.app', // Replace with your frontend URL
  methods: 'GET, POST, PUT, DELETE',
  credentials: true
}));

// ✅ Middleware
app.use(express.json());

// ✅ Routes
app.use('/api', routes);
app.use('/api/company', companyRouter);
app.use('/api/student', studentRouter);
app.use('/api/college', collegeRouter);

app.get('/', (req, res) => {
  res.send(`<h1>Placement Application Server is up and running on PORT: ${port}</h1>`);
});

// ✅ Connect to MongoDB
connectDB();

// ✅ Start server
app.listen(port, () => {
  console.log(`🚀 Server is up and running on PORT ${port}`);
});
