const connection = require("express").Router();
const Connection = require("../models/connection");
const User = require("../models/user");
const userAuth = require("../middlewares/authentication");

//API to send the a connection request
connection.post("/request/:status/:toUserId", userAuth, async (req, res) => {
    try{
        const toUserId = req.params.toUserId;
        const fromUserId = req.user._id;
        const status = req.params.status;

        // status is valid 
        const ALLOWED_STATUS = ["interested", "ignored"] 
        if(!ALLOWED_STATUS.includes(status)){
            throw new Error("Invalid Status Type");
        }

        // toUserId is valid 
        const toUser = await User.findById(toUserId)
        if(!toUser){
            throw new Error("Kisko bhej rahe ho request");
        }

        //you can not send connection to yourself 
        if(toUserId === fromUserId.toString()){
            throw new Error("You can not send request to yourself");
        }

        //connection already exist
        const existingConnection = await Connection.findOne({
            $or: [
              { fromUserId: fromUserId, toUserId: toUserId },
              { fromUserId: toUserId, toUserId: fromUserId }
            ]
          });
          
          if (existingConnection) {
            throw new Error("Connection already exists");
          }

        const connection = new Connection({
            fromUserId, toUserId, status
        })
        await connection.save();

        res.json({
            'message' : 'connection sent successfully'
        })
        //connection already exist 
    }catch(err){
        res.status(400).json({
            'message' : 'bad request ' + err.message
        })
    }
})

// API to review a request
connection.post("/review/:status/:connectionId", userAuth, async (req, res) =>{
    try{
        const status = req.params.status;
        const connectionId = req.params.connectionId;
        const loggedInUser = req.user;

        // Validate the status 
        const ALLOWED_STATUS = ["accepted", "rejected"];
        const isStatusValid = ALLOWED_STATUS.includes(status);

        if(!isStatusValid){
            throw new Error("Unknown type status");
        }

        // Validate the connection id
        const connection = await Connection.findOne({
            _id : connectionId, 
            toUserId : loggedInUser._id,
            status : "interested"
        });

        if(!connection){
            throw new Error("Connection does not exist");
        }

        connection.status = status;
        const data = await connection.save();

        res.status(200).json({
            message : "Connection reviewed succesfully",
            data : data
        })
    }catch(err){
        res.status(400).json({
            message : `Error : ${err.message}`
        })
    }
})

// API to get all the pending requests
connection.get("/view/requests", userAuth, async (req, res)=>{
    try{
        const loggedInUser = req.user;
        const connections = await Connection.find({
            toUserId : loggedInUser._id,
            status : "interested"
        }).populate("fromUserId", ["firstName", "lastName", "age", "skills", "photoUrl"]);

        res.status(200).json({
            message : "All the request fetched",
            data : connections 
        })

    }catch(err){
        res.status(400).json({
            message : `Error : ${err.message}`
        })
    }
})

// API to get all the connections

connection.get("/connections", userAuth, async (req, res)=>{
    try{
        const loggedInUserId = req.user._id;

        const data = await Connection.find({
            $or : [
                {toUserId : loggedInUserId , status : "accepted"},
                {fromUserId : loggedInUserId , status : "accepted"}
            ]
        }).populate("fromUserId",  ["firstName", "lastName", "age", "skills", "photoUrl"])
        .populate("toUserId",  ["firstName", "lastName", "age", "skills", "photoUrl"]);

        const filteredData = data.map((row)=>{
            if(row.toUserId._id.toString() === loggedInUserId.toString()){
                return row.fromUserId;
            }
            return row.toUserId;
        })

        res.status(200).json({
            message : "Fetch all the connections",
            data : filteredData
        })

    }catch(err){
        res.status(400).json({
            message : `Some error occured while fetching all the connection, Error : ${err.message}`
        })
    }
})



module.exports = connection;