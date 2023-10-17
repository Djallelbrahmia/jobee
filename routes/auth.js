const express=require('express');
const router =express.Router();
const {registerUser,loginUser,forgotPassword,resetPassword,logout}=require('../controllers/authController');
router.get('/register',registerUser);
router.post('/login',loginUser);
router.post('/password/reset',forgotPassword);
router.put('/password/reset/:token',resetPassword);
router.get('/logout/',logout);
module.exports=router;
