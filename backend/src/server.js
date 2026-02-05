const app = require('./app');
const connectDB = require('./config/db');
const CronJobService = require('./services/cron.service');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

connectDB();

// Initialize cron jobs
CronJobService.initializeCronJobs();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});