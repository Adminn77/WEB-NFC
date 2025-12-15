const scanModal = document.getElementById("scanModal");
const writeModal = document.getElementById("writeModal");

document.getElementById("btnMulai").onclick = () =>
  scanModal.classList.remove("hidden");

document.getElementById("openWrite").onclick = () =>
  writeModal.classList.remove("hidden");

document.querySelectorAll(".close").forEach(btn =>
  btn.onclick = () => {
    scanModal.classList.add("hidden");
    writeModal.classList.add("hidden");
  }
);

// ===== SCAN =====
document.getElementById("scanBtn").onclick = async () => {
  try {
    const ndef = new NDEFReader();
    await ndef.scan();

    ndef.onreading = (e) => {
      document.getElementById("uid").textContent = e.serialNumber || "-";

      const warningBox = document.getElementById("nfcWarning");
      const explainBox = document.getElementById("nfcExplain");

      warningBox.classList.add("hidden");
      explainBox.classList.add("hidden");

      let data = "";
      const decoder = new TextDecoder();

      try {
        for (const r of e.message.records) {
          if (!r.data) continue;
          data += decoder.decode(r.data) + "\n";
        }

        if (!data.trim()) {
          document.getElementById("readData").textContent =
            "Data tidak dapat dibaca atau terenkripsi.";
          warningBox.classList.remove("hidden");
          explainBox.classList.remove("hidden");
          window.secureCardDetected = true;
          return;
        }

        document.getElementById("readData").textContent = data;
        window.secureCardDetected = false;

      } catch {
        document.getElementById("readData").textContent =
          "Format kartu tidak didukung.";
        warningBox.classList.remove("hidden");
        explainBox.classList.remove("hidden");
        window.secureCardDetected = true;
      }
    };
  } catch {
    alert("NFC tidak didukung");
  }
};

// ===== WRITE =====
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
