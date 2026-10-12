// Práctica 06 — JavaScript, DOM y eventos

console.log("app.js cargado correctamente");

// 1. Referencias a los elementos que se van a manipular.
const estado = document.getElementById("estado-js");
const botones = document.querySelectorAll(".btn-detalle");

// 2. Confirma desde la interfaz que el script está activo.
estado.textContent = "JavaScript activo";

// 3. Recorre cada botón y le asigna el manejo del clic.
botones.forEach((boton) => {
  boton.addEventListener("click", () => {
    // 4. Lee el id del panel objetivo desde el atributo data-target.
    const panelId = boton.getAttribute("data-target");
    const panel = document.getElementById(panelId);

    // 5. Verifica que el panel exista antes de manipularlo.
    if (!panel) {
      console.warn(`No existe ningún panel con id "${panelId}".`);
      return;
    }

    // 6. Alterna la clase que controla la visibilidad desde el CSS.
    panel.classList.toggle("oculto");

    // 7. Sincroniza el texto del botón y la accesibilidad con el estado.
    const oculto = panel.classList.contains("oculto");
    boton.textContent = oculto ? "Ver detalles" : "Ocultar";
    boton.setAttribute("aria-expanded", String(!oculto));
  });
});
