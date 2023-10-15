const mongoose=require('mongoose');
const connectDatabase=()=>{mongoose.connect(process.env.DB_LOCAL_URI,{
    // userNewUrlParser:true,
    // useUnitiedTopology:true,
    // useCreateIndex:true,
}).then(con=>{
    console.log(`MongoDb Database connected with host : ${con.connection.host}`);

}); 
};
module.exports=connectDatabase;
