const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const multer = require("multer");
const fs = require("fs");

app.use(express.json());
app.use(express.static("public"));

const upload = multer({ dest: "public/uploads/" });

let users = [];
let posts = [];
let onlineUsers = {};

app.post("/register",(req,res)=>{
  const {name,email,password} = req.body;
  if(users.find(u=>u.email===email)) return res.json({success:false});
  const user = {id:Date.now().toString(),name,email,password,bio:"",profilePic:""};
  users.push(user);
  res.json({success:true,user});
});

app.post("/login",(req,res)=>{
  const {email,password}=req.body;
  const user = users.find(u=>u.email===email && u.password===password);
  if(!user) return res.json({success:false});
  res.json({success:true,user});
});

app.post("/upload", upload.single("file"), (req,res)=>res.json({filename:req.file.filename}));

io.on("connection", socket => {
  socket.on("online", userId => onlineUsers[userId] = socket.id);
  socket.on("createPost", data => {
    const post = {id:Date.now(),userId:data.userId,text:data.text,file:data.file||null};
    posts.unshift(post);
    io.emit("newPost", post);
  });
});

http.listen(3000,"0.0.0.0",()=>console.log("LAN KnickHub running at http://10.174.154.240:3000"));
