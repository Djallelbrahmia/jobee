const express=require('express');
const router =express.Router();
const { getUserProfil,updatepassword,updateUser,deleteUser,getAppliedJobs,getPublishedJobs,getUsers,deleteUserAmin}= require('../controllers/userController');
const {isAuthenticatedUser,authorizeRoles}=require('../middlewares/auth');
router.use(isAuthenticatedUser);
router.get('/me',getUserProfil);
router.put('/password/update',updatepassword);
router.put('/me/update',updateUser);
router.delete('/me/delete',deleteUser);
router.get('/me/jobs/applied',authorizeRoles('user'),getAppliedJobs)
router.get('/me/jobs/published',authorizeRoles('employeer','admin'),getPublishedJobs)
//admin only route
router.get('/admin/users',authorizeRoles("admin"),getUsers);
router.delete('/admin/users/:id',authorizeRoles("admin"),deleteUserAmin);

module.exports=router;