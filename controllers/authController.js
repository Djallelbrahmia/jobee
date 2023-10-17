const User=require('../models/user');
const catchAsyncError=require('../middlewares/catchAsyncErrors');
const jwt=require('jsonwebtoken');
const ErrorHandler = require('../utils/errorHandler');
const sendToken=require('../utils/jwtToken');
const sendEmail=require('../utils/send_email');
const crypto=require('crypto');
//Register a new user=>/api/v1/register
exports.registerUser=catchAsyncError( async (req,res,next)=>{
const {name,email,password,role}=req.body;
console.log(req.body)
const user=await User.create({
    name,
    email,
    password,
    role,
});

sendToken(user,200,res,req);


})
//Login User=>/api/v1/login
exports.loginUser=catchAsyncError(
    async (req,res,next)=>{
        const {email,password}=req.body;
        console.log(email);
        console.log(password);

        //checks if email or password is entered by user
        if(!email || !password){
            return next(new ErrorHandler('please enter email || password',400))

        }
        //Finding user in database
        const user=await User.findOne({email:email}).select('+password');
        console.log(user)
        if(!user){
            return next(new ErrorHandler('Invalid Email or password',401))
        }
        const isPasswordMatched=await user.comparePassword(password);
        if(!isPasswordMatched){
            return next(new ErrorHandler('Invalid Email or password',401));
        }
        //create JsonWebToekn
        console.log('Here is the issue')
sendToken(user,200,res,req);
    }
)
//Forgot Password=> /api/V1/password/forgot
exports.forgotPassword=catchAsyncError(async(req,res,next)=>
{
    const user =await User.findOne({email:req.body.email});
    //Check user email is database 
    if(!user){
        return next(new ErrorHandler('No user found with this email.',404));
    }
    const resetToken=user.getResetToken();
    await user.save({validateBeforeSave:false});
    //Create reset password url 
    const resetUrl=`${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`;
    const message=`Your password reset link is as follow \n \n ${resetUrl} \n if you have not request it please ignore this email`;

   try{
    await sendEmail({
    email: user.email,
    subject:'Jobee password reset email',
    text:message,
})
res.status(200).json({
    success:true,
    message:`Email sent successfully to ${user.email}`
})}catch(error){
    user.resetPasswordExpire=undefined,
    user.resetPasswordToken=undefined,
await user.save();
return next(new ErrorHandler('failed to send the email',500));
}
    
})
//Reset password => /api/v1/password/reset/:token
exports.resetPassword=catchAsyncError(async(req,res,next)=>{
    // Hash url token 
    const resetPasswordToken=crypto.createHash('sha256').update(req.params.token).digest('hex');
const user=await User.findOne({resetPasswordToken:resetPasswordToken,resetPasswordToken:{$gt:Date.now()}});
if(!user){
    return next(new ErrorHandler('Password Reset token is invalid'),400);

}
//Setup new passwword 
user.password=req.body.password;
user.resetPasswordToken=undefined;
user.resetPasswordExpire=undefined;
await user.save({validateBeforeSave:false});
sendToken(user,200,res,req);

})
//Logout user=> /api/v1/logout
exports.logout=catchAsyncError((req,res,next)=>{
    res.cookie('token','none',{expires:new Date(Date.now()),
    httpOnly:true
    }).status(200).json({

        success:true,
        message:"loged out successfully"
    })
})