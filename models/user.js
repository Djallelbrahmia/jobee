const mongoose=require('mongoose');
const validator=require('validator');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');

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
    resetPasswordExpire:Date
})
//encrypting password before saving\
userSchema.pre('save',async function(){
this.password=await bcrypt.hash(this.password,10);
})
//Return JSON web token
userSchema.methods.getJWtToken=function(){
    console.log('hey');
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
module.exports=mongoose.model('User',userSchema);