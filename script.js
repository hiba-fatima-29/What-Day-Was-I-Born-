/* =========================================================
   script.js — the "brain" of the website
   It reads the date, does the math, and shows the results.
   ========================================================= */

/* ----- 1. Grab the parts of the page we need to work with ----- */
const birthInput = document.getElementById("birthDate");
const findBtn    = document.getElementById("findBtn");
const resetBtn   = document.getElementById("resetBtn");
const formArea   = document.getElementById("formArea");
const resultArea = document.getElementById("resultArea");
const errorMsg   = document.getElementById("errorMsg");

/* ----- 2. Names of the days of the week ----- */
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/* ----- 3. Our own cute line for each birth day ----- */
const DAY_LINES = {
  Sunday:    "Sunday's child is a ray of sunshine, making every room glow ☀️",
  Monday:    "Monday's child brings fresh starts and the brightest smiles 🌷",
  Tuesday:   "Tuesday's child is brave and bold, with a heart made of gold 💛",
  Wednesday: "Wednesday's child is curious and clever, a little star forever ⭐",
  Thursday:  "Thursday's child is kind and caring, always sharing 🤗",
  Friday:    "Friday's child is full of fun, the life of the party for everyone 🎉",
  Saturday:  "Saturday's child is a dreamer and doer, sweet as a cupcake 🧁"
};

/* ----- 4. Zodiac signs: name, emoji, and the date each one ENDS ----- */
/* Example: Capricorn lasts until January 19, Aquarius until February 18, ... */
const ZODIAC = [
  { name: "Capricorn",   emoji: "♑", endMonth: 1,  endDay: 19 },
  { name: "Aquarius",    emoji: "♒", endMonth: 2,  endDay: 18 },
  { name: "Pisces",      emoji: "♓", endMonth: 3,  endDay: 20 },
  { name: "Aries",       emoji: "♈", endMonth: 4,  endDay: 19 },
  { name: "Taurus",      emoji: "♉", endMonth: 5,  endDay: 20 },
  { name: "Gemini",      emoji: "♊", endMonth: 6,  endDay: 20 },
  { name: "Cancer",      emoji: "♋", endMonth: 7,  endDay: 22 },
  { name: "Leo",         emoji: "♌", endMonth: 8,  endDay: 22 },
  { name: "Virgo",       emoji: "♍", endMonth: 9,  endDay: 22 },
  { name: "Libra",       emoji: "♎", endMonth: 10, endDay: 22 },
  { name: "Scorpio",     emoji: "♏", endMonth: 11, endDay: 21 },
  { name: "Sagittarius", emoji: "♐", endMonth: 12, endDay: 21 },
  { name: "Capricorn",   emoji: "♑", endMonth: 12, endDay: 31 }
];

/* ----- 5. Stop people from picking a date after today ----- */
const today = getToday();
birthInput.max = toInputValue(today);

/* =========================================================
   HELPER FUNCTIONS (small tools we use below)
   ========================================================= */

/* Today's date at midnight (so the time of day doesn't mess up the math) */
function getToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/* Turn a Date into "YYYY-MM-DD" text, which the date box understands */
function toInputValue(date) {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

/* Count whole days between two dates */
function daysBetween(start, end) {
  return Math.round((end - start) / (1000 * 60 * 60 * 24));
}

/* How many days are in a given month */
function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/* Make the birthday for a given year (Feb 29 babies get Feb 28 in normal years) */
function birthdayInYear(birth, year) {
  const month = birth.getMonth();
  const day = Math.min(birth.getDate(), daysInMonth(year, month));
  return new Date(year, month, day);
}

/* Exact age in years, months and days */
function getAge(birth, today) {
  let years  = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  let days   = today.getDate() - birth.getDate();

  // If days went negative, borrow days from the previous month
  if (days < 0) {
    months--;
    days += daysInMonth(today.getFullYear(), today.getMonth() - 1);
  }
  // If months went negative, borrow 12 months from the years
  if (months < 0) {
    years--;
    months += 12;
  }
  return { years, months, days };
}

/* Find the zodiac sign for a birth date */
function getZodiac(birth) {
  const month = birth.getMonth() + 1;
  const day = birth.getDate();
  return ZODIAC.find(z => month < z.endMonth || (month === z.endMonth && day <= z.endDay));
}

/* Add "s" when there is more than one (1 year, 2 years) */
function plural(n, word) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

/* =========================================================
   MAIN ACTION: when the "Find My Birth Day" button is clicked
   ========================================================= */
function findBirthDay() {
  const value = birthInput.value; // looks like "1995-06-14", or "" if empty

  // Build a real date from the text (only if something was picked)
  let birth = null;
  if (value) {
    const [y, m, d] = value.split("-").map(Number);
    birth = new Date(y, m - 1, d);
  }

  // Empty, broken, or future date → show the friendly error
  const now = getToday();
  if (!birth || isNaN(birth) || birth > now || birth.getFullYear() < 1900) {
    errorMsg.classList.remove("hidden");
    // Restart the shake animation each time
    errorMsg.style.animation = "none";
    void errorMsg.offsetWidth;
    errorMsg.style.animation = "";
    return;
  }
  errorMsg.classList.add("hidden");

  // --- The weekday they were born ---
  const dayName = DAYS[birth.getDay()];
  document.getElementById("dayName").textContent = dayName.toUpperCase();
  document.getElementById("dayLine").textContent = DAY_LINES[dayName];

  // --- Exact age ---
  const age = getAge(birth, now);
  document.getElementById("ageText").textContent =
    `${plural(age.years, "year")}, ${plural(age.months, "month")}, ${plural(age.days, "day")}`;

  // --- Total days alive (toLocaleString adds commas: 12,345) ---
  document.getElementById("daysAlive").textContent =
    daysBetween(birth, now).toLocaleString() + " days";

  // --- Next birthday ---
  let next = birthdayInYear(birth, now.getFullYear());
  if (next < now) {
    next = birthdayInYear(birth, now.getFullYear() + 1);
  }
  const left = daysBetween(now, next);
  document.getElementById("daysLeft").textContent =
    left === 0 ? "It's TODAY! Happy Birthday! 🥳" : plural(left, "day");
  document.getElementById("nextDay").textContent = DAYS[next.getDay()];

  // --- Zodiac sign ---
  const sign = getZodiac(birth);
  document.getElementById("zodiacEmoji").textContent = sign.emoji;
  document.getElementById("zodiacName").textContent = `${sign.emoji} ${sign.name}`;

  // --- Swap the form for the result, and celebrate! ---
  formArea.classList.add("hidden");
  resultArea.classList.remove("hidden");
  resultArea.scrollIntoView({ behavior: "smooth", block: "center" });
  launchConfetti();
}

/* =========================================================
   RESET: when "Try another date" is clicked
   ========================================================= */
function resetForm() {
  birthInput.value = "";
  resultArea.classList.add("hidden");
  formArea.classList.remove("hidden");
  errorMsg.classList.add("hidden");
  birthInput.focus();
}

/* =========================================================
   CONFETTI: drops 80 colorful pieces from the top
   ========================================================= */
function launchConfetti() {
  const box = document.getElementById("confetti");
  const colors = ["#ff6fa8", "#9b6dff", "#7ee0b5", "#ffb380", "#7cc4ff", "#ffe066"];

  for (let i = 0; i < 80; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = 2 + Math.random() * 2 + "s";
    piece.style.animationDelay = Math.random() * 0.5 + "s";
    box.appendChild(piece);

    // Remove each piece after it has fallen, to keep the page tidy
    setTimeout(() => piece.remove(), 5000);
  }
}

/* =========================================================
   CONNECT THE BUTTONS to the actions above
   ========================================================= */
findBtn.addEventListener("click", findBirthDay);
resetBtn.addEventListener("click", resetForm);

// Pressing Enter inside the date box also works
birthInput.addEventListener("keydown", e => {
  if (e.key === "Enter") findBirthDay();
});
