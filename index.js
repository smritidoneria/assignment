const express=require("express");
const app=express();
const cors=require("cors");

const userRoute=require("./routes/user")
const adminRoute=require("./routes/admin")

app.use(cors());
app.use(express.json());

app.use('/api/user',userRoute);
app.use('/api/admin',adminRoute);

app.listen(3000,()=>{
    console.log("started!")
})