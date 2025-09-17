// ===============================
// Global Variables
// ===============================
const API_URL = 'https://smart-campus-api-11dr.onrender.com';
let authToken = null;
let calendar = null;
let allAttendanceData = [];

// ===============================
// App Initialization
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
  checkLoginStatus();
});

function initializeApp() {
  // Event Listeners
  document.querySelectorAll(".nav-item").forEach(link => link.addEventListener("click", handleNavigation));
  document.querySelector(".attendance-card-link")?.addEventListener("click", () => navigateTo('attendanceView'));
  document.querySelector(".login-form")?.addEventListener("submit", e => { e.preventDefault(); handleLogin(); });
  document.querySelector(".logout-btn")?.addEventListener("click", handleLogout);
  document.querySelector("#month-select")?.addEventListener("change", () => renderAttendanceCalendar(allAttendanceData));
  document.querySelector("#year-select")?.addEventListener("change", () => renderAttendanceCalendar(allAttendanceData));
  
  updateCurrentTime();
  setInterval(updateCurrentTime, 1000);
  populateYearAndMonthSelectors();
}

// ===============================
// Navigation
// ===============================
function handleNavigation(event) {
    event.preventDefault();
    const viewId = event.target.getAttribute('href').substring(1);
    navigateTo(viewId);
}

function navigateTo(viewId) {
    document.querySelectorAll('.page-view').forEach(view => view.classList.remove('active'));
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.add('active');
    }
    document.querySelectorAll('.nav-item, .sub-nav .nav-item').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${viewId}`) {
            link.classList.add('active');
        }
    });
}

// ===============================
// Authentication & Session
// ===============================
function checkLoginStatus() {
  authToken = sessionStorage.getItem('authToken');
  if (authToken) fetchDashboardData();
}

async function handleLogin() {
  const studentId = document.getElementById("studentId").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!studentId || !password) return showNotification("Please enter both ID and Password.", "error");

  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_id_str: studentId, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Invalid credentials");

    authToken = data.access_token;
    sessionStorage.setItem('authToken', authToken);
    showNotification("Login successful!", "success");
    fetchDashboardData();
  } catch (error) {
    showNotification(error.message, "error");
  }
}

function handleLogout() {
  sessionStorage.removeItem('authToken');
  authToken = null;
  showLogin();
  showNotification("Logged out successfully.", "info");
}

// ===============================
// Data Fetching & Rendering
// ===============================
async function fetchDashboardData() {
  if (!authToken) return showLogin();

  try {
    const [userRes, attendanceRes] = await Promise.all([
      fetch(`${API_URL}/api/students/me`, { headers: { 'Authorization': `Bearer ${authToken}` } }),
      fetch(`${API_URL}/api/attendance/me`, { headers: { 'Authorization': `Bearer ${authToken}` } })
    ]);

    if (!userRes.ok || !attendanceRes.ok) throw new Error("Session expired.");

    const userData = await userRes.json();
    allAttendanceData = await attendanceRes.json();
    
    populateUI(userData, allAttendanceData);
    showDashboard();
  } catch (error) {
    showNotification(error.message, "error");
    handleLogout();
  }
}

function populateUI(userData, attendanceData) {
  // Populate new header
  document.getElementById('welcomeUser').textContent = userData.name;
  document.getElementById('userDetails').textContent = userData.student_id_str;
  const nameParts = userData.name.split(' ');
  const initials = nameParts.length > 1 ? `${nameParts[0][0]}${nameParts[1][0]}` : nameParts[0].substring(0, 2);
  document.getElementById('userAvatar').textContent = initials.toUpperCase();
  
  // Populate original dashboard elements
  const welcomeHero = document.getElementById('welcomeUser-hero');
  const roleHero = document.getElementById('userRole-hero');
  if(welcomeHero) welcomeHero.textContent = `Welcome, ${userData.name}`;
  if(roleHero) roleHero.textContent = `${userData.student_id_str} Student`;

  // Populate main dashboard summary
  const totalDays = 200;
  const percentage = (attendanceData.length / totalDays * 100).toFixed(0);
  const summaryText = document.getElementById('attendanceSummaryText');
  if (summaryText) summaryText.textContent = `Current: ${percentage}%`;

  // Populate detailed attendance page
  renderSummaryCards(attendanceData);
  // renderAttendanceCalendar(attendanceData); // You can add this back if you have the calendar HTML
}

function renderSummaryCards(attendanceData) {
    const totalDaysInYear = 200;
    const overallPercentage = (attendanceData.length / totalDaysInYear * 100).toFixed(0);
    const now = new Date();
    const currentMonth = now.getMonth();
    const daysInMonth = new Date(now.getFullYear(), currentMonth + 1, 0).getDate();
    const monthAttendance = attendanceData.filter(rec => new Date(rec.timestamp).getMonth() === currentMonth).length;

    const overallProgress = document.getElementById('overall-progress');
    const overallLabel = document.getElementById('overall-label');
    const monthProgress = document.getElementById('month-progress');
    const monthLabel = document.getElementById('month-label');

    if(overallProgress) overallProgress.style.width = `${overallPercentage}%`;
    if(overallLabel) overallLabel.textContent = `${overallPercentage}%`;
    if(monthProgress) monthProgress.style.width = `${(monthAttendance / daysInMonth) * 100}%`;
    if(monthLabel) monthLabel.textContent = `${monthAttendance} / ${daysInMonth} days`;
}


// ===============================
// UI Helpers
// ===============================
function showDashboard() {
  document.getElementById("loginPage").style.display = "none";
  document.getElementById("dashboardPage").style.display = "block";
  navigateTo('dashboardView');
}

function showLogin() {
  document.getElementById("loginPage").style.display = "flex";
  document.getElementById("dashboardPage").style.display = "none";
}

function updateCurrentTime() {
    const now = new Date();
    const dateEl = document.getElementById('currentDate');
    const timeEl = document.getElementById('currentTime');
    if (dateEl) dateEl.textContent = now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    if (timeEl) timeEl.textContent = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function populateYearAndMonthSelectors() {
    const monthSelect = document.getElementById('month-select');
    const yearSelect = document.getElementById('year-select');
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    if (monthSelect) { months.forEach((month, index) => { monthSelect.options[index] = new Option(month, index); }); monthSelect.value = currentMonth; }
    if (yearSelect) { for (let i = 0; i < 5; i++) { yearSelect.options[i] = new Option(currentYear - i, currentYear - i); } }
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification notification-${type} show`;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => { notification.classList.remove('show'); setTimeout(() => notification.remove(), 500); }, 3000);
}
