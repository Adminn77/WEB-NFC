/* =====================================================
   ELEMENT
===================================================== */
const scanModal = document.getElementById("scanModal");
const writeModal = document.getElementById("writeModal");

const warningBox = document.getElementById("nfcWarning");
const explainBox = document.getElementById("nfcExplain");

const uidBox = document.getElementById("uid");
const readDataBox = document.getElementById("readData");
const accessStatusBox = document.getElementById("accessStatus");

const writeData = document.getElementById("writeData");
const writeStatus = document.getElementById("writeStatus");

/* =====================================================
   DATA AKSES (DEMO)
===================================================== */
const allowedUIDs = [
  "04A1B2C3D4",
  "1234567890",
  "ABCDEF1234"
];

let secureCardDetected = false;

/* =====================================================
   RESET UI
===================================================== */
function resetScanUI() {
  uidBox.textContent = "-";
  readDataBox.textContent = "Belum ada data";

  accessStatusBox.textContent = "Menunggu verifikasi...";
  accessStatusBox.style.background = "#e0f2fe";
  accessStatusBox.style.color = "#0f172a";

  warningBox.classList.add("hidden");
  explainBox.classList.add("hidden");

  secureCardDetected = false;
}

/* =====================================================
   OPEN SCAN MODAL
===================================================== */
document.getElementById("btnMulai")?.addEventListener("click", () => {
  scanModal.classList.remove("hidden");
  resetScanUI();
});

document.getElementById("btnMulaiMobile")?.addEventListener("click", () => {
  scanModal.classList.remove("hidden");
  resetScanUI();
});

/* =====================================================
   OPEN WRITE MODAL (DESKTOP & MOBILE)
===================================================== */
function openWriteModal() {
  writeModal.classList.remove("hidden");
  writeStatus.textContent = "";
  writeData.value = "";
}

document.getElementById("openWrite")?.addEventListener("click", e => {
  e.preventDefault();
  openWriteModal();
});

document.getElementById("openWriteMobile")?.addEventListener("click", e => {
  e.preventDefault();
  openWriteModal();
});

/* =====================================================
   CLOSE MODAL
===================================================== */
document.querySelectorAll(".close").forEach(btn => {
  btn.addEventListener("click", () => {
    scanModal.classList.add("hidden");
    writeModal.classList.add("hidden");
  });
});

/* =====================================================
   SCAN NFC
===================================================== */
document.getElementById("scanBtn")?.addEventListener("click", async () => {
  resetScanUI();

  if (!("NDEFReader" in window)) {
    alert("❌ Web NFC tidak didukung.\nGunakan Chrome Android & HTTPS.");
    return;
  }

  try {
    const ndef = new NDEFReader();
    await ndef.scan();

    ndef.onreading = event => {
      const uid = event.serialNumber || "Tidak tersedia";
      uidBox.textContent = uid;

      let data = "";
      const decoder = new TextDecoder();

      try {
        for (const record of event.message.records) {
          if (record.data) {
            data += decoder.decode(record.data) + "\n";
          }
        }

        if (!data.trim()) {
          readDataBox.textContent =
            "Data tidak dapat dibaca atau terenkripsi.";
          warningBox.classList.remove("hidden");
          explainBox.classList.remove("hidden");
          secureCardDetected = true;
        } else {
          readDataBox.textContent = data;
          secureCardDetected = false;
        }
      } catch {
        readDataBox.textContent = "Format kartu tidak didukung.";
        warningBox.classList.remove("hidden");
        explainBox.classList.remove("hidden");
        secureCardDetected = true;
      }

      if (allowedUIDs.includes(uid)) {
        accessStatusBox.textContent = "✅ AKSES DITERIMA";
        accessStatusBox.style.background = "#dcfce7";
        accessStatusBox.style.color = "#166534";
      } else {
        accessStatusBox.textContent = "❌ AKSES DITOLAK";
        accessStatusBox.style.background = "#fee2e2";
        accessStatusBox.style.color = "#7f1d1d";
      }
    };
  } catch {
    alert("❌ Gagal memulai scan NFC.");
  }
});

/* =====================================================
   WRITE NFC (TEXT ONLY)
===================================================== */
document.getElementById("prepareWrite")?.addEventListener("click", async () => {

  if (secureCardDetected) {
    alert(
      "❌ Tidak dapat menulis ke kartu ini.\n\n" +
      "Kartu aman terdeteksi (ATM / e-KTP)."
    );
    return;
  }

  if (!("NDEFReader" in window)) {
    alert("❌ Web NFC tidak didukung.");
    return;
  }

  const text = writeData.value.trim();
  if (!text) {
    alert("⚠️ Isi data terlebih dahulu.");
    return;
  }

  try {
    const ndef = new NDEFReader();
    writeStatus.textContent = "📡 Tempelkan kartu NFC...";

    await ndef.write(text);

    writeStatus.textContent = "✅ Data berhasil ditulis ke kartu NFC";
  } catch {
    writeStatus.textContent = "❌ Gagal menulis NFC";
  }
});
