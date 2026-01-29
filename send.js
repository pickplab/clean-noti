const https = require("https");

// === 팀 설정 ===
const teams = [
  { name: "1팀", mention: "@team1" },
  { name: "2팀", mention: "@team2" },
  { name: "3팀", mention: "@team3" }
];

// 로테이션 시작일 (월요일)
const START_DATE = new Date("2026-01-05");

// === 날짜 계산 ===
const today = new Date();
const weekDiff = Math.floor(
  (today - START_DATE) / (1000 * 60 * 60 * 24 * 7)
);

const currentTeam = teams[weekDiff % teams.length];

// === 메시지 ===
const message = `
🧹 오늘의 청소 당번

📅 이번 주 담당 팀
👉 ${currentTeam.name} ${currentTeam.mention}

청소 구역:
- 공용공간
- 탕비실
- 회의실

확인 부탁드립니다 🙏
`;

// === 텔레그램 전송 ===
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
    "Content-Length": data.length
  }
};

const req = https.request(options, res => {
  res.on("data", d => process.stdout.write(d));
});

req.write(data);
req.end();
