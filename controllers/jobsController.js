const Job=require('../models/jobs');
const geoCoder=require('../utils/geocoder')
const ErrorHandler=require('../utils/errorHandler')
const mongoose=require('mongoose')
const catchAsyncError=require('../middlewares/catchAsyncErrors');
const APIFilters=require('../utils/api_filters');
const path=require('path');
const fs=require('fs');

//Get all Jobs => /api/v1/jobs

exports.getJobs= catchAsyncError( async (req,res,next)=>{
  console.log("hello");
    const apiFilters=new APIFilters(Job.find(),req.query).filter().sort().limitFields().pagination();
    console.log("hello again ");

    const jobs =await  apiFilters.query;
    console.log("hello again and again  ");

    console.log(jobs)
    res.status(200).json({
        succes:true,
        results:jobs.length,
        data:jobs
    })
})

//Create à New Job= = /api/v1/job/new
exports.newJob=catchAsyncError( async (req,res,next)=>{
req.body.user=req.user.id;
const job = await Job.create(req.body);
res.status(200).json({
    succes:true,
    message:'Job Created .',
    data:job,
});
})
//update  a Job
exports.updateJob=catchAsyncError( async(req,res,next)=>{
    const jobId = req.params.id;


    let job =await Job.findById(req.params.id);
    if(!job){
        return next(new Error('Job not found'));   
    }
    //Check if user is owner
    if(job.user.toString()!==req.user._id.toString()&& req.user.role!=="admin"){
      return next(new ErrorHandler("You are not allowed to update this job",400))  
    }
    job=await Job.findByIdAndUpdate(req.params.id,req.body ,{
        new:true,
        runValidators:true 
    });
    res.status(200).json({
        succes:true,
        message :'job is updated',
        data:job,
    });
})
// Delete a Job => /Api/V1/job/:id
exports.deleteJob=catchAsyncError( async (req,res,next)=>{
    const jobId = req.params.id;

    // Check if jobId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return next(new Error('Invalid ObjectId'));
    }
    let job =await Job.findById(req.params.id);
    if(!job){
        return next(new Error('Job not found'));

        
    }
    //Check if user is owner
    if(job.user.toString()!==req.user.id.toString()&& req.user.role!=="admin"){
        return next(new ErrorHandler("You are not allowed to Delete this job",400))  
      }
    //Deleting files associated with job
    const delJob= await Job.findById(req.params.id).select("+applicantsApplied");
    console.log(delJob.applicantsApplied)
    for(let i=0;i<delJob.applicantsApplied.length;i++){
        let filepath=`${__dirname}/public/upload/${delJob.applicantsApplied[i].resume}`.replace('/controllers','');
              fs.unlink(
                filepath,err=>{
                    if(err){
                        return console.log(err);
                    }
                }
            )
    }

    job=await Job.findByIdAndDelete(req.params.id);
    res.status(200).json({
        succes:true,
        message: 'Job is deleted',
    })
})
//get a single job with id and slug
exports.getJob=catchAsyncError( async (req,res,next)=>{
    const job=await Job.find({$and :[{_id:req.params.id},{slug:req.params.slug}]}).populate(
      {  path:"user",
    select:"name"
    }
    );
    if(!job || job.length===0){
        return res.status(404).json({
sucess:false,
message:'Job not found',
        });
    }
    res.status(200).json({
        success:true,
        data:job
    })
})
exports.getJobsInRadius=catchAsyncError( async (req,res,next)=> {
    const {zipcode,distance}=req.params;
         // Getting latitude & longitude from geocoder with zip Code
     const loc =  await geoCoder.geocode(zipcode);
     const latitude=loc[0].latitude; 
     const longitude=loc[0].longitude;
     const radius=distance/3963
     const jobs=await Job.find({
        location:{$geoWithin:{$centerSphere:[[longitude,latitude],radius]}}
     });
     res.status(200).json({
        succes:true,
        result:jobs.length,
        data:jobs,
     })
})
//Get Stats about a topic
exports.jobStats=catchAsyncError( async(req,res,next)=>{
    const stats=await Job.aggregate([
{$match:{
    $text:{$search:"\""+req.params.topic+"\""}
}},{
    $group:{
        _id:{$toUpper:'$experience'},
        totalJobs:{$sum:1},
        avgPosition:{$avg:'$positions'},
        avgSalary:{$avg:'$salary'},
        minSalary:{$max:'$salary'},
        minSalary:{$max:'$salary'},

    }
}

    ]);
    if(stats.length===0){
        return next(new ErrorHandler('Job not found',200)) 
        
    }
    res.status(200).json({
        success:true,
        data: stats
    })
})
//Apply to job using Resume => /api/v1/job/:id/apply
exports.applyJob=catchAsyncError(async(req,res,next)=>{
    let job  =await Job.findById(req.params.id).select('+applicantsApplied');
    if(!job){
        return next(new ErrorHandler('job not found',404));
    }
    if(job.lastDate< new Date(Date.now())){
        return next(new ErrorHandler('You can not apply to this job , Last date to apply is over',400));
    }
    //Check the files
    if(!req.files){
        return next(new ErrorHandler('Please upload file .',400));
    }
    const file=req.files.file;
    //Check file type
    const supportedFile=/.docs||.pdf/;
    if(!supportedFile.test(path.extname(file.name))){
            return next(new ErrorHandler('please upload document file .',400));
    }
    //Check document size
    console.log(file.size)
    if(file.size>process.env.MAX_FILE_SIZE){
return next(new ErrorHandler(`Please upload file less than ${process.env.MAX_FILE_SIZE}MB`,400));

    }
    console.log(process.env.UPLOAD_PATH);
    //Renaming resume 
    file.name=`${req.user.name.replace(' ',' -')}_${job._id}${path.parse(file.name).ext}`;
    try{file.mv(`${process.env.UPLOAD_PATH}/${file.name}`);}
    catch(err){
    
            console.log(err);
            return next(new ErrorHandler('resume upload filed',500));
        
    }
    //Check if user has applied before
    for(let i=0; i<job.applicantsApplied.length;i++){

        
        if(job.applicantsApplied[i].id.toString()===req.user._id.toString()){
            console.log('yes it is')
            return next(new ErrorHandler("You already applied for this job",400));
        }
    }
    console.log("outside the loop");

    await Job.findByIdAndUpdate(req.params.id,{$push:{
        applicantsApplied:{
            id:req.user._id,
            resume:file.name,

        }
    }},{
        new:true,
        runValidators:true,
        useFindAndModify:false,
    })
    res.status(200).json({
        succes:true,
        message:"Resume Update successfully",
        data:file.name
    })

})