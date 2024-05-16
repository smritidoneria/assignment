const Pool=require("pg").Pool;

const pool=new Pool({
    user:"postgres",
    password:"Smriti@123",
    host:"localhost",
    post:5432,
    database:"assignment"
});

module.exports=pool;