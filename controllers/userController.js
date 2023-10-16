const User=require('../models/user');
const catchAsyncError=require('../middlewares/catchAsyncErrors');
const ErrorHandler=require('../utils/errorHandler');
const sendToken=require('../utils/jwtToken');
// Get current user profil => /api/v1/me
exports.getUserProfil=catchAsyncError(async(req,res,next)=>{
const user=await User.findById(req.user.id);
res.status(200).json({
    success:true,
    data:user
})
})
//Update current user password => /api/v1/password/update
exports.updatepassword=catchAsyncError(async(req,res,next)=>{
    console.log(req.user);
    const userId=req.user._id;
    console.log(userId)
    const user=await User.findById(userId).select('+password');
    const isPasswordMatched=await user.comparePassword(req.body.currentPassword);
    if(!isPasswordMatched){
        return next(new ErrorHandler('Wrong password'),401);
    }
    user.password=req.body.newpPassword;

     await user.save({validateBeforeSave:false});

     sendToken(user,200,res,req);


})
//update Current user data =>/api/v1/me/update
exports.updateUser=catchAsyncError(async(req,res,next)=>{
    const newUserData={
        name : req.body.name,
        email: req.body.email
    }
    const user=await User.findByIdAndUpdate(req.user._id,newUserData,{new:true,runValidators:true,useFindAndModify:false});
res.status(200).json({
    success:false,
    data:user
});
})
//Delete current user => /api/v1/me/delete
exports.deleteUser=catchAsyncError( async (req,res,next)=>{
    const user=await User.findByIdAndDelete(req.user._id);
    res.cookie('token','none',{expires:new Date(Date.now())})
})