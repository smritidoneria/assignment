const express=require("express");
const app=express();
const cors=require("cors");

const userRoute=require("./routes/user")
const adminRoute=require("./routes/admin")
const ratingRoute=require("./routes/ratings")

app.use(cors());
app.use(express.json());

// for user registration
app.use('/api/user',userRoute);

// for entering the data of the movies in the table movies in database assignment
app.use('/api/admin',adminRoute);

// for different types of filtering 
app.use('/api/rating',ratingRoute);

app.listen(3000,()=>{
    console.log("started!")
})