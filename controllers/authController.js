const User=require('../models/user');
const catchAsyncError=require('../middlewares/catchAsyncErrors');
const jwt=require('jsonwebtoken');
const ErrorHandler = require('../utils/errorHandler');
const sendToken=require('../utils/jwtToken');
//Register a new user=>/api/v1/register
exports.registerUser=catchAsyncError( async (req,res,next)=>{
const {name,email,password,role}=req.body;
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