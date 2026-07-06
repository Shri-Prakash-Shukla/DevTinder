const express = require("express")
const paymentRouter = express.Router();
const userAuth = require("../middlewares/authentication");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
    key_id : process.env.RAZORPAY_KEY_ID,
    key_secret : process.env.RAZORPAY_KEY_SECRET
})

paymentRouter.post("/payment/order", userAuth, async (req, res)=>{
    try{
        const order = await razorpay.orders.create({
            amount : 1000,
            currency: "INR",
            receipt : "receipt_"+Date.now()
        })

        res.json({
            order_id : order.id,
            amount: order.amount,
            currency: order.currency
        })
    }catch(err){
        res.status(500).json({error : err.message});
    }
})

paymentRouter.post("/payment/verify", userAuth, async (req, res) =>{
    try{
        const {order_id, payment_id, signature} = req.body;

        const body = order_id + "|" + payment_id;

        const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

        if (expectedSignature !== signature) {
        return res.status(400).json({ success: false, message: "Payment verification failed" });
        }

        res.json({ success: true, message: "Payment verified successfully" });
    }catch(err){
        res.status(500).json({
            error : err.message,
        })
    }
})

module.exports = paymentRouter;