const express=require('express');
const router =express.Router();
const { getUserProfil,updatepassword,updateUser,deleteUser,getAppliedJobs,getPublishedJobs,getUsers}= require('../controllers/userController');
const {isAuthenticatedUser,authorizeRoles}=require('../middlewares/auth');
router.get('/me',isAuthenticatedUser,getUserProfil);
router.put('/password/update',isAuthenticatedUser,updatepassword);
router.put('/me/update',isAuthenticatedUser,updateUser);
router.delete('/me/delete',isAuthenticatedUser,deleteUser);
router.get('/me/jobs/applied',isAuthenticatedUser,authorizeRoles('user'),getAppliedJobs)
router.get('/me/jobs/published',isAuthenticatedUser,authorizeRoles('employeer','admin'),getPublishedJobs)
//admin only route
router.get('/admin/users',isAuthenticatedUser,authorizeRoles("admin"),getUsers);
module.exports=router;