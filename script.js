addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

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

// Ambil data otomatis dari Firebase setiap ada perubahan
onSnapshot(query(colRef, orderBy("timestamp", "desc")), (snapshot) => {
  dataAbsen = [];
  snapshot.forEach((doc) => {
    dataAbsen.push({ id: doc.id, ...doc.data() });
  });
  if (document.getElementById("tbl-body")) renderTable();
  if (document.getElementById("stats-row")) renderStats();
});

function showPage(id) {
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo(0, 0);
}

function pilihStatus(el, status) {
  document.querySelectorAll(".status-btn").forEach((b) => b.classList.remove("selected"));
  el.classList.add("selected");
  selectedStatus = status;
}

function getNow() {
  const now = new Date();
  return { 
    tanggal: now.toLocaleDateString('id-ID'), 
    waktu: now.getHours() + "." + now.getMinutes().toString().padStart(2, '0') 
  };
}

async function kirimAbsensi() {
  const nama = document.getElementById("select-nama").value;
  const errEl = document.getElementById("form-err");
  if (!nama || !selectedStatus) {
    errEl.style.display = "block";
    return;
  }
  errEl.style.display = "none";
  const { tanggal, waktu } = getNow();

  // Simpan ke Firebase
  await addDoc(colRef, { nama, tanggal, waktu, status: selectedStatus, timestamp: new Date() });

  document.getElementById("res-nama").textContent = nama;
  document.getElementById("res-tanggal").textContent = tanggal;
  document.getElementById("res-waktu").textContent = waktu;
  document.getElementById("res-status").textContent = selectedStatus.toUpperCase();
  showPage("page-berhasil");
}

function renderStats() {
  const c = { hadir: 0, sakit: 0, izin: 0, alpa: 0 };
  dataAbsen.forEach(r => { if (c[r.status] !== undefined) c[r.status]++; });
  document.getElementById("stats-row").innerHTML = 
    `<div class="stat-card"><div class="stat-num">${dataAbsen.length}</div><div class="stat-lbl">Total</div></div>` +
    `<div class="stat-card"><div class="stat-num">${c.hadir}</div><div class="stat-lbl">Hadir</div></div>` +
    `<div class="stat-card"><div class="stat-num">${c.sakit}</div><div class="stat-lbl">Sakit</div></div>` +
    `<div class="stat-card"><div class="stat-num">${c.izin}</div><div class="stat-lbl">Izin</div></div>` +
    `<div class="stat-card"><div class="stat-num">${c.alpa}</div><div class="stat-lbl">Alpa</div></div>`;
}

function renderTable() {
  const q = document.getElementById("search-inp")?.value.toLowerCase() || "";
  const filtered = dataAbsen.filter((r) => r.nama.toLowerCase().includes(q));
  const tbody = document.getElementById("tbl-body");
  tbody.innerHTML = filtered.length ? filtered.map((r, i) => `
    <tr>
      <td>${i + 1}</td><td>${r.tanggal}</td><td>${r.waktu}</td><td>${r.nama}</td>
      <td><span class="badge badge-${r.status}">${r.status.toUpperCase()}</span></td>
      <td><button class="btn-hapus" onclick="hapus('${r.id}')">Hapus</button></td>
    </tr>`).join("") : '<tr><td colspan="6" class="empty-state">Data kosong.</td></tr>';
}

async function hapus(id) {
  if (!confirm("Hapus data ini?")) return;
  await deleteDoc(doc(db, "absensi_guru", id));
}

function doLogin() {
  if (document.getElementById("inp-user").value === "admin" && document.getElementById("inp-pass").value === "admin123") {
    showPage("page-admin");
  } else {
    document.getElementById("login-err").style.display = "block";
  }
}
// Tambahkan fungsi logout, eksporExcel, dll di sini sesuai kebutuhan...
