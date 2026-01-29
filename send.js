const https = require("https");

const data = JSON.stringify({
  chat_id: process.env.CHAT_ID,
  text: "🧪 텔레그램 테스트 메시지 (깃헙 액션)"
});

const options = {
  hostname: "api.telegram.org",
  path: `/bot${process.env.BOT_TOKEN}/sendMessage`,
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": data.length
  }
};

const req = https.request(options, res => {
  console.log("STATUS:", res.statusCode);
  res.on("data", d => {
    console.log("RESPONSE:", d.toString());
  });
});

req.on("error", e => {
  console.error("ERROR:", e);
});

req.write(data);
req.end();
