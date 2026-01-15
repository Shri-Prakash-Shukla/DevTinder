const mongoose = require("mongoose");
const Uri = process.env.MONGO_DB_URL

//This function will connect to you db and it returns promise. 
// Since we want to connect to db first then start the server we want it to get
// executed like sync so we will use await
const connectDB = async() =>{
    await mongoose.connect(Uri);
} 

module.exports = connectDB;

// we can call this function here and wherever we do require ( this file ) it will get executed, but 
// we are running app.js so we need to execute this function or require this file there but if this 
// function throws an error and db connection is not established then we don't want to start the server 
// that is why we will export this function call it in app.js and put the server function inside the then 
// block of this function {perks of promises} 