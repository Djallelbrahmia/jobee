const mongoose=require('mongoose');
const validator=require('validator');
const slugify=require('slugify');
const geoCoder=require('../utils/geocoder')
const JobSchema=new mongoose.Schema({
    title:{
        type:String,
        required:[true,'please enter Job title'],
        trim:true,
        maxlength:[100,'Job title can not exceed 100 characters'],

    },
    location:{
        type:{
            type:String,
            enum:['Point'],
        },
        coordinate:{
            type:[Number],
            index:'2dsphere'
        },
        formattedAdress:String,
        city:String,
        state:String,
        zipcode:String,
        country:String,
    },
    slug: String,
    description : {
        type: String,
        required:[true,'please enter job description '],
        maxlength:[100,'job description can not exceed 100 characters'],
    },
    email:{
        type:String,
        validate:[validator.isEmail,'please add a valid email'],

    },
    address:{
        type:String,
        required :[true,'Please add an adress .']
    },
    company:{
        type :String,
        required:[true,'Please add Company name']
    },
    industry : {
        type : [String],
        required:[true,'please enter a job industry' ],
        enum:{values:['Business','Information Technology','Banking','Education','Engineering','others'],message:'please select correct options'}
    },
    jobType:{
        type:String,
        required:[true,'please enter a job type'],
        enum:{
            values:['Permanent','Temporary','Internship'],message:'please select a correct job type'
        }
    },
    minEducation:{
        type :String,
        required:[true,'please enter minimum for this job'],
        enum: {values:['Bachelors','Masters','Phd'],
        message:'please select correct options for education'}
    },
    positions:{
        type:Number,
        default:1,
    },
    experience: {
        type:String,
        required:[true,'please enter exprience for this job'],
        enum:{values:["No Experience","1-2 Years","2-5 years","5 years +"],message:"Please select correct options for education"},
    },
    salary:{
        type:Number,
        required:[true,'Please enter Expected salary for this job'],
        
    },
    postingDate:{
        type:Date,
        default:Date.now,
    },
    lastDate:{
        type:Date,
        default:new Date().setDate(new Date().getDate()+7),
    },
    applicantsApplied:{
        type:[Object],
        select:false,
    },


})
//Creating Job slug before saving

JobSchema.pre('save',function(next){
    //Creating slug before saving to DB
    this.slug=slugify(this.title,{lower:true});
    next();
})
//Setting up location
JobSchema.pre('save',async function(next){
const loc=await geoCoder.geocode(this.address);
this.location={
    type:'Point',
    coordinate:[loc[0].longitude,loc[0].latitude],
    formattedAdress:loc[0].formattedAddress,
    city:loc[0].city,
    state:loc[0].stateCode,
    zipcode:loc[0].zipcode,
    country:loc[0].countryCode,


}
})
module.exports=mongoose.model('Job',JobSchema);
// Search jobs with radius=> /api/v1/jobs/:zipcode/:distance
