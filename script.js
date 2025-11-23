function formatearMontoEntero(valor) {
  const n = Number(valor) || 0;
  const dec = n / 100;
  return dec.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function consultarSaldo() {
  const codigoInput = document.getElementById("codigo").value.trim().toUpperCase();
  if (!codigoInput) return;

  let codigo = codigoInput;
  if (/^\d+[A-D]$/.test(codigo)) {
    let num = codigo.slice(0, -1).padStart(2, "0");
    let letra = codigo.slice(-1);
    codigo = `${num}-${letra}`;
  } else if (/^PB[A-D]$/.test(codigo)) {
    codigo = `PB-${codigo.slice(-1)}`;
  }

  const resultadoDiv = document.getElementById("resultado");
  resultadoDiv.innerHTML = "<p>Consultando...</p>";

  try {
    const response = await fetch("saldos231125.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`Error al cargar JSON: ${response.status}`);
    const data = await response.json();

    const registros = Array.isArray(data) ? data.filter(r => r["No.Apt"] === codigo) : [];
    if (registros.length === 0) {
      resultadoDiv.innerHTML = `<p>No.Apt: ${codigo}</p><p>* Sin Deuda</p>`;
      return;
    }

    const nombre = (registros[0]["Nombre del Propietario"] || "").trim();
    const saldoTotalEntero = registros.reduce((sum, r) => sum + (Number(r["Saldo"]) || 0), 0);

    let detalle = `
      <h3>Estado de Cuenta</h3>
      <p>No.Apt: ${codigo}</p>
      <p>Nombre: ${nombre}</p>
      <p><strong>Saldo: $${formatearMontoEntero(saldoTotalEntero)}</strong></p>
      <table>
        <tr><th>No.Factura</th><th>Monto</th><th>Abonado</th><th>Pendiente</th></tr>
    `;
    registros.forEach(r => {
      detalle += `
        <tr>
          <td>${r["No. Factura"]}</td>
          <td>${formatearMontoEntero(r["Monto"])}</td>
          <td>${formatearMontoEntero(r["Abonado"])}</td>
          <td>${formatearMontoEntero(r["Saldo"])}</td>
        </tr>
      `;
    });
    detalle += `</table>
      <p style="text-align:center; margin-top:10px;">Agradecemos ponerse al día</p>
      <p style="text-align:center;">Por favor hacer su pago PM así:</p>
      <p style="text-align:center;">Bco:0134 C.I: 12.345.678 Tel.0424.111.22.33</p>
      <p style="text-align:center;">Enviar captura al grupo del condominio, Gracias</p>
    `;

    resultadoDiv.innerHTML = detalle;
  } catch (err) {
    resultadoDiv.innerHTML = `
      <p style="color:#b00020;">No se pudo cargar la base de datos.</p>
      <p>Detalle: ${err.message}</p>
      <p>Verifica que el archivo <strong>saldos231125.json</strong> existe en la raíz del repositorio y es JSON válido.</p>
    `;
  }
}
