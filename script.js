import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// --- ISI DATA FIREBASE KAMU DI SINI ---
const firebaseConfig = {
  apiKey: "ISI_API_KEY",
  authDomain: "ISI_AUTH_DOMAIN",
  projectId: "ISI_PROJECT_ID",
  storageBucket: "ISI_STORAGE_BUCKET",
  messagingSenderId: "ISI_MESSAGING_SENDER_ID",
  appId: "ISI_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const colRef = collection(db, "absensi_guru");

let dataAbsen = [];
let selectedStatus = "";

// Mengambil data real-time
onSnapshot(query(colRef, orderBy("timestamp", "desc")), (snapshot) => {
  dataAbsen = [];
  snapshot.forEach((doc) => {
    dataAbsen.push({ id: doc.id, ...doc.data() });
  });
  if (document.getElementById("tbl-body")) renderTable();
  if (document.getElementById("stats-row")) renderStats();
});

// FUNGSI-FUNGSI YANG DIBUTUHKAN HTML
window.showPage = function(id) {
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo(0, 0);
};

window.pilihStatus = function(el, status) {
  document.querySelectorAll(".status-btn").forEach((b) => b.classList.remove("selected"));
  el.classList.add("selected");
  selectedStatus = status;
};

window.kirimAbsensi = async function() {
  const nama = document.getElementById("select-nama").value;
  const errEl = document.getElementById("form-err");
  if (!nama || !selectedStatus) {
    errEl.style.display = "block";
    return;
  }
  errEl.style.display = "none";
  const now = new Date();
  
  await addDoc(colRef, { 
    nama, 
    tanggal: now.toLocaleDateString('id-ID'), 
    waktu: now.getHours() + "." + now.getMinutes().toString().padStart(2, '0'), 
    status: selectedStatus, 
    timestamp: now 
  });

  window.showPage("page-berhasil");
};

window.renderStats = function() {
  const c = { hadir: 0, sakit: 0, izin: 0, alpa: 0 };
  dataAbsen.forEach(r => { if (c[r.status] !== undefined) c[r.status]++; });
  document.getElementById("stats-row").innerHTML = 
    `<div class="stat-card"><div class="stat-num">${dataAbsen.length}</div><div class="stat-lbl">Total</div></div>` +
    `<div class="stat-card"><div class="stat-num">${c.hadir}</div><div class="stat-lbl">Hadir</div></div>` +
    `<div class="stat-card"><div class="stat-num">${c.sakit}</div><div class="stat-lbl">Sakit</div></div>` +
    `<div class="stat-card"><div class="stat-num">${c.izin}</div><div class="stat-lbl">Izin</div></div>` +
    `<div class="stat-card"><div class="stat-num">${c.alpa}</div><div class="stat-lbl">Alpa</div></div>`;
};

window.renderTable = function() {
  const q = document.getElementById("search-inp")?.value.toLowerCase() || "";
  const filtered = dataAbsen.filter((r) => r.nama.toLowerCase().includes(q));
  const tbody = document.getElementById("tbl-body");
  tbody.innerHTML = filtered.length ? filtered.map((r, i) => `
    <tr>
      <td>${i + 1}</td><td>${r.tanggal}</td><td>${r.waktu}</td><td>${r.nama}</td>
      <td><span class="badge badge-${r.status}">${r.status.toUpperCase()}</span></td>
      <td><button class="btn-hapus" onclick="window.hapus('${r.id}')">Hapus</button></td>
    </tr>`).join("") : '<tr><td colspan="6" class="empty-state">Data kosong.</td></tr>';
};

window.hapus = async function(id) {
  if (!confirm("Hapus data ini?")) return;
  await deleteDoc(doc(db, "absensi_guru", id));
};

window.doLogin = function() {
  if (document.getElementById("inp-user").value === "admin" && document.getElementById("inp-pass").value === "admin123") {
    window.showPage("page-admin");
  } else {
    document.getElementById("login-err").style.display = "block";
  }
};

window.doLogout = function() {
  document.getElementById("inp-user").value = "";
  document.getElementById("inp-pass").value = "";
  window.showPage("page-form");
};

window.eksporExcel = function() {
  if (!dataAbsen.length) return alert("Tidak ada data.");
  const rows = [["No", "Tanggal", "Waktu", "Nama Guru", "Status"]];
  dataAbsen.forEach((r, i) => rows.push([i + 1, r.tanggal, r.waktu, r.nama, r.status]));
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Absensi");
  XLSX.writeFile(wb, "Data_Absensi_Guru.xlsx");
};

