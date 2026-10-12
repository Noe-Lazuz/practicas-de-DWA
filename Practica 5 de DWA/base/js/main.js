// ASTROBITÁCORA - VERSIÓN BASE
// Script cargado SIN defer: bloquea el parseo del HTML mientras descarga y ejecuta.
// Estudiante: Noé Benjamín Garmendia Lazo (U20241208)

document.addEventListener('DOMContentLoaded', () => {

    // Menú hamburguesa móvil
    const toggle = document.querySelector('.header__toggle');
    const menu = document.querySelector('.header__menu');

    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            const expanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', String(!expanded));
            menu.classList.toggle('header__menu--open');
        });
    }

    // Cerrar menú al hacer clic en un enlace
    const menuLinks = document.querySelectorAll('.header__menu a');
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.remove('header__menu--open');
            toggle.setAttribute('aria-expanded', 'false');
        });
    });

});