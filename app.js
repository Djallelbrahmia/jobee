const express=require('express');
const app=express();
const cookieParser=require('cookie-parser');
const fileupload=require('express-fileupload');
const rateLimit=require('express-rate-limit');
const dotenv=require('dotenv');
const errorMiddleware=require('./middlewares/errors');
const ErrorHandler=require('./utils/errorHandler');
const helmet=require('helmet');
const mongoSanitize=require('express-mongo-sanitize');
const xssClean=require('xss-clean');
const hpp=require('hpp');
const cors=require('cors');
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
//enabling cors
app.use(cors());
//Setup security headers
app.use(helmet());
// Setup Body paser
app.use(express.json());
app.use(cookieParser());
//handle file upload
app.use(fileupload());
//rate limiting
const limiter=rateLimit({
    windowMs: 10*60*1000,
    max:100
});
// importing all routes
const jobs =require('./routes/jobs');
const auth =require('./routes/auth');
const user =require('./routes/user');


app.use(limiter);
app.use(mongoSanitize());
app.use(xssClean())
app.use(hpp());
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