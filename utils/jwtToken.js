//Create and send token and save in cookie
const sendToken=(user,statusCode,res,req)=>{
    //Create JWT Token 
    const token=user.getJWtToken();
    
    //Options for cookie
    const options={
        expires:new Date(Date.now()+process.env.COOKIE_EXPIRES_TIME*86400),
        httpOnly:true
    };
    if(process.env.NODE_ENV==='production'){
        options.secure=true;
    }
    res.status(statusCode).cookie('token',token,options).json({
        success:true,
        token:token
    })
}
module.exports=sendToken;