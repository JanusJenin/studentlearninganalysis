let currentUser = null;
let currentRoleTab = 'student';
let quizChartInstance = null;
let loginChartInstance = null;
let teacherClassChart = null;
let teacherSubChart = null;
let adminLoadChart = null;

// --- Theme Toggle --- //
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    themeToggle.innerText = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    if(quizChartInstance || loginChartInstance) renderCharts();
});

// --- Modal Profile --- //
function showProfileModal() {
    if(!currentUser) return;
    document.getElementById('profileModal').style.display = 'flex';
    document.getElementById('profSidebarName').innerText = currentUser.name;
    document.getElementById('profInpName').value = currentUser.name;
    document.getElementById('profSidebarEmail').innerText = currentUser.name.toLowerCase().replace(' ','.') + '@email.com';
    document.getElementById('profInpEmail').value = currentUser.name.toLowerCase().replace(' ','.') + '@email.com';
}
function closeProfile() {
    document.getElementById('profileModal').style.display = 'none';
}

// --- Login Page Logic --- //
function selectRole(role) {
    currentRoleTab = role;
    document.querySelectorAll('.role-icon').forEach(el => el.classList.remove('selected'));
    
    let username = '';
    let pwd = 'password123';

    if(role === 'student') {
        document.getElementById('rStudent').classList.add('selected');
        username = 'student1';
    }
    else if(role === 'teacher') {
        document.getElementById('rTeacher').classList.add('selected');
        username = 'teacher1';
    }
    else {
        document.getElementById('rAdmin').classList.add('selected');
        username = 'admin';
    }

    document.getElementById('username').value = username;
    document.getElementById('password').value = pwd;
}

selectRole('student');

// --- View Router --- //
function showAppView(viewId) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
}

// --- Auth --- //
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        
        if(data.success) {
            currentUser = data.user;
            document.getElementById('loginLayout').style.display = 'none';
            document.getElementById('appLayout').style.display = 'flex';
            routeUser();
        } else {
            document.getElementById('loginError').innerText = data.message;
            document.getElementById('loginError').style.display = 'block';
        }
    } catch (err) {
        console.error(err);
    }
});

function logout() {
    closeProfile();
    currentUser = null;
    document.getElementById('appLayout').style.display = 'none';
    document.getElementById('loginLayout').style.display = 'flex';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    if(quizChartInstance) quizChartInstance.destroy();
    if(loginChartInstance) loginChartInstance.destroy();
    if(teacherClassChart) teacherClassChart.destroy();
    if(teacherSubChart) teacherSubChart.destroy();
    if(adminLoadChart) adminLoadChart.destroy();
    selectRole('student');
}

function routeUser() {
    if(!currentUser) return;
    if(currentUser.role === 'admin') loadAdminDashboard();
    else if(currentUser.role === 'teacher') loadTeacherDashboard();
    else if(currentUser.role === 'student') loadStudentDashboard();
}

// --- Admin --- //
async function loadAdminDashboard() {
    showAppView('adminView');
    const res = await fetch('/api/users');
    const users = await res.json();
    
    const tbody = document.querySelector('#adminUsersTable tbody');
    tbody.innerHTML = '';
    users.forEach(u => {
        tbody.innerHTML += `<tr><td>${u.id}</td><td>${u.name}</td><td><span class="badge">${u.role.toUpperCase()}</span></td></tr>`;
    });
    renderAdminCharts();
}
function adminExportPDF() {
    const doc = new window.jspdf.jsPDF();
    doc.setFillColor(13, 148, 136); doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(22); doc.setFont("helvetica", "bold");
    doc.text("System Admin Report", 14, 20);
    doc.setTextColor(50, 50, 50); doc.setFontSize(12); doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 40);
    
    doc.autoTable({ html: '#adminUsersTable', startY: 50, headStyles: { fillColor: [79, 70, 229] } });
    
    doc.setFontSize(10); doc.setTextColor(150, 150, 150);
    doc.text("SLPCT Official Admin Report", 105, 280, null, null, "center");
    doc.save('Admin_Users_Report.pdf');
}

// --- Teacher --- //
async function loadTeacherDashboard() {
    showAppView('teacherView');
    
    const alertRes = await fetch('/api/alerts');
    const alerts = await alertRes.json();
    const alertsList = document.getElementById('alertsList');
    alertsList.innerHTML = alerts.length === 0 ? '<p style="color:var(--text-muted)">No active alerts.</p>' : '';
    alerts.forEach(a => {
        alertsList.innerHTML += `<div class="badge warn" style="display:block; margin-bottom:1rem; padding:1rem">
            <strong>${a.studentName}</strong>: ${a.message}
        </div>`;
    });

    const studentRes = await fetch('/api/students');
    const students = await studentRes.json();
    const tStudents = document.querySelector('#teacherStudentsTable tbody');
    tStudents.innerHTML = '';
    students.forEach(s => {
        const ptn = s.log?.pattern || 'N/A';
        const isInc = ptn.includes('Inconsistent');
        tStudents.innerHTML += `<tr>
            <td>${s.id}</td><td>${s.name}</td><td>${s.log?.logins || 0}</td><td>${s.log?.avgQuizScore || 0}%</td>
            <td><span class="badge ${isInc ? 'warn' : ''}">${ptn}</span></td>
        </tr>`;
    });
    renderTeacherCharts();
}
function teacherExportPDF() {
    const doc = new window.jspdf.jsPDF();
    doc.setFillColor(124, 58, 237); doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(22); doc.setFont("helvetica", "bold");
    doc.text("Class Performance Report", 14, 20);
    
    doc.setTextColor(50, 50, 50); doc.setFontSize(12); doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${new Date().toLocaleDateString()} | Teacher: ${currentUser.name}`, 14, 40);
    
    doc.autoTable({ html: '#teacherStudentsTable', startY: 50, headStyles: { fillColor: [124, 58, 237] } });
    
    doc.setFontSize(10); doc.setTextColor(150, 150, 150);
    doc.text("SLPCT Official Teacher Report", 105, 280, null, null, "center");
    doc.save('Teacher_Class_Report.pdf');
}

// --- Student --- //
async function loadStudentDashboard() {
    showAppView('studentView');
    document.getElementById('hdrName').innerText = currentUser.name.split(' ')[0];

    const studentRes = await fetch('/api/students');
    const students = await studentRes.json();
    const myData = students.find(s => s.id === currentUser.id);
    
    if(myData && myData.log) {
        document.getElementById('stAvgQuiz').innerText = myData.log.avgQuizScore + '%';
        document.getElementById('stLogins').innerText = (myData.log.logins / 4).toFixed(1);
        
        const isBad = myData.log.pattern.includes('Inconsistent');
        document.getElementById('swRisk').innerText = isBad ? 'High Risk' : 'Low Risk';

        document.getElementById('studentPatternContent').innerHTML = `
            Total Logins: ${myData.log.logins}
            Average Quiz Score: ${myData.log.avgQuizScore}%
            Learning Pattern: ${myData.log.pattern}
        `;
    }

    // Materials
    const matRes = await fetch('/api/materials');
    const materials = await matRes.json();
    const grid = document.getElementById('materialsGrid');
    grid.innerHTML = '';
    materials.forEach(m => {
        grid.innerHTML += `
        <div class="task-item">
            <div class="task-left">
                <p>${m.title}</p>
                <span>${m.description.substring(0,30)}...</span>
            </div>
            <a href="${m.url}" target="_blank">
                <button class="secondary" style="padding:0.4rem 1rem; border-radius:12px">Get</button>
            </a>
        </div>`;
    });

    renderCharts();
}

// --- Upload Logic --- //
document.getElementById('assignmentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('assignmentFile');
    const stat = document.getElementById('uploadStatus');
    
    if(fileInput.files.length === 0) return;
    stat.innerHTML = `<span style="color: var(--text-muted)">Processing...</span>`;

    const formData = new FormData();
    formData.append('assignment', fileInput.files[0]);
    formData.append('studentId', currentUser.id);

    try {
        const res = await fetch('/api/assignments/upload', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        if(data.success) {
            stat.innerHTML = `<span style="color: var(--color-teal); font-weight:bold">Success: ${data.assignment.filename}</span>`;
            fileInput.value = '';
        } else {
            stat.innerHTML = `<span style="color: #ef4444">${data.message || 'Upload failed.'}</span>`;
        }
    } catch(err) {
        stat.innerHTML = `<span style="color: #ef4444">System error.</span>`;
    }
});

// --- Charts Rendering (Light Mode Theme) --- //
function renderCharts() {
    if(quizChartInstance) quizChartInstance.destroy();
    if(loginChartInstance) loginChartInstance.destroy();

    Chart.defaults.color = '#6b7280';
    Chart.defaults.font.family = "'Inter', sans-serif";

    const ctxQ = document.getElementById('quizChart').getContext('2d');
    quizChartInstance = new Chart(ctxQ, {
        type: 'line',
        data: {
            labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
            datasets: [{
                label: 'Quiz Scores',
                data: [42, 54, 50, 49, 65, 59, 61],
                borderColor: '#ea580c',
                backgroundColor: 'rgba(234, 88, 12, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: { y: { display: false, min:0 }, x: { grid: { display: false } } },
            plugins: { legend: { display: false } }
        }
    });

    const ctxL = document.getElementById('loginChart').getContext('2d');
    loginChartInstance = new Chart(ctxL, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
            datasets: [{
                label: 'Logins',
                data: [4, 7, 5, 8, 6],
                backgroundColor: '#7c3aed',
                borderRadius: 8,
                barPercentage: 0.5
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: { y: { display:false, min:0 }, x: { grid: { display: false } } },
            plugins: { legend: { display: false } }
        }
    });
}

function renderTeacherCharts() {
    if(teacherClassChart) teacherClassChart.destroy();
    if(teacherSubChart) teacherSubChart.destroy();

    Chart.defaults.color = '#6b7280';
    Chart.defaults.font.family = "'Inter', sans-serif";

    const ctxClass = document.getElementById('teacherClassChart').getContext('2d');
    teacherClassChart = new Chart(ctxClass, {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                label: 'Average Score',
                data: [65, 70, 68, 75],
                borderColor: '#0d9488',
                backgroundColor: 'rgba(13, 148, 136, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { display: false, min: 0 }, x: { grid: { display: false } } } }
    });

    const ctxSub = document.getElementById('teacherSubmissionChart').getContext('2d');
    teacherSubChart = new Chart(ctxSub, {
        type: 'doughnut',
        data: {
            labels: ['Submitted', 'Pending', 'Late'],
            datasets: [{
                data: [65, 20, 15],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                borderWidth: 0
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { position: 'right' } } }
    });
}

function renderAdminCharts() {
    if(adminLoadChart) adminLoadChart.destroy();

    Chart.defaults.color = '#6b7280';
    Chart.defaults.font.family = "'Inter', sans-serif";

    const ctxLoad = document.getElementById('adminLoadChart').getContext('2d');
    adminLoadChart = new Chart(ctxLoad, {
        type: 'line',
        data: {
            labels: ['10am', '11am', '12pm', '1pm', '2pm', '3pm'],
            datasets: [{
                label: 'Requests/sec',
                data: [120, 300, 450, 200, 310, 480],
                borderColor: '#4f46e5',
                borderWidth: 2,
                tension: 0.3,
                pointRadius: 0
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { display: false, min: 0 }, x: { grid: { display: false } } } }
    });
}

function studentExportPDF() {
    const doc = new window.jspdf.jsPDF();
    doc.setFillColor(13, 148, 136); doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(22); doc.setFont("helvetica", "bold");
    doc.text("SLPCT Analytics Report", 14, 20);
    doc.setTextColor(50, 50, 50); doc.setFontSize(16);
    doc.text(`Student: ${currentUser.name}`, 14, 45);
    doc.setFontSize(12); doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 52);
    
    doc.setDrawColor(200, 200, 200); doc.line(14, 58, 196, 58);
    
    let yPos = 70; doc.setTextColor(30); doc.setFontSize(14);
    const textData = document.getElementById('studentPatternContent').innerText.split('\n').filter(l=>l.trim()!=='');
    textData.forEach((line) => {
        if(line.includes(':')) {
            const parts = line.split(':');
            doc.setFont("helvetica", "bold"); doc.text(parts[0] + ":", 14, yPos);
            doc.setFont("helvetica", "normal"); doc.text(parts[1].trim(), 80, yPos);
        } else {
            doc.text(line, 14, yPos);
        }
        yPos += 12;
    });

    doc.setFontSize(10); doc.setTextColor(150, 150, 150);
    doc.text("SLPCT Official Report", 105, 280, null, null, "center");
    doc.save('My_Analytics_Report.pdf');
}
