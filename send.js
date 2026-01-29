const https = require("https");

/* =========================
   팀 순서 (고정)
========================= */
const teams = [
  "해외_태국+베트남",
  "기획팀",
  "운영팀",
  "광고팀",
  "국내_디자인팀",
  "피부팀",
  "코스메틱",
  "영상팀",
  "C/S팀",
  "해외_일본+러시아+영어",
  "해외_중국",
  "해외_운영팀",
  "해외_디자인+개발팀"
];

/* =========================
   로테이션 시작 기준일
   (이 날짜 = teams[0])
========================= */
const START_DATE = "2026-01-05";

/* =========================
   수동 제외일
========================= */
const MANUAL_EXCLUDE_DATES = [
  "2026-01-02"
];

/* =========================
   한국 공휴일 (연도별)
========================= */
const HOLIDAYS_BY_YEAR = {
  2026: [
    "2026-01-01",
    "2026-02-16", "2026-02-17", "2026-02-18",
    "2026-03-01",
    "2026-03-02",
    "2026-05-05",
    "2026-05-25",
    "2026-06-03",
    "2026-06-06",
    "2026-08-15",
    "2026-08-17",
    "2026-09-24", "2026-09-25", "2026-09-26",
    "2026-10-03",
    "2026-10-05",
    "2026-10-09",
    "2026-12-25"
  ],
  2027: [
    "2027-01-01",
    "2027-02-06", "2027-02-07", "2027-02-08", "2027-02-09",
    "2027-03-01",
    "2027-05-05",
    "2027-05-13",
    "2027-06-06",
    "2027-08-15",
    "2027-08-16",
    "2027-09-14", "2027-09-15", "2027-09-16",
    "2027-10-03",
    "2027-10-04",
    "2027-10-09",
    "2027-10-11",
    "2027-12-25",
    "2027-12-27"
  ]
};

/* =========================
   유틸 함수
========================= */
function formatDate(d) {
  return d.toISOString().slice(0, 10);
}

function isWeekend(d) {
  return d.getDay() === 0 || d.getDay() === 6;
}

function isHoliday(d) {
  const year = d.getFullYear();
  const dateStr = formatDate(d);
  return HOLIDAYS_BY_YEAR[year]?.includes(dateStr);
}

function isExcluded(d) {
  const dateStr = formatDate(d);
  return (
    isWeekend(d) ||
    isHoliday(d) ||
    MANUAL_EXCLUDE_DATES.includes(dateStr)
  );
}

/* =========================
   KST 기준 현재 시간
========================= */
const now = new Date();
now.setHours(now.getHours() + 9); // UTC → KST
const hour = now.getHours();
const minute = now.getMinutes();

/* =========================
   오늘 제외일이면 종료
========================= */
if (isExcluded(now)) {
  console.log("오늘은 제외일 → 알림 미전송");
  process.exit(0);
}

/* =========================
   영업일 기준 일 단위 로테이션
========================= */
let workdayCount = 0;
let cursor = new Date(START_DATE);

while (cursor <= now) {
  if (!isExcluded(cursor)) {
    workdayCount++;
  }
  cursor.setDate(cursor.getDate() + 1);
}

const teamIndex = (workdayCount - 1) % teams.length;
const team = teams[teamIndex];

/* =========================
   시간대별 메시지 분기
========================= */
let message = "";

// 오전 10:30
/*if (hour === 10 && minute === 30) {
  message =
    "🧹 오늘의 청소 당번\n\n" +
    "👉 " + team + "\n\n" +
    "오늘도 깨끗한 사무실 부탁드립니다 🙏";
}*/

// 테스트용: 오전 11:00
if (hour === 10 && minute === 50) {
  message =
    "🧪 [테스트] 오늘의 청소 당번\n\n" +
    "👉 " + team + "\n\n" +
    "10시 50분 테스트 발송입니다.";
}

// 오후 5:00
if (hour === 17 && minute === 0) {
  message =
    "🧹 청소 완료 체크 요청\n\n" +
    "👉 " + team + "\n\n" +
    "오늘 청소가 완료됐다면\n" +
    "체크 부탁드려요 ✅";
}

// 혹시 시간 불일치 시 종료
if (!message) {
  console.log("발송 대상 시간이 아님");
  process.exit(0);
}

/* =========================
   텔레그램 전송
========================= */
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
  res.on("data", d => console.log(d.toString()));
});

req.on("error", e => console.error(e));
req.write(data);
req.end();
