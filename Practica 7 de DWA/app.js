// Práctica 07 — Variables y funciones
// Escenario: monitor de riego para un huerto urbano.
// Las reglas de cálculo son pedagógicas, no agronómicas.

const zonas = [
  { nombre: 'Semillero Norte', cultivo: 'Tomate', humedad: 34, temperatura: 29, areaM2: 8, activa: true },
  { nombre: 'Bancal Central', cultivo: 'Lechuga', humedad: 52, temperatura: 26, areaM2: 12, activa: true },
  { nombre: 'Sector Aromáticas', cultivo: 'Albahaca', humedad: 68, temperatura: 25, areaM2: 6, activa: true },
  { nombre: 'Parcela Sur', cultivo: 'Chile dulce', humedad: 41, temperatura: 30, areaM2: 10, activa: false }
];

const META_HUMEDAD = 60;

// EJERCICIO 1 — tipos de tres valores y mensaje resumen de zonas[0].
const zonaReferencia = zonas[0];
console.log('nombre →', typeof zonaReferencia.nombre);
console.log('humedad →', typeof zonaReferencia.humedad);
console.log('activa →', typeof zonaReferencia.activa);
console.log(`Zona ${zonaReferencia.nombre} · cultivo ${zonaReferencia.cultivo} · humedad ${zonaReferencia.humedad}%.`);

// EJERCICIO 2 — déficit de humedad respecto a la meta.
function calcularDeficit(humedad, meta = META_HUMEDAD) {
  return humedad < meta ? meta - humedad : 0;
}

// EJERCICIO 3 — estado textual según humedad.
const obtenerEstado = (humedad) => {
  if (humedad < 35) return 'Urgente';
  if (humedad < 55) return 'Vigilar';
  return 'Estable';
};

// EJERCICIO 3 — litros necesarios según área y déficit.
function estimarLitros(areaM2, deficit, factor = 0.12) {
  return Number((areaM2 * deficit * factor).toFixed(1));
}

// EJERCICIO 4 — tarjeta de una zona (pausada no calcula déficit).
function crearTarjetaZona(zona) {
  const pausada = !zona.activa;
  const deficit = pausada ? 0 : calcularDeficit(zona.humedad);
  const litros = pausada ? 0 : estimarLitros(zona.areaM2, deficit);
  const estadoTexto = pausada ? 'Zona pausada' : obtenerEstado(zona.humedad);
  const claseEstado = pausada ? 'pausada' : estadoTexto.toLowerCase();

  return `
    <article class="zona-card">
      <div class="zona-card__top">
        <div>
          <h3>${zona.nombre}</h3>
          <p class="zona-card__cultivo">${zona.cultivo}</p>
        </div>
        <span class="estado estado--${claseEstado}">${estadoTexto}</span>
      </div>
      <div class="zona-card__datos">
        <div class="dato"><span>Humedad</span><strong>${zona.humedad}%</strong></div>
        <div class="dato"><span>Temperatura</span><strong>${zona.temperatura}°C</strong></div>
        <div class="dato"><span>Riego estimado</span><strong>${litros.toFixed(1)} L</strong></div>
      </div>
    </article>`;
}

const panel = document.querySelector('#panel-zonas');

// EJERCICIO 5 — genera todas las tarjetas con map + join.
const html = zonas.map(crearTarjetaZona).join('');
panel.innerHTML = html;

// EJERCICIO 6 — promedio de una cantidad variable de valores.
function calcularPromedio(...valores) {
  if (valores.length === 0) return 0;
  let total = 0;
  for (const valor of valores) {
    total += valor;
  }
  return Number((total / valores.length).toFixed(1));
}

// EJERCICIO 6 — suma de una cantidad variable de litros.
function sumarRiego(...litros) {
  if (litros.length === 0) return 0;
  let total = 0;
  for (const valor of litros) {
    total += valor;
  }
  return Number(total.toFixed(1));
}

const resumen = document.querySelector('#resumen');

// EJERCICIO 6 — humedades, promedio y riego total reutilizando funciones.
const humedades = zonas.map((z) => z.humedad);
const promedio = calcularPromedio(...humedades);
const litrosActivos = zonas
  .filter((z) => z.activa)
  .map((z) => estimarLitros(z.areaM2, calcularDeficit(z.humedad)));
const totalRiego = sumarRiego(...litrosActivos);

resumen.innerHTML = `
  <div class="resumen__dato"><span>Humedad promedio</span><strong>${promedio}%</strong></div>
  <div class="resumen__dato"><span>Riego total estimado</span><strong>${totalRiego} L</strong></div>`;
