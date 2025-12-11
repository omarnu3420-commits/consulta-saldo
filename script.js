function formatearMontoEntero(valor) {
  const n = Number(valor) || 0;
  const dec = n / 100;
  return dec.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function generarSufijoVersion() {
  const ahora = new Date();
  const dia = String(ahora.getDate()).padStart(2, "0");
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const hora = String(ahora.getHours()).padStart(2, "0");
  const minutos = String(ahora.getMinutes()).padStart(2, "0");
  return `${dia}${mes}${hora}${minutos}`;
}

async function mostrarFechaActualizacion() {
  try {
    const sufijo = generarSufijoVersion();
    const response = await fetch(`saldoscaruao.json?v=${sufijo}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`Error al cargar JSON: ${response.status}`);
    const data = await response.json();
    const registroFecha = Array.isArray(data) ? data.find(r => r["No.APT"] === "00-0") : null;
    if (registroFecha) {
      let fechaRaw = registroFecha["No.FACTURA"]?.toString() ?? "";
      if (/^\d{6}$/.test(fechaRaw)) {
        const dd = fechaRaw.slice(0, 2);
        const mm = fechaRaw.slice(2, 4);
        const aa = fechaRaw.slice(4, 6);
        fechaRaw = `${dd}-${mm}-${aa}`;
      }
      const fechaParrafo = document.getElementById("fecha");
      if (fechaParrafo) {
        fechaParrafo.textContent = `Consulta de Saldo al: ${fechaRaw}`;
      }
    }
  } catch (err) {
    console.error("No se pudo cargar la fecha de actualización:", err);
  }
}

async function consultarSaldo() {
  const codigoInput = document.getElementById("codigo").value.trim().toUpperCase();
  if (!codigoInput) return;

  let codigo = codigoInput;
  if (/^\d+[A-D]$/.test(codigo)) {
    const num = codigo.slice(0, -1).padStart(2, "0");
    const letra = codigo.slice(-1);
    codigo = `${num}-${letra}`;
  } else if (/^PB[A-D]$/.test(codigo)) {
    codigo = `PB-${codigo.slice(-1)}`;
  }

  const resultadoDiv = document.getElementById("resultado");
  resultadoDiv.innerHTML = "<p>Consultando...</p>";
  resultadoDiv.className = "card";

  try {
    const sufijo = generarSufijoVersion();
    const response = await fetch(`saldoscaruao.json?v=${sufijo}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`Error al cargar JSON: ${response.status}`);
    const data = await response.json();

    const registros = Array.isArray(data) ? data.filter(r => r["No.APT"] === codigo) : [];
    if (registros.length === 0) {
      resultadoDiv.innerHTML = `<p>No.Apt: ${codigo}</p><p>* Sin Deuda</p>`;
      resultadoDiv.className = "card neutro";
      return;
    }

    const nombre = (registros[0]["NOMBRE PROPIETARIO"] || "").trim();
    const saldoTotalEntero = registros.reduce((sum, r) => sum + (Number(r["SALDO"]) || 0), 0);
    const claseSaldo = saldoTotalEntero > 0 ? "negativo" :
                       saldoTotalEntero < 0 ? "positivo" : "neutro";
    resultadoDiv.className = `card ${claseSaldo}`;

    let detalle = `
      <h3>Estado de Cuenta</h3>
      <p>No.APT: ${codigo}</p>
      <p>NOMBRE: ${nombre}</p>
      <p class="saldo"><strong>Saldo: $${formatearMontoEntero(saldoTotalEntero)}</strong></p>
      <table>
        <tr><th>No.FACTURA</th><th>MONTO</th><th>ABONADO</th><th>Pendiente</th></tr>
    `;
    registros.forEach(r => {
      detalle += `
        <tr>
          <td>${r["No.FACTURA"]}</td>
          <td>${formatearMontoEntero(r["MONTO"])}</td>
          <td>${formatearMontoEntero(r["ABONADO"])}</td



