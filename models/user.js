const mongoose=require('mongoose');
const validator=require('validator');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const crypto=require('crypto');
const userSchema=new mongoose.Schema({
    name:{
        type: String,
        required:[true,'please enter your name']
    },
    email:{
        type: String,
        required:[true,'please enter your email'],
        unique:true,
        validator:[validator.isEmail,'please enter valid email adress'],
    },
    role:{
        type:String,
        enum:{
            values:['user','employeer'],
            message:'Please select correct role'
        },
        default:'user'
    },
    password:{
    type:String,
    required:[8,'Your password must be at least 8 characters long']
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date,
    
},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})
//encrypting password before saving\
userSchema.pre('save',async function(){
    if(this.isModified('password')){
        this.password=await bcrypt.hash(this.password,10);
    }
})
//Return JSON web token
userSchema.methods.getJWtToken=function(){
 return jwt.sign({
        id:this._id
    },process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES_TIME
    })
}
// compare user password
userSchema.methods.comparePassword=async function(enterPassword){
    console.log("right here");
    return await bcrypt.compare(enterPassword,this.password);
}
userSchema.methods.getResetToken= function(){
    const resetToken=crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken=crypto.createHash('sha256').update(resetToken).digest('hex');
this.resetPasswordExpire=Date.now()+3600;
return resetToken;
}
//Show all jobd create by user using virtuals
userSchema.virtual('jobpublished',{
    ref:'Job',
    localField:"_id",
    foreignField:"user",
    justOne:false
})
module.exports=mongoose.model('User',userSchema);