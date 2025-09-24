let bonds = [];

// ========== Excel Upload ==========
document.getElementById("processBtn").addEventListener("click", () => {
  const fileInput = document.getElementById("fileInput");
  if (!fileInput.files.length) {
    alert("Please upload an Excel file first.");
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function(e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    bonds = rows.slice(1).map(row => ({
      name: row[0],
      coupon: parseFloat(row[1]),
      yield: parseFloat(row[2]),
      face: parseFloat(row[3]),
      years: parseInt(row[4])
    }));

    alert("Excel bonds loaded! Click 'Calculate Durations' to see results.");
  };

  reader.readAsArrayBuffer(file);
});

// ========== Manual Entry ==========
document.getElementById("bondForm").addEventListener("submit", e => {
  e.preventDefault();

  const bond = {
    name: document.getElementById("name").value,
    coupon: parseFloat(document.getElementById("coupon").value),
    yield: parseFloat(document.getElementById("yield").value),
    face: parseFloat(document.getElementById("face").value),
    years: parseInt(document.getElementById("years").value)
  };

  bonds.push(bond);
  updateManualTable();

  // Reset form
  e.target.reset();
});

function updateManualTable() {
  const tbody = document.querySelector("#manualTable tbody");
  tbody.innerHTML = "";
  bonds.forEach(bond => {
    tbody.innerHTML += `
      <tr>
        <td>${bond.name}</td>
        <td>${bond.coupon}</td>
        <td>${bond.yield}</td>
        <td>${bond.face}</td>
        <td>${bond.years}</td>
      </tr>
    `;
  });
}

// ========== Calculation ==========
document.getElementById("calculateBtn").addEventListener("click", () => {
  if (bonds.length === 0) {
    alert("No bonds to calculate. Upload Excel or add manually.");
    return;
  }

  const results = bonds.map(calcDurations);
  displayResults(results);
});

function calcDurations(bond) {
  const c = (bond.coupon / 100) * bond.face;
  const y = bond.yield / 100;
  const F = bond.face;
  const n = bond.years;

  let D = 0;
  let PV_total = 0;

  for (let t = 1; t <= n; t++) {
    const CF = (t === n) ? c + F : c;
    const PV = CF / Math.pow(1 + y, t);
    PV_total += PV;
    D += t * PV;
  }

  D = D / PV_total;
  const MD = D / (1 + y);

  return {
    name: bond.name,
    macaulay: D.toFixed(4),
    modified: MD.toFixed(4)
  };
}

function displayResults(results) {
  const container = document.getElementById("results");
  let html = `
    <h2>Results</h2>
    <table>
      <thead>
        <tr>
          <th>Bond Name</th>
          <th>Macaulay Duration</th>
          <th>Modified Duration</th>
        </tr>
      </thead>
      <tbody>
        ${results.map(r => `
          <tr>
            <td>${r.name}</td>
            <td>${r.macaulay}</td>
            <td>${r.modified}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
  container.innerHTML = html;
}
