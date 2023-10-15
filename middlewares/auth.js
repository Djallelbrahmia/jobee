const jwt=require('jsonwebtoken');
const User=require('../models/user');
const ErrorHandler=require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const errors = require('./errors');

//check if user is authenticated or not
exports.isAuthenticatedUser=catchAsyncErrors(
    async (req,res,next)=>{

        let token ;
        console.log(req.headers)
        if(req.headers.authorization ){
            if(req.headers.authorization.split(' ')[0]==='Bearer'){       
                    token=req.headers.authorization.split(' ')[1]; 
        }
        }
        if(!token){
            let   err=new ErrorHandler('You must login first',401);
            return next(err)
        }
        const decoded=jwt.verify(token, process.env.JWT_SECRET);

        req.user=await User.findById(decoded.id);
        next();
    }
)
//handling users roles
exports.authorizeRoles=(...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return next(new ErrorHandler(`Role(${req.user.role}) is not allowed to access this resource .`,403))
        }
        next();
    }
}