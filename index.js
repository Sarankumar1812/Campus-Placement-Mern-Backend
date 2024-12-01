const express = require('express');
const app = express();
const cors = require('cors');
const routes = require('./routes/routes');
const connectDB = require('./common/MongoDBConnection');
const companyRouter = require('./routes/companyRoutes');
const studentRouter = require('./routes/studentRouter');
const collegeRouter = require('./routes/collegeRouter');
const port = process.env.PORT || 5000;

//middleware
app.use(express.json());
app.use(cors()); // cors

app.use('/api', routes);
app.use('/api/company', companyRouter);
app.use('/api/student', studentRouter);
app.use('/api/college', collegeRouter);

app.get('/', (req, res) => {
  res.send(`<h1>Server is up and running on PORT: ${port}</h1>`);
});

// server connection
app.listen(port, (err) => {
  if (err) throw err;
  console.log(`Server is up and running on PORT ${port}`);
});

//mongoose connection
connectDB();
