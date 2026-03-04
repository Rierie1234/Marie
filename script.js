// Offline LAN KnickHub script
const socket = io();
let currentUser = JSON.parse(localStorage.getItem("user"));

// Show/hide auth forms
function showRegister(){loginForm.style.display="none";registerForm.style.display="block";}
function showLogin(){loginForm.style.display="block";registerForm.style.display="none";}

// Auth
async function register(){
  if(!regName.value||!regEmail.value||!regPassword.value) return alert("Fill all fields");
  const res = await fetch("/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:regName.value,email:regEmail.value,password:regPassword.value})});
  const data = await res.json();
  if(!data.success) return alert("Email exists");
  localStorage.setItem("user",JSON.stringify(data.user));
  loadHomePage();
}

async function login(){
  const res = await fetch("/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:loginEmail.value,password:loginPassword.value})});
  const data = await res.json();
  if(!data.success) return alert("Invalid credentials");
  localStorage.setItem("user",JSON.stringify(data.user));
  loadHomePage();
}

function logout(){localStorage.removeItem("user"); location.reload();}

// Load Home
function loadHomePage(){
  authPage.style.display="none"; homePage.style.display="block";
  welcomeUser.innerText = currentUser.name;
  socket.emit("online", currentUser.id);
}

// Create Post
async function createPost(){
  let fileUrl = "";
  if(postMedia.files[0]){
    const fd = new FormData();
    fd.append("file", postMedia.files[0]);
    const res = await fetch("/upload",{method:"POST",body:fd});
    const data = await res.json();
    fileUrl = data.filename;
  }
  socket.emit("createPost",{userId:currentUser.id,text:postText.value,file:fileUrl});
  postText.value="";
}

// Listen for posts
socket.on("newPost",p=>{
  const div = document.createElement("div");
  div.className="post";
  div.innerHTML=`<b>${currentUser.name}</b>: ${p.text}${p.file?`<img src="uploads/${p.file}" width="200">`:""}`;
  feed.prepend(div);
});

// Global chat
function sendGlobalMessage(){
  if(!globalMessage.value) return;
  const msg = {from:currentUser.id,text:globalMessage.value};
  socket.emit("sendMessage",msg);
  globalMessage.value="";
}

socket.on("receiveMessage",m=>{
  globalChat.innerHTML+=`<div><b>${m.from.slice(0,6)}</b>: ${m.text}</div>`;
});
