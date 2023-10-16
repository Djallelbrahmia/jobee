const express=require('express');
const router =express.Router();
const { getUserProfil,updatepassword,updateUser,deleteUser}= require('../controllers/userController');
const {isAuthenticatedUser}=require('../middlewares/auth');
router.get('/me',isAuthenticatedUser,getUserProfil);
router.put('/password/update',isAuthenticatedUser,updatepassword);
router.put('/me/update',isAuthenticatedUser,updateUser);
router.delete('/me/delete',isAuthenticatedUser,deleteUser);
module.exports=router;