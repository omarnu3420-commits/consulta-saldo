// Función para formatear montos enteros → decimales
function formatearMonto(valorEntero) {
  return (valorEntero / 100).toFixed(2);
}

async function consultarSaldo() {
  const codigoInput = document.getElementById("codigo").value.trim().toUpperCase();
  if (!codigoInput) return;

  // Convertir formato: 1A → 01-A
  let codigo = codigoInput;
  if (/^\d+[A-D]$/.test(codigo)) {
    let num = codigo.slice(0, -1).padStart(2, "0");
    let letra = codigo.slice(-1);
    codigo = `${num}-${letra}`;
  } else if (/^PB[B-D]$/.test(codigo)) {
    codigo = `PB-${codigo.slice(-1)}`;
  }

  const response = await fetch("saldos231125.json");
  const data = await response.json();

  const registros = data.filter(r => r["No.Apt"] === codigo);
  const resultadoDiv = document.getElementById("resultado");

  if (registros.length === 0) {
    resultadoDiv.innerHTML = "<p>* Sin Deuda</p>";
    return;
  }

  const nombre = registros[0]["Nombre del Propietario"].trim();
  const saldoTotal = registros.reduce((sum, r) => sum + r["Saldo"], 0);

  let detalle = "<table><tr><th>No.Factura</th><th>Monto</th><th>Abonado</th><th>Pendiente</th></tr>";
  registros.forEach(r => {
    detalle += `<tr>
      <td>${r["No. Factura"]}</td>
      <td>${formatearMonto(r["Monto"])}</td>
      <td>${formatearMonto(r["Abonado"])}</td>
      <td>${formatearMonto(r["Saldo"])}</td>
    </tr>`;
  });
  detalle += "</table>";

  resultadoDiv.innerHTML = `
    <h3>Estado de Cuenta</h3>
    <p>No.Apt: ${codigo}</p>
    <p>Nombre: ${nombre}</p>
    <p>Saldo: $${formatearMonto(saldoTotal)}</p>
    ${detalle}
    <p>Agradecemos ponerse al día</p>
    <p>Bco:0134 C.I: 12.345.678 Tel.0424.111.22.33</p>
    <p>Enviar captura al grupo del condominio, Gracias</p>
  `;
}
