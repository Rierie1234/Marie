// Offline registration/login
async function register() {
  if(!regName.value || !regEmail.value || !regPassword.value) return alert("Fill all fields");
  const res = await fetch("/register", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({name:regName.value,email:regEmail.value,password:regPassword.value})
  });
  const data = await res.json();
  if(!data.success) return alert("Email exists");
  localStorage.setItem("user", JSON.stringify(data.user));
  loadHomePage();
}

async function login() {
  const res = await fetch("/login", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({email:loginEmail.value,password:loginPassword.value})
  });
  const data = await res.json();
  if(!data.success) return alert("Invalid credentials");
  localStorage.setItem("user", JSON.stringify(data.user));
  loadHomePage();
}

// Socket.io setup
const socket = io();
let currentUser = JSON.parse(localStorage.getItem("user"));
if(currentUser) socket.emit("online", currentUser.id);

// Create Post
async function createPost(){
  let fileUrl="";
  if(postMedia.files[0]){
    const fd = new FormData();
    fd.append("file", postMedia.files[0]);
    const res = await fetch("/upload", {method:"POST", body:fd});
    const data = await res.json();
    fileUrl = data.filename;
  }
  socket.emit("createPost",{userId:currentUser.id,text:postText.value,file:fileUrl});
  postText.value="";
}

// Listen for new posts
socket.on("newPost", p => {
  const div = document.createElement("div");
  div.className="post";
  div.innerHTML=`<b>${currentUser.name}</b>: ${p.text}${p.file?`<img src="uploads/${p.file}" width="200">`:""}`;
  feed.prepend(div);
});
