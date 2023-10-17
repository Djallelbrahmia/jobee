const express=require('express');
const router=express.Router();
//Importing controllers 
const jobsController=require('../controllers/jobsController')
const {isAuthenticatedUser,authorizeRoles}=require('../middlewares/auth');
router.get('/jobs',jobsController.getJobs)
router.get('/job/:id/:slug',jobsController.getJob)
router.post('/job/new',isAuthenticatedUser,authorizeRoles('admin','employeer'),jobsController.newJob)
router.get('/jobs/:zipcode/:distance',jobsController.getJobsInRadius);
router.get('/stats/:topic',jobsController.jobStats);
router.put('/job/:id',jobsController.updateJob);
router.delete('/job/:id',jobsController.deleteJob);
router.put('/job/:id/apply',isAuthenticatedUser,authorizeRoles('user'),jobsController.applyJob);
module.exports=router;