const mongoose = require("mongoose");

// ek message — kisne bheja aur kya bheja
const messageSchema = new mongoose.Schema({
    senderId : {
        type : mongoose.SchemaTypes.ObjectId,
        ref : "User",
        required : true
    },
    text : {
        type : String,
        required : true
    }
},{timestamps : true})


const chatSchema = new mongoose.Schema({
    // participants array — 1-on-1 me 2, group me N users. Isse group chat future me easy hai.
    participants : [{
        type : mongoose.SchemaTypes.ObjectId,
        ref : "User",
        required : true
    }],
    // group chat ke liye flags (abhi 1-on-1 ke liye default false)
    isGroup : {
        type : Boolean,
        default : false
    },
    groupName : {
        type : String
    },
    messages : [messageSchema]
},{timestamps : true})


const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;
