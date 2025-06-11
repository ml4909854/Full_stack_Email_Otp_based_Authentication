require("dotenv").config(); 

const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const userRouter = require("./controller/user.controller.js");
const blogRouter = require("./controller/blog.controller.js");

const app = express();
app.use(express.json());
app.use(cors());



app.use("/user", userRouter);
app.use("/blog", blogRouter);

app.get("/", (req, res) => {
  res.send("connected!");
});



app.listen(3000,async () => {
  await connectDB()
  console.log("server is running");
});
