const https = require("https");

const message = "청소 알림 테스트 메시지입니다.";

const data = JSON.stringify({
  chat_id: process.env.CHAT_ID,
  text: message
});

const options = {
  hostname: "api.telegram.org",
  path: `/bot${process.env.BOT_TOKEN}/sendMessage`,
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(data)
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
