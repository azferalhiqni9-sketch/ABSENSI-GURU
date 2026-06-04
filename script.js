const LS_KEY = "absensi_guru_baitul_muttaqin";

function loadData() {
  try {
    const r = localStorage.getItem(LS_KEY);
    return r ? JSON.parse(r) : [];
  } catch (e) {
    return [];
  }
}
function saveData(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

// Seed data awal
(function seedIfEmpty() {
  if (!localStorage.getItem(LS_KEY)) {
    saveData([
      {
        id: 1,
        nama: "Ahmad Fauzi, S.Pd",
        tanggal: "26-05-2026",
        waktu: "07.15",
        status: "hadir",
      },
      {
        id: 2,
        nama: "Siti Rahmawati, S.Ag",
        tanggal: "26-05-2026",
        waktu: "07.22",
        status: "hadir",
      },
      {
        id: 3,
        nama: "Budi Santoso, M.Pd",
        tanggal: "26-05-2026",
        waktu: "07.30",
        status: "sakit",
      },
      {
        id: 4,
        nama: "Dewi Lestari, S.Pd",
        tanggal: "25-05-2026",
        waktu: "07.10",
        status: "hadir",
      },
      {
        id: 5,
        nama: "Hendra Kurniawan, S.Pd",
        tanggal: "25-05-2026",
        waktu: "07.45",
        status: "izin",
      },
      {
        id: 6,
        nama: "Nurul Hidayah, S.Ag",
        tanggal: "24-05-2026",
        waktu: "07.05",
        status: "hadir",
      },
      {
        id: 7,
        nama: "Rizky Pratama, S.Pd",
        tanggal: "24-05-2026",
        waktu: "07.50",
        status: "alpa",
      },
    ]);
  }
})();

function getNextId() {
  const data = loadData();
  return data.length ? Math.max(...data.map((r) => r.id)) + 1 : 1;
}

let selectedStatus = "";

function showPage(id) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo(0, 0);
}

function pilihStatus(el, status) {
  document
    .querySelectorAll(".status-btn")
    .forEach((b) => b.classList.remove("selected"));
  el.classList.add("selected");
  selectedStatus = status;
}

function getNow() {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  return { tanggal: dd + "-" + mm + "-" + yyyy, waktu: hh + "." + min };
}

function kirimAbsensi() {
  const nama = document.getElementById("select-nama").value;
  const errEl = document.getElementById("form-err");
  if (!nama || !selectedStatus) {
    errEl.style.display = "block";
    return;
  }
  errEl.style.display = "none";

  const { tanggal, waktu } = getNow();
  const rec = {
    id: getNextId(),
    nama,
    tanggal,
    waktu,
    status: selectedStatus,
  };
  const data = loadData();
  data.unshift(rec);
  saveData(data);

  document.getElementById("res-nama").textContent = nama;
  document.getElementById("res-tanggal").textContent = tanggal;
  document.getElementById("res-waktu").textContent = waktu;
  document.getElementById("res-status").textContent =
    selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1);

  document.getElementById("select-nama").value = "";
  document
    .querySelectorAll(".status-btn")
    .forEach((b) => b.classList.remove("selected"));
  selectedStatus = "";
  showPage("page-berhasil");
}

function doLogin() {
  const u = document.getElementById("inp-user").value.trim();
  const p = document.getElementById("inp-pass").value.trim();
  const errEl = document.getElementById("login-err");
  if (u === "admin" && p === "admin123") {
    errEl.style.display = "none";
    renderStats();
    renderTable();
    showPage("page-admin");
  } else {
    errEl.style.display = "block";
  }
}

function doLogout() {
  document.getElementById("inp-user").value = "";
  document.getElementById("inp-pass").value = "";
  showPage("page-form");
}

function renderStats() {
  const data = loadData();
  const c = { hadir: 0, sakit: 0, izin: 0, alpa: 0 };
  data.forEach((r) => {
    if (c[r.status] !== undefined) c[r.status]++;
  });
  document.getElementById("stats-row").innerHTML =
    `<div class="stat-card"><div class="stat-num" style="color:#222">${data.length}</div><div class="stat-lbl">Total</div></div>` +
    `<div class="stat-card"><div class="stat-num" style="color:#145c30">${c.hadir}</div><div class="stat-lbl">Hadir</div></div>` +
    `<div class="stat-card"><div class="stat-num" style="color:#7a4e00">${c.sakit}</div><div class="stat-lbl">Sakit</div></div>` +
    `<div class="stat-card"><div class="stat-num" style="color:#0c447c">${c.izin}</div><div class="stat-lbl">Izin</div></div>` +
    `<div class="stat-card"><div class="stat-num" style="color:#791f1f">${c.alpa}</div><div class="stat-lbl">Alpa</div></div>`;
}

function renderTable() {
  const data = loadData();
  const q = document.getElementById("search-inp").value.toLowerCase();
  const filtered = data.filter((r) => r.nama.toLowerCase().includes(q));
  const tbody = document.getElementById("tbl-body");
  if (!filtered.length) {
    tbody.innerHTML =
      '<tr><td colspan="6" class="empty-state">Tidak ada data ditemukan.</td></tr>';
    return;
  }
  tbody.innerHTML = filtered
    .map(
      (r, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${r.tanggal}</td>
        <td>${r.waktu}</td>
        <td>${r.nama}</td>
        <td><span class="badge badge-${r.status}">${r.status.charAt(0).toUpperCase() + r.status.slice(1)}</span></td>
        <td><button class="btn-hapus" onclick="hapus(${r.id})">Hapus</button></td>
      </tr>`,
    )
    .join("");
}

function hapus(id) {
  if (!confirm("Yakin ingin menghapus data ini?")) return;
  saveData(loadData().filter((r) => r.id !== id));
  renderStats();
  renderTable();
}

function hapusSemua() {
  if (
    !confirm(
      "Yakin ingin menghapus SEMUA data absensi? Tindakan ini tidak bisa dibatalkan.",
    )
  )
    return;
  saveData([]);
  renderStats();
  renderTable();
}

function eksporExcel() {
  const data = loadData();
  if (!data.length) {
    alert("Tidak ada data untuk diekspor.");
    return;
  }
  if (typeof XLSX === "undefined") {
    alert("Library Excel belum siap, coba lagi sebentar.");
    return;
  }

  const rows = [["No", "Tanggal", "Waktu", "Nama Guru", "Status"]];
  data.forEach((r, i) =>
    rows.push([
      i + 1,
      r.tanggal,
      r.waktu,
      r.nama,
      r.status.charAt(0).toUpperCase() + r.status.slice(1),
    ]),
  );

  const c = { hadir: 0, sakit: 0, izin: 0, alpa: 0 };
  data.forEach((r) => {
    if (c[r.status] !== undefined) c[r.status]++;
  });
  rows.push(
    [],
    ["REKAP", "", "", "", ""],
    ["Total", data.length, "", "", ""],
    ["Hadir", c.hadir, "", "", ""],
    ["Sakit", c.sakit, "", "", ""],
    ["Izin", c.izin, "", "", ""],
    ["Alpa", c.alpa, "", "", ""],
  );

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [{ wch: 5 }, { wch: 14 }, { wch: 8 }, { wch: 28 }, { wch: 10 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Absensi Guru");
  const now = new Date();
  const tgl = `${String(now.getDate()).padStart(2, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()}`;
  XLSX.writeFile(wb, `Absensi_Guru_BaitulMuttaqin_${tgl}.xlsx`);
}
