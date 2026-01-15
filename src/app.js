require("dotenv").config()
const express = require("express");
const connectDB = require("./config/database.js");
const cookieParser = require("cookie-parser");
const User = require("./models/user.js")
const userAuth = require("./middlewares/authentication")
const authRouter = require("./routes/auth.js")
const userRouter = require("./routes/user.js")
const connectionRouter = require("./routes/connection.js")

const app = express();

//middleware to convert req.body from json to js object , since it has not route and .use() is being used
// every request will go thrugh it
app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", userRouter);
app.use("/",connectionRouter);


app.get("/stream",(req,res)=>{
  res.setHeader("Content-Type","text/event-stream");
  let i=0;
  setInterval(()=>{
    res.write(`data: Hello ${i++}\n\n`)
  },1000)
})

app.get("/", (req, resp) => {
  resp.send("Welcome to our website");
});

connectDB()
  .then(() => {
    console.log("Database connection established successfully");
    app.listen(3000, () => {
      console.log("Server Started Successfully, and listening to port 3000");
    });
  })
  .catch((err) => {
    console.error("Error occurred while connecting to DB", err);
  });
