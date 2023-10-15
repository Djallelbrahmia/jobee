const ErrorHandler=require('../utils/errorHandler');
module.exports=(err,req,res,next)=>{
    err.statusCode=err.statusCode||500;
    err.message=err.message||'Intenal Server Error'

    if(process.env.NODE_ENV==='development'){
        if(err.name==='CastError'){
           const  message=`Ressource Not found . invalid ${
                err.path
            }`;
             err=new ErrorHandler(message,404);

        }

        if(err.name==='ValidationError'){
            const   message=Object.values(err.errors).map(value=>value.message);
               err=new ErrorHandler(message,404);
  
          }
          //Handle mongoose Dublicate key err

          
if(err.code==="11000"){
    const message=`Dublicate ${Object.keys(err.keyValue)} entered.`
    err =new ErrorHandler(message,400);

}



res.status(err.statusCode).json({
    success:false,
    error:err,
    errorStack:err.stack,
    errorMessage:err.message
});
    }
    if(process.env.NODE_ENV==='production'){
        //Wrong mongoose Object ID
        if(err.name==='CastError'){
          const   message=`Ressource Not found . invalid ${
                err.path
            }`;
             err=new ErrorHandler(message,404);

        };
        if(err.name==='ValidationError'){
          const   message=Object.values(err.errors).map(value=>value.message);
             err=new ErrorHandler(message,404);

        }
//Handle mongoose Dublicate key err
if(err.code="11000"){
    const message=`Duplicate ${Object.keys(err.keyValue)} entered.`
    err =new ErrorHandler(message,400);

}

        res.status(err.statusCode).json({
            success:false,

            errorMessage:err.message
        });
            }
            res.status(err.statusCode).json({
                success:false,
    
                errorMessage:err.message
            });
    
}