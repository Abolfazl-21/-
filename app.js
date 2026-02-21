// ===================
// Navbar
// ===================
const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        navButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        sections.forEach(sec => sec.style.display = 'none');
        const sectionId = btn.getAttribute('data-section');
        document.getElementById(sectionId).style.display = 'block';
    });
});

// ===================
// ساعت و تاریخ و روزشمار
// ===================
const examDate = new Date('2026-07-02'); 
const finalExamDate = new Date('2026-05-21');

function updateClock() {
    const now = new Date();
    const j = jalaali.toJalaali(now.getFullYear(), now.getMonth()+1, now.getDate());

    const hours = String(now.getHours()).padStart(2,'0');
    const minutes = String(now.getMinutes()).padStart(2,'0');
    const seconds = String(now.getSeconds()).padStart(2,'0');
    document.getElementById('time').innerText = `${hours}:${minutes}:${seconds}`;
    document.getElementById('date').innerText = `${j.jy}/${j.jm}/${j.jd}`;

    const diffExam = examDate - now;
    const daysExam = Math.ceil(diffExam / (1000*60*60*24));
    document.getElementById('daysLeft').innerText = `${daysExam} روز مانده تا کنکور`;

    const diffFinal = finalExamDate - now;
    const daysFinal = Math.ceil(diffFinal / (1000*60*60*24));
    document.getElementById('daysLeftFinal').innerText = `${daysFinal} روز مانده تا امتحانات نهایی`;
}

setInterval(updateClock, 1000);
updateClock();

// ===================
// JalaliDatePicker
// ===================
jalaliDatepicker.startWatch({
    date: true,
    autoShow: true,
    showTodayBtn: true,
    showEmptyBtn: true,
    container: "body",
});

function updateTodaySummary() {
    const today = new Date();
    const j = jalaali.toJalaali(today.getFullYear(), today.getMonth()+1, today.getDate());

    // فرمت yyyy/mm/dd با صفر پیش‌رو
    const todayStr = `${String(j.jy).padStart(4,'0')}/${String(j.jm).padStart(2,'0')}/${String(j.jd).padStart(2,'0')}`;

    const allReports = localStorage.getItem('reports') ? JSON.parse(localStorage.getItem('reports')) : [];
    
    // فیلتر گزارش‌های امروز با دقت کامل
    const todayReports = allReports.filter(r => r.date === todayStr);

    const container = document.getElementById('todaySummary');

    if(!container) return;

    if(todayReports.length === 0){
        container.innerHTML = `<strong>امروز مطالعه‌ای ثبت نشده</strong>`;
        container.style.background = "#fff3f3";
        container.style.color = "#d32f2f";
        container.style.padding = "15px";
        container.style.borderRadius = "12px";
        container.style.boxShadow = "0 3px 8px rgba(0,0,0,0.1)";
    } else {
        let totalAlpha = 0, totalBeta = 0, totalA = 0;
        todayReports.forEach(r => {
            totalAlpha += Number(r.alpha) || 0;
            totalBeta += Number(r.beta) || 0;
            totalA += Number(r.A) || 0;
        });

        const totalStudy = totalAlpha + totalBeta + totalA;

        const totalAlphaH = Math.floor(totalAlpha / 60);
        const totalAlphaM = totalAlpha % 60;

        const totalBetaH = Math.floor(totalBeta / 60);
        const totalBetaM = totalBeta % 60;

        const totalAH = Math.floor(totalA / 60);
        const totalAM = totalA % 60;

        const totalStudyH = Math.floor(totalStudy / 60);
        const totalStudyM = totalStudy % 60;

        container.innerHTML = `
            <strong>${todayReports.length} گزارش ثبت شد</strong><br>
            مرور (α): ${totalAlphaH} ساعت و ${totalAlphaM} دقیقه<br>
            حل تمرین (β): ${totalBetaH} ساعت و ${totalBetaM} دقیقه<br>
            استاد (A): ${totalAH} ساعت و ${totalAM} دقیقه<br>
            مجموع زمان مطالعه: ${totalStudyH} ساعت و ${totalStudyM} دقیقه
        `;

        container.style.background = "#e3f2fd";
        container.style.color = "#0d47a1";
        container.style.padding = "15px";
        container.style.borderRadius = "12px";
        container.style.boxShadow = "0 3px 8px rgba(0,0,0,0.1)";
    }
}

updateTodaySummary();
document.getElementById("reportForm").addEventListener("submit", (e) => {
    e.preventDefault();
    saveReport();
    updateTodaySummary();
});

// ===================
// ثبت گزارش مطالعه
// ===================
function saveReport() {
    const dateRaw = document.getElementById("studyDate").value;
    const subject = document.getElementById("subject").value.trim();
    if (!dateRaw || !subject) {
        alert("گزارش جدید ثبت شد!");
        return;
    }

    const topic = document.getElementById("topic").value.trim();
    const alpha = parseInt(document.getElementById("alpha").value) || 0;
    const beta = parseInt(document.getElementById("beta").value) || 0;
    const yTests = parseInt(document.getElementById("yTests").value) || 0;
    const xTests = parseInt(document.getElementById("xTests").value) || 0;
    const aTime = parseInt(document.getElementById("aTime").value) || 0;
    const quality = document.getElementById("studyQuality").value.trim();
    const notes = document.getElementById("notes").value.trim();

    // فرمت تاریخ شمسی استاندارد
    const parts = dateRaw.split('/');
    const dateKey = `${parts[0].padStart(4,'0')}/${parts[1].padStart(2,'0')}/${parts[2].padStart(2,'0')}`;

    // گرفتن آرایه کل گزارش‌ها
    let allReports = localStorage.getItem('reports') ? JSON.parse(localStorage.getItem('reports')) : [];
    allReports.push({date: dateKey, subject, topic, alpha, beta, yTests, xTests, A: aTime, quality, notes});
    localStorage.setItem('reports', JSON.stringify(allReports));

    document.getElementById("reportForm").reset();
    populateSubjectsTable(); // جدول فوراً آپدیت شود
    document.querySelector('[data-section="listSection"]').click();
}

// ===================
// جدول لیست دروس با حذف
// ===================
function populateSubjectsTable() {
    const tbody = document.querySelector("#subjectsTable tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    let allReports = localStorage.getItem('reports') ? JSON.parse(localStorage.getItem('reports')) : [];

    // مرتب‌سازی بر اساس تاریخ
    allReports.sort((a,b) => a.date.localeCompare(b.date));

    allReports.forEach((r,index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${r.date}</td>
            <td>${r.subject}</td>
            <td>${r.topic}</td>
            <td>${r.alpha}</td>
            <td>${r.beta}</td>
            <td>${r.A}</td>
            <td>${r.yTests}</td>
            <td>${r.xTests}</td>
            <td>${r.quality}</td>
            <td>
                <button class="delete-btn">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);

        tr.querySelector(".delete-btn").addEventListener("click", () => {
            if (confirm("آیا مطمئن هستید می‌خواهید این گزارش حذف شود؟")) {
                allReports.splice(index,1);
                localStorage.setItem('reports', JSON.stringify(allReports));
                populateSubjectsTable();
            }
        });
    });

    filterSubjectsTable();
}

// ===================
// فیلتر جدول
// ===================
function filterSubjectsTable() {
    const subjectFilter = document.getElementById("filterSubject").value.toLowerCase();
    const startDate = document.getElementById("filterStartDate").value;
    const endDate = document.getElementById("filterEndDate").value;

    const rows = document.querySelectorAll("#subjectsTable tbody tr");
    rows.forEach(row => {
        const subject = row.cells[1].innerText.toLowerCase();
        const date = row.cells[0].innerText;

        let dateInRange = true;
        if (startDate) dateInRange = date >= startDate;
        if (endDate) dateInRange = dateInRange && date <= endDate;

        if ((subject.includes(subjectFilter) || subjectFilter === "") && dateInRange) row.style.display = "";
        else row.style.display = "none";
    });
}

// ===================
// Chart.js setup
// ===================
const timeChartCtx = document.getElementById('timeChart').getContext('2d');
const testChartCtx = document.getElementById('testChart').getContext('2d');
const customChartCtx = document.getElementById('customChart').getContext('2d');

let timeChartInstance, testChartInstance, customChartInstance;

// ===================
// توابع کمکی
// ===================
function groupReportsByDateAndSubject(reports, subjectFilter="", startDate="", endDate="") {
    let grouped = {};
    reports.forEach(r => {
        if (subjectFilter && !r.subject.includes(subjectFilter)) return;
        if (startDate && r.date < startDate) return;
        if (endDate && r.date > endDate) return;

        const key = r.date + "|" + r.subject;
        if (!grouped[key]) grouped[key] = {date: r.date, subject: r.subject, alpha:0, beta:0, A:0, Y:0, X:0};
        grouped[key].alpha += parseInt(r.alpha);
        grouped[key].beta += parseInt(r.beta);
        grouped[key].A += parseInt(r.A);
        grouped[key].Y += parseInt(r.yTests);
        grouped[key].X += parseInt(r.xTests);
    });
    return Object.values(grouped);
}
function getColors(count) {
    const palette = [
        '#4e79a7','#f28e2b','#e15759','#76b7b2','#59a14f','#edc949','#af7aa1','#ff9da7','#9c755f','#bab0ab'
    ];
    let colors = [];
    for(let i=0;i<count;i++) colors.push(palette[i % palette.length]);
    return colors;
}
// ===================
// رسم نمودار زمان مطالعه
// ===================
function drawTimeChart() {
    const reports = localStorage.getItem('reports') ? JSON.parse(localStorage.getItem('reports')) : [];
    const subjectFilter = document.getElementById("timeChartSubjectFilter").value.trim();
    const startDate = document.getElementById("timeChartStartDate").value.trim();
    const endDate = document.getElementById("timeChartEndDate").value.trim();

    const grouped = groupReportsByDateAndSubject(reports, subjectFilter, startDate, endDate);
    const labels = grouped.map(r=>r.date+" "+r.subject);
    const myTimes = grouped.map(r=>r.alpha + r.beta);
    const teacherTimes = grouped.map(r=>r.A);

    if(timeChartInstance) timeChartInstance.destroy();
    timeChartInstance = new Chart(timeChartCtx, {
        type:'bar',
        data:{
            labels: labels,
            datasets:[
                {
                    label:'زمان من (α+β)',
                    data: myTimes,
                    backgroundColor:getColors(myTimes.length),
                    borderRadius:5,
                    borderWidth:1,
                    borderColor:'#333'
                },
                {
                    label:'زمان استاد (A)',
                    data: teacherTimes,
                    backgroundColor:getColors(teacherTimes.length).map(c=>c+'66'), // کمی شفاف
                    borderRadius:5,
                    borderWidth:1,
                    borderColor:'#333'
                }
            ]
        },
        options:{
            responsive:true,
            plugins:{
                legend:{position:'top', labels:{font:{size:14}}},
                tooltip:{mode:'index', intersect:false}
            },
            scales:{
                y:{beginAtZero:true, title:{display:true, text:'تایم', color:'#000000',font:{size:14, weight:'bold'}}},
                x:{title:{display:true, text:'تاریخ و درس', color:'#000000', font:{size:14, weight:'bold'}}}
            }
        }
    });
}
// ===================
// رسم نمودار تعداد تست
// ===================
function drawTestChart() {
    const reports = localStorage.getItem('reports') ? JSON.parse(localStorage.getItem('reports')) : [];
    const subjectFilter = document.getElementById("testChartSubjectFilter").value.trim();
    const startDate = document.getElementById("testChartStartDate").value.trim();
    const endDate = document.getElementById("testChartEndDate").value.trim();

    const grouped = groupReportsByDateAndSubject(reports, subjectFilter, startDate, endDate);
    const labels = grouped.map(r=>r.date+" "+r.subject);
    const myTests = grouped.map(r=>r.Y);
    const teacherTests = grouped.map(r=>r.X);

    if(testChartInstance) testChartInstance.destroy();
    testChartInstance = new Chart(testChartCtx, {
        type:'bar',
        data:{
            labels: labels,
            datasets:[
                {
                    label:'تست من (Y)',
                    data: myTests,
                    backgroundColor:getColors(myTests.length),
                    borderRadius:5,
                    borderWidth:1,
                    borderColor:'#333'
                },
                {
                    label:'تست استاد (X)',
                    data: teacherTests,
                    backgroundColor:getColors(teacherTests.length).map(c=>c+'66'),
                    borderRadius:5,
                    borderWidth:1,
                    borderColor:'#333'
                }
            ]
        },
        options:{
            responsive:true,
            plugins:{
                legend:{position:'top', labels:{font:{size:14}}},
                tooltip:{mode:'index', intersect:false}
            },
            scales:{
                y:{beginAtZero:true, title:{display:true, text:'تعداد تست', color:'#000000', font:{size:14, weight:'bold'}}},
                x:{title:{display:true, text:'تاریخ و درس', color:'#000000', font:{size:14, weight:'bold'}}}
            }
        }
    });
}

// ===================
// نمودار سفارشی خطی
// ===================
function drawCustomChart() {
    const reports = localStorage.getItem('reports') ? JSON.parse(localStorage.getItem('reports')) : [];
    const subjectFilter = document.getElementById("customChartSubjectFilter").value.trim();
    const startDate = document.getElementById("customChartStartDate").value.trim();
    const endDate = document.getElementById("customChartEndDate").value.trim();
    const type = document.getElementById("customChartTypeSelect").value;

    const grouped = groupReportsByDateAndSubject(reports, subjectFilter, startDate, endDate);
    const labels = grouped.map(r => r.date + " " + r.subject);
    
    let data = [];
    let labelName = "";

    switch(type){
        case "Y": data = grouped.map(r => r.Y); labelName="تست من (Y)"; break;
        case "X": data = grouped.map(r => r.X); labelName="تست استاد (X)"; break;
        case "time": data = grouped.map(r => r.alpha + r.beta); labelName="زمان من (α+β)"; break;
        case "A": data = grouped.map(r => r.A); labelName="زمان استاد (A)"; break;
    }

    if(customChartInstance) customChartInstance.destroy();
    customChartInstance = new Chart(customChartCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
            label: labelName,
            data: data,
            borderColor: 'rgb(255, 115, 0)',
            fill: true,
            backgroundColor: 'rgba(255, 153, 0, 0.23)',
            tension: 0.3,
            borderWidth: 2,
            pointRadius: 5,
            pointBackgroundColor: '#000000'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top', labels: { font: { size: 14 } } },
                tooltip: { mode: 'index', intersect: false }
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'مقدار', color: '#000000', font: { size: 14, weight: 'bold' } } },
                x: { title: { display: true, text: 'تاریخ و درس', color: '#000000', font: { size: 14, weight: 'bold' } } }
            }
        }
    });
}

// ===================
// Event Listener ها
// ===================
["timeChartSubjectFilter","timeChartStartDate","timeChartEndDate"].forEach(id => {
    document.getElementById(id).addEventListener("input", drawTimeChart);
});

["testChartSubjectFilter","testChartStartDate","testChartEndDate"].forEach(id => {
    document.getElementById(id).addEventListener("input", drawTestChart);
});

["customChartSubjectFilter","customChartStartDate","customChartEndDate","customChartTypeSelect"].forEach(id => {
    document.getElementById(id).addEventListener("input", drawCustomChart);
});

document.querySelector('[data-section="analyticsSection"]').addEventListener("click", ()=>{
    drawTimeChart();
    drawTestChart();
    drawCustomChart();
});

// ===================
// Event Listener ها
// ===================
document.getElementById("filterSubject").addEventListener("input", filterSubjectsTable);
document.getElementById("filterStartDate").addEventListener("input", filterSubjectsTable);
document.getElementById("filterEndDate").addEventListener("input", filterSubjectsTable);

document.querySelector('[data-section="listSection"]').addEventListener("click", populateSubjectsTable);
document.getElementById("reportForm").addEventListener("submit", (e) => {
    e.preventDefault();
    saveReport();
});

// =======================
// محاسبه هفته جاری شمسی
// =======================
function getCurrentJalaliWeekRange() {
    const now = new Date();
    const j = jalaali.toJalaali(now.getFullYear(), now.getMonth()+1, now.getDate());

    // تبدیل به میلادی برای محاسبه روز هفته
    const g = jalaali.toGregorian(j.jy, j.jm, j.jd);
    const current = new Date(g.gy, g.gm - 1, g.gd);

    const day = current.getDay(); // 0=Sunday
    const diffToSaturday = (day + 1) % 7;

    const startWeek = new Date(current);
    startWeek.setDate(current.getDate() - diffToSaturday);

    const endWeek = new Date(startWeek);
    endWeek.setDate(startWeek.getDate() + 6);

    return { startWeek, endWeek };
}

// تبدیل تاریخ شمسی گزارش به Date
function jalaliStringToDate(str){
    const [jy,jm,jd] = str.split('/').map(Number);
    const g = jalaali.toGregorian(jy,jm,jd);
    return new Date(g.gy, g.gm-1, g.gd);
}

// =======================
// چک فرمول‌ها
// =======================
function checkFormulas(){
    let reports = JSON.parse(localStorage.getItem('reports') || '[]');
    const {startWeek, endWeek} = getCurrentJalaliWeekRange();

    let sumA=0, sumAlpha=0, sumBeta=0, sumX=0, sumY=0;

    reports.forEach(r=>{
        const d = jalaliStringToDate(r.date);
        if(d >= startWeek && d <= endWeek){
            sumA += r.A;
            sumAlpha += r.alpha;
            sumBeta += r.beta;
            sumX += r.xTests;
            sumY += r.yTests;
        }
    });

    const sumB = sumAlpha + sumBeta;

    // ===== شرط 1 =====
    const totalMinutes = sumA + sumB;
    const totalHours = totalMinutes / 60;
    const percentAB = Math.min((totalHours/72)*100,100);

    document.getElementById("barAB").style.width = percentAB + "%";
    document.getElementById("textABTop").innerText =
    `${totalHours.toFixed(1)} / 72 ساعت`;

document.getElementById("textABBottom").innerText =
    `${totalHours.toFixed(1)} ساعت مطالعه این هفته`;


    // ===== شرط 2 =====
    const diffAB = sumB - sumA;
    document.getElementById("checkA_B").innerText =
        diffAB >= 0
        ? `✅ برقرار | ${diffAB} دقیقه بیشتر از استاد`
        : `❌ برقرار نیست | ${Math.abs(diffAB)} دقیقه کمتر از استاد`;

    // ===== شرط 3 =====
    const diffBA = sumBeta - sumAlpha;
    document.getElementById("checkBetaAlpha").innerText =
        diffBA >= 0
        ? `✅ برقرار | ${diffBA} دقیقه حل تمرین بیشتر`
        : `❌ برقرار نیست | ${Math.abs(diffBA)} دقیقه مرور بیشتر`;

    // ===== شرط 4 =====
    const totalTests = sumX + sumY;
    const percentTests = Math.min((totalTests/800)*100,100);

    document.getElementById("barTests").style.width = percentTests + "%";
    document.getElementById("textTestsTop").innerText =
    `${totalTests} / 800 تست`;

document.getElementById("textTestsBottom").innerText =
    `${totalTests} تست این هفته`;

}

// هر بار رفتی به تحلیل اجرا شود
document.querySelector('[data-section="analyticsSection"]')
    .addEventListener("click", checkFormulas);

// ===================
// تنظیمات - تاریخ‌های مهم
// ===================
function saveImportantDates(){
    localStorage.setItem('examDate', document.getElementById('examDateInput').value);
    localStorage.setItem('finalDate', document.getElementById('finalDateInput').value);
    alert("ذخیره شد");
}

// ===================
// مدیریت درس‌ها
// ===================
function loadSubjects(){
    const list = document.getElementById('subjectsList');
    list.innerHTML = "";
    let subjects = JSON.parse(localStorage.getItem('subjects') || "[]");

    subjects.forEach((s,i)=>{
        const li = document.createElement('li');
        li.innerHTML = `${s} <button onclick="deleteSubject(${i})">حذف</button>`;
        list.appendChild(li);
    });

    // پر کردن dropdown فرم ثبت
    const subjectInput = document.getElementById("subject");
    if(subjectInput.tagName==="SELECT"){
        subjectInput.innerHTML = subjects.map(s=>`<option>${s}</option>`).join('');
    }
}

function addSubject(){
    let subjects = JSON.parse(localStorage.getItem('subjects') || "[]");
    subjects.push(document.getElementById('newSubject').value);
    localStorage.setItem('subjects', JSON.stringify(subjects));
    loadSubjects();
}

function deleteSubject(i){
    let subjects = JSON.parse(localStorage.getItem('subjects') || "[]");
    subjects.splice(i,1);
    localStorage.setItem('subjects', JSON.stringify(subjects));
    loadSubjects();
}

// ===================
// حد فرمول‌ها
// ===================
function saveLimits(){
    localStorage.setItem('hourLimit', document.getElementById('hourLimit').value || 72);
    localStorage.setItem('testLimit', document.getElementById('testLimit').value || 800);
    alert("ذخیره شد");
}

// ===================
// دارک مود
// ===================
function toggleDarkMode() {
    document.body.classList.toggle("light");
    document.body.classList.toggle("dark");
}

// ===================
// واحد زمان نمودار
// ===================
function saveTimeUnit(){
    localStorage.setItem('timeUnit', document.getElementById('timeUnitSelect').value);
}

// ===================
// بکاپ و ریستور
// ===================
function backupData(){
    const data = JSON.stringify(localStorage);
    const blob = new Blob([data], {type:"application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "backup.json";
    a.click();
}

function restoreData(){
    const file = document.getElementById('restoreFile').files[0];
    const reader = new FileReader();
    reader.onload = function(e){
        const data = JSON.parse(e.target.result);
        Object.keys(data).forEach(k=>localStorage.setItem(k,data[k]));
        alert("ریستور شد");
    }
    reader.readAsText(file);
}

// ===================
// ریست کامل
// ===================
function resetAllData(){
    if(confirm("کل اطلاعات حذف شود؟")){
        localStorage.clear();
        location.reload();
    }
}

// ===================
// اجرا هنگام لود
// ===================
window.addEventListener('load', ()=>{
    loadSubjects();

    if(localStorage.getItem('darkMode')==="true")
        document.body.classList.add('dark-mode');
});

