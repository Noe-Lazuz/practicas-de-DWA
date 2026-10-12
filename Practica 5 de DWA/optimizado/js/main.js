// ASTROBITÁCORA - VERSIÓN OPTIMIZADA
// Se carga con defer (no bloquea el parseo del HTML) y la lógica
// se ejecuta tras DOMContentLoaded. main.js ≈ repetir solo lo necesario.
// Estudiante: Noé Benjamín Garmendia Lazo (U20241208)

document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('.header__toggle');
    const menu = document.querySelector('.header__menu');

    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            const expanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', String(!expanded));
            menu.classList.toggle('header__menu--open');
        });
    }

    const menuLinks = document.querySelectorAll('.header__menu a');
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.remove('header__menu--open');
            toggle.setAttribute('aria-expanded', 'false');
        });
    });
});