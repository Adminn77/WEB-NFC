const scanModal = document.getElementById("scanModal");
const writeModal = document.getElementById("writeModal");

const warningBox = document.getElementById("nfcWarning");
const explainBox = document.getElementById("nfcExplain");
const uidBox = document.getElementById("uid");
const readDataBox = document.getElementById("readData");

/* ===== RESET UI (TIDAK UBAH LOGIKA NFC) ===== */
function resetScanUI() {
  uidBox.textContent = "-";
  readDataBox.textContent = "Belum ada data";
  warningBox.classList.add("hidden");
  explainBox.classList.add("hidden");
  window.secureCardDetected = false;
}

/* ===== OPEN MODAL SCAN (DESKTOP) ===== */
document.getElementById("btnMulai").onclick = () => {
  scanModal.classList.remove("hidden");
  resetScanUI();
};

/* ===== OPEN MODAL SCAN (MOBILE) ===== */
document.getElementById("btnMulaiMobile").onclick = () => {
  scanModal.classList.remove("hidden");
  resetScanUI();
};

/* ===== OPEN WRITE MODAL ===== */
document.getElementById("openWrite").onclick = (e) => {
  e.preventDefault(); // PENTING
  writeModal.classList.remove("hidden");
};

/* ===== CLOSE MODAL ===== */
document.querySelectorAll(".close").forEach(btn =>
  btn.onclick = () => {
    scanModal.classList.add("hidden");
    writeModal.classList.add("hidden");
  }
);

/* ===== SCAN NFC ===== */
document.getElementById("scanBtn").onclick = async () => {
  resetScanUI();

  try {
    const ndef = new NDEFReader();
    await ndef.scan();

    ndef.onreading = (e) => {
      uidBox.textContent = e.serialNumber || "-";

      let data = "";
      const decoder = new TextDecoder();

      try {
        for (const r of e.message.records) {
          if (!r.data) continue;
          data += decoder.decode(r.data) + "\n";
        }

        if (!data.trim()) {
          readDataBox.textContent =
            "Data tidak dapat dibaca atau terenkripsi.";
          warningBox.classList.remove("hidden");
          explainBox.classList.remove("hidden");
          window.secureCardDetected = true;
          return;
        }

        readDataBox.textContent = data;
        window.secureCardDetected = false;

      } catch {
        readDataBox.textContent =
          "Format kartu tidak didukung.";
        warningBox.classList.remove("hidden");
        explainBox.classList.remove("hidden");
        window.secureCardDetected = true;
      }
    };
  } catch {
    alert("NFC tidak didukung di perangkat ini");
  }
};

/* ===== WRITE NFC ===== */
document.getElementById("prepareWrite").onclick = async () => {
  if (window.secureCardDetected) {
    alert(
      "❌ Tidak dapat menulis ke kartu ini.\n\n" +
      "Kartu terdeteksi sebagai kartu aman (ATM / e-KTP).\n" +
      "Penulisan diblokir demi keamanan."
    );
    return;
  }

  const text = writeData.value.trim();
  if (!text) return alert("Isi data dulu");

  try {
    const ndef = new NDEFReader();
    document.getElementById("writeStatus").textContent =
      "Tempelkan kartu NFC...";
    await ndef.write({
      records: [{ recordType: writeType.value, data: text }]
    });

    document.getElementById("writeStatus").textContent =
      "✅ Data berhasil ditulis";
  } catch {
    alert("Gagal menulis NFC");
  }
};
