const Job=require('../models/jobs');
const geoCoder=require('../utils/geocoder')
const ErrorHandler=require('../utils/errorHandler')
const mongoose=require('mongoose')
const catchAsyncError=require('../middlewares/catchAsyncErrors');
const APIFilters=require('../utils/api_filters');

//Get all Jobs => /api/v1/jobs

exports.getJobs= catchAsyncError( async (req,res,next)=>{
  
    const apiFilters=new APIFilters(Job.find(),req.query).filter().sort().limitFields().pagination();
    const jobs =await  apiFilters.query;
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
    job=await Job.findByIdAndDelete(req.params.id);
    res.status(200).json({
        succes:true,
        message: 'Job is deleted',
    })
})
//get a single job with id and slug
exports.getJob=catchAsyncError( async (req,res,next)=>{
    const job=await Job.find({$and :[{_id:req.params.id},{slug:req.params.slug}]});
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