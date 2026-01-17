const mongoose = require("mongoose");

const connectionSchema = new mongoose.Schema({
    fromUserId : {
        type : mongoose.SchemaTypes.ObjectId,
        require : true,
        ref : "User"
    },
    toUserId : {
        type : mongoose.SchemaTypes.ObjectId,
        require : true,
        ref : "User"
    },
    status : {
        type : String,
        enums : {
            value : ["interested", "ignored", "accepted", "rejected"],
            message : `{VALUE} is not a valid status type`
        }
    }
},{timestamps : true})


const Connection = mongoose.model("connection", connectionSchema);
module.exports = Connection