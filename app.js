const express=require('express');
const app=express();
const cookieParser=require('cookie-parser');

const dotenv=require('dotenv');
const errorMiddleware=require('./middlewares/errors');
const ErrorHandler=require('./utils/errorHandler');
// SETTING UP Config.env;
dotenv.config({path:'./config/confing.env'});

// Handling Uncaught Exception
process.on('uncaughtException',err=>{
    process.exit(1);
})
// importing modules
const connectDatabase=require('./config/database');
//connecting to database
connectDatabase();
// Setup Body paser
app.use(express.json());
app.use(cookieParser());
// importing all routes
const jobs =require('./routes/jobs');
const auth =require('./routes/auth');
const user =require('./routes/user');


app.use('/api/v1',jobs);
app.use('/api/v1',auth);
app.use('/api/v1',user);


app.all('*',(req,res,next)=>{
next(new ErrorHandler(`${req.originalUrl} not found`,404))
})
app.use(errorMiddleware);

const PORT =process.env.PORT;
const server=app.listen(PORT,()=>{
    console.log(`server start on port ${process.env.PORT}, in ${process.env.NODE_ENV} mode`);
});
//Handling Unhandled Promise Rejection
process.on('unhandledRejection',err=>{
    server.close(()=>{
        process.exit(1);
    })
})