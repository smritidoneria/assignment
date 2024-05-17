const express=require("express");
const app=express();
const cors=require("cors");

const userRoute=require("./routes/user")
const adminRoute=require("./routes/admin")
const ratingRoute=require("./routes/ratings")

app.use(cors());
app.use(express.json());

app.use(function (req, res, next) {
    
    res.setHeader("Access-Control-Allow-Origin", "*");

    // Request methods you wish to allow
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );

    // Request headers you wish to allow
    res.setHeader("Access-Control-Allow-Headers", "*");

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader("Access-Control-Allow-Credentials", true);

    // Pass to next layer of middleware
    next();
});

// for user registration
app.use('/api/user',userRoute);

// for entering the data of the movies in the table movies in database assignment
app.use('/api/admin',adminRoute);

// for different types of filtering 
app.use('/api/rating',ratingRoute);

app.listen(3000,()=>{
    console.log("started!")
})