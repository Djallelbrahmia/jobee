const User=require('../models/user');
const catchAsyncError=require('../middlewares/catchAsyncErrors');
const ErrorHandler=require('../utils/errorHandler');
const sendToken=require('../utils/jwtToken');
const Job=require('../models/jobs');
const fs=require('fs');
const APIFilters = require('../utils/api_filters');
// Get current user profil => /api/v1/me
exports.getUserProfil=catchAsyncError(async(req,res,next)=>{
const user=await User.findById(req.user.id).populate({
    path:"jobpublished",
    select :'title postingDate'
});
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
        email: req.body.email,
        role:req.body.role
    }
    const user=await User.findByIdAndUpdate(req.user._id,newUserData,{new:true,runValidators:true,useFindAndModify:false});
res.status(200).json({
    success:true,
    data:user
});
})
//show all applied jobs => /api/v1/jobs/applied
exports.getAppliedJobs=catchAsyncError(
    async (req,res,next)=>{
        console.log('hey')
        const jobs=await Job.find({"applicantsApplied.id":req.user._id}).select("+applicantsApplied");
    res.status(200).json({
        success:true,
        results:jobs.length,
        data:jobs
    })
    }
)
//Show all jobs published by employeer => /api/v1/me/jobs/published
exports.getPublishedJobs=catchAsyncError(async (req,res,next)=>{
  const jobs=await Job.find({user:req.user._id})  
  res.status(200).json({
    success:true,
    results:jobs.length,
    data:jobs
  })
})
//Delete current user => /api/v1/me/delete
exports.deleteUser=catchAsyncError( async (req,res,next)=>{
   await deleteUserData(req.user,req.user.role)
   console.log("deleted")
    await User.findByIdAndDelete(req.user._id);
    console.log("user deleted");
    res.cookie('token','none',{expires:new Date(Date.now()),httpOnly:true}).status(200).json({success:true,
    message:"your Account has been deleted "
    })
})
// Adding controller methods that only acessible by admins
// show all user=>/api/v1/users
exports.getUsers=catchAsyncError(async (req,res,next)=>{
    const apiFilters=new APIFilters(User.find(),req.query).filter().sort().limitFields().pagination();
    const users=await apiFilters.query;
    res.status(200).json({
        success:true,
        results:users.length,
        data:users
    })

})
async function deleteUserData(user,role){
    if(role==="employeer"){
        await Job.deleteMany({user:user});

    }
    console.log('ROLE :')
    console.log(role)
    if(role==="user"){
        console.log('first');
        const appliedJobs=await Job.find({"applicantsApplied.id":user._id}).select("+applicantsApplied");
        for(let i=0;i<appliedJobs.length;i++){
            console.log("inner for")
            let obj= appliedJobs[i].applicantsApplied.filter(o=>o.id.toString()===user._id.toString());
            console.log(obj);
            let filepath=`${__dirname}/public/upload/${obj[0].resume}`.replace('/controllers','');
           console.log(filepath);
              fs.unlink(
                filepath,err=>{
                    if(err){
                        return console.log(err);
                    }
                }
            )
            console.log(obj[i]);
            appliedJobs[i].applicantsApplied.splice(
                appliedJobs[i].applicantsApplied.indexOf(obj[i])
            )
            console.log("succes");
           await appliedJobs[i].save({validateBeforeSave:false});

        }
    }
}