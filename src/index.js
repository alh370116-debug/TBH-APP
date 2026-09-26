const COOKIE_NAME = "tbh_admin";

function html(body) {
  return new Response(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>TBH</title>
<style>
*{box-sizing:border-box}
body{
  margin:0;
  min-height:100vh;
  font-family:Arial,sans-serif;
  background:linear-gradient(135deg,#090b18,#17102b,#080910);
  color:#fff;
  display:flex;
  justify-content:center;
  align-items:center;
  padding:20px
}
.card{
  width:100%;
  max-width:520px;
  padding:28px;
  border:1px solid #ffffff18;
  border-radius:24px;
  background:#ffffff0b;
  backdrop-filter:blur(18px);
  box-shadow:0 20px 60px #0008
}
.logo{
  font-size:42px;
  font-weight:900;
  text-align:center;
  margin-bottom:8px
}
.sub{
  text-align:center;
  color:#aaa;
  margin-bottom:28px
}
label{
  display:block;
  margin:16px 0 8px;
  font-weight:700
}
input,textarea{
  width:100%;
  border:1px solid #ffffff18;
  outline:none;
  border-radius:14px;
  padding:14px;
  background:#080910aa;
  color:#fff;
  font-size:15px
}
textarea{
  min-height:150px;
  resize:vertical
}
button{
  width:100%;
  margin-top:18px;
  padding:14px;
  border:0;
  border-radius:14px;
  cursor:pointer;
  color:#fff;
  font-size:16px;
  font-weight:800;
  background:linear-gradient(90deg,#7657ff,#b34dff)
}
.note{
  margin-top:10px;
  font-size:12px;
  color:#888;
  line-height:1.5
}
#result{
  margin-top:16px;
  text-align:center;
  font-weight:700
}
</style>
</head>
<body>
<div class="card">
  <div class="logo">TBH</div>
  <div class="sub">Send me anonymous message</div>

  <form id="form">
    <label>Instagram username</label>
    <input id="instagram" maxlength="50" placeholder="@username" required>

    <label>Anonymous message</label>
    <textarea id="message" maxlength="1000" placeholder="Write your message..." required></textarea>

    <div class="note">
      We will show this name to the user if he or she buys Premium.
      Your message is anonymous to the recipient, but the TBH admin can see the Instagram username you provide.
    </div>

    <button type="submit">Send anonymously</button>
  </form>

  <div id="result"></div>
</div>

<script>
const form = document.getElementById("form");
const result = document.getElementById("result");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  result.textContent = "Sending...";

  const instagram_username =
    document.getElementById("instagram").value.trim();

  const message =
    document.getElementById("message").value.trim();

  try {
    const res = await fetch("/api/message", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        instagram_username,
        message
      })
    });

    const data = await res.json();

    if (!res.ok) {
      result.textContent = data.error || "Something went wrong.";
      return;
    }

    result.textContent = "Message sent anonymously ✓";
    form.reset();

  } catch {
    result.textContent = "Network error. Please try again.";
  }
});
</script>
</body>
</html>`, {
    headers: {
      "content-type": "text/html;charset=UTF-8"
    }
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json;charset=UTF-8"
    }
  });
}

function isAdmin(request, env) {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));

  return match && match[1] === env.ADMIN_SESSION_TOKEN;
}

function adminPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>TBH Admin</title>
<style>
*{box-sizing:border-box}
body{
  margin:0;
  background:#080910;
  color:#fff;
  font-family:Arial,sans-serif;
  padding:20px
}
.wrap{
  width:100%;
  max-width:900px;
  margin:auto
}
h1{font-size:32px}
.panel{
  background:#ffffff09;
  border:1px solid #ffffff14;
  border-radius:20px;
  padding:20px;
  margin-bottom:18px
}
input,button{
  width:100%;
  padding:13px;
  border-radius:12px;
  border:1px solid #ffffff18;
  margin-top:10px
}
input{
  background:#10111b;
  color:#fff
}
button{
  cursor:pointer;
  color:#fff;
  background:#7657ff;
  border:0;
  font-weight:700
}
.msg{
  padding:16px;
  margin-top:12px;
  border-radius:15px;
  background:#ffffff08;
  border:1px solid #ffffff12
}
.small{
  color:#999;
  font-size:13px
}
.hidden{display:none}
</style>
</head>
<body>

<div class="wrap">

<div id="loginBox" class="panel">
<h1>TBH Admin</h1>
<input id="username" placeholder="Username">
<input id="password" type="password" placeholder="Password">
<button onclick="login()">Login</button>
<div id="loginResult"></div>
</div>

<div id="adminBox" class="hidden">

<div class="panel">
<h1>TBH Dashboard</h1>
<div id="status">Loading...</div>

<button onclick="toggleTBH()">Toggle TBH</button>
<button onclick="loadMessages()">Refresh Messages</button>
<button onclick="resetMessages()">Reset All Messages</button>
<button onclick="logout()">Logout</button>
</div>

<div class="panel">
<h2>Messages</h2>
<div id="messages">Loading...</div>
</div>

</div>
</div>

<script>
async function check(){
  const r = await fetch("/api/admin/status");
  if(r.ok){
    document.getElementById("loginBox").classList.add("hidden");
    document.getElementById("adminBox").classList.remove("hidden");
    loadStatus();
    loadMessages();
  }
}

async function login(){
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const r = await fetch("/api/admin/login",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({username,password})
  });

  const d = await r.json();

  if(r.ok){
    location.reload();
  }else{
    document.getElementById("loginResult").textContent =
      d.error || "Login failed";
  }
}

async function loadStatus(){
  const r = await fetch("/api/admin/status");
  const d = await r.json();

  document.getElementById("status").textContent =
    d.enabled ? "TBH is ON" : "TBH is OFF";
}

async function toggleTBH(){
  await fetch("/api/admin/toggle",{method:"POST"});
  loadStatus();
}

async function loadMessages(){
  const box = document.getElementById("messages");

  const r = await fetch("/api/admin/messages");

  if(!r.ok){
    box.textContent = "Unable to load messages.";
    return;
  }

  const data = await r.json();

  if(!data.messages.length){
    box.textContent = "No messages yet.";
    return;
  }

  box.innerHTML = data.messages.map(m => \`
    <div class="msg">
      <b>Instagram:</b> \${escapeHTML(m.instagram_username)}
      <br><br>
      <b>Message:</b><br>
      \${escapeHTML(m.message)}
      <div class="small">\${escapeHTML(m.created_at)}</div>
    </div>
  \`).join("");
}

async function resetMessages(){
  if(!confirm("Delete ALL messages?")) return;

  await fetch("/api/admin/reset",{method:"POST"});
  loadMessages();
}

async function logout(){
  await fetch("/api/admin/logout",{method:"POST"});
  location.reload();
}

function escapeHTML(value){
  return String(value)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

check();
</script>

</body>
</html>`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Public page
    if (request.method === "GET" && path === "/") {
      return html();
    }

    // Submit anonymous message
    if (request.method === "POST" && path === "/api/message") {
      const setting = await env.DB
        .prepare("SELECT value FROM settings WHERE key = 'tbh_enabled'")
        .first();

      if (!setting || setting.value !== "1") {
        return json({error:"TBH is currently turned off."}, 403);
      }

      let body;

      try {
        body = await request.json();
      } catch {
        return json({error:"Invalid request."}, 400);
      }

      const instagram = String(body.instagram_username || "").trim();
      const message = String(body.message || "").trim();

      if (!instagram || !message) {
        return json({error:"All fields are required."}, 400);
      }

      if (instagram.length > 50) {
        return json({error:"Instagram username is too long."}, 400);
      }

      if (message.length > 1000) {
        return json({error:"Message is too long."}, 400);
      }

      await env.DB
        .prepare(
          "INSERT INTO messages (instagram_username, message) VALUES (?, ?)"
        )
        .bind(instagram, message)
        .run();

      return json({success:true});
    }

    // Admin login
    if (request.method === "POST" && path === "/api/admin/login") {
      let body;

      try {
        body = await request.json();
      } catch {
        return json({error:"Invalid request."},400);
      }

      if (
        body.username !== env.ADMIN_USERNAME ||
        body.password !== env.ADMIN_PASSWORD
      ) {
        return json({error:"Invalid username or password."},401);
      }

      return new Response(JSON.stringify({success:true}),{
        headers:{
          "content-type":"application/json",
          "Set-Cookie":
            `${COOKIE_NAME}=${env.ADMIN_SESSION_TOKEN}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`
        }
      });
    }

    // Admin status
    if (request.method === "GET" && path === "/api/admin/status") {
      if (!isAdmin(request, env)) {
        return json({error:"Unauthorized"},401);
      }

      const setting = await env.DB
        .prepare("SELECT value FROM settings WHERE key = 'tbh_enabled'")
        .first();

      return json({
        enabled: setting?.value === "1"
      });
    }

    // Admin messages
    if (request.method === "GET" && path === "/api/admin/messages") {
      if (!isAdmin(request, env)) {
        return json({error:"Unauthorized"},401);
      }

      const result = await env.DB
        .prepare(
          "SELECT id, instagram_username, message, created_at FROM messages ORDER BY id DESC"
        )
        .all();

      return json({
        messages: result.results || []
      });
    }

    // Toggle TBH
    if (request.method === "POST" && path === "/api/admin/toggle") {
      if (!isAdmin(request, env)) {
        return json({error:"Unauthorized"},401);
      }

      const setting = await env.DB
        .prepare("SELECT value FROM settings WHERE key = 'tbh_enabled'")
        .first();

      const next = setting?.value === "1" ? "0" : "1";

      await env.DB
        .prepare(
          "INSERT INTO settings (key,value) VALUES ('tbh_enabled',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value"
        )
        .bind(next)
        .run();

      return json({enabled:next === "1"});
    }

    // Reset messages
    if (request.method === "POST" && path === "/api/admin/reset") {
      if (!isAdmin(request, env)) {
        return json({error:"Unauthorized"},401);
      }

      await env.DB.prepare("DELETE FROM messages").run();

      return json({success:true});
    }

    // Logout
    if (request.method === "POST" && path === "/api/admin/logout") {
      return new Response(JSON.stringify({success:true}),{
        headers:{
          "content-type":"application/json",
          "Set-Cookie":
            `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`
        }
      });
    }

    // Admin page
    if (request.method === "GET" && path === "/admin") {
      return new Response(adminPage(),{
        headers:{
          "content-type":"text/html;charset=UTF-8"
        }
      });
    }

    return new Response("Not Found", {status:404});
  }
};
