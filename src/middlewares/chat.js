const { Server } = require("socket.io");
const Chat = require("../models/chat.js");

const initializeSocket = (server)=>{
    const io = new Server(server);
    io.on("connection", (socket)=>{
        console.log("User connected !!!!!");


        socket.on("joinChat", async ({firstName, userId, targetUserId})=>{
            const roomId = [userId, targetUserId].sort().join("_");
            socket.join(roomId);
            console.log(firstName, " joined the room : ", roomId);

            // purane messages DB se load karke sirf is user ko bhej do
            try {
                const chat = await Chat.findOne({
                    participants : { $all : [userId, targetUserId], $size : 2 }
                });
                if(chat){
                    const messages = chat.messages.map((m)=>({
                        userId : m.senderId,
                        text : m.text
                    }));
                    socket.emit("loadMessages", messages);
                }
            } catch (err) {
                console.error("Error loading chat history: ", err);
            }
        })


        socket.on("sendMessage", async ({userId, targetUserId, text}) => {
            const roomId = [userId, targetUserId].sort().join("_");
            try {
                // participants ke basis pe chat dhoondo, na mile to naya banao
                let chat = await Chat.findOne({
                    participants : { $all : [userId, targetUserId], $size : 2 }
                });
                if(!chat){
                    chat = new Chat({
                        participants : [userId, targetUserId],
                        messages : []
                    });
                }
                chat.messages.push({ senderId : userId, text });
                await chat.save();

                io.to(roomId).emit("recieveMessage", {userId, text});
            } catch (err) {
                console.error("Error saving message: ", err);
            }
        });
    });
};

module.exports = { initializeSocket }
