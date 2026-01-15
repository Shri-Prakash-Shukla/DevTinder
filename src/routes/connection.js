const connection = require("express").Router();
const Connection = require("../models/connection");
const User = require("../models/user");
const userAuth = require("../middlewares/authentication");

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

module.exports = connection;