/* Navegação (rotas por #), estrutura do app e tema claro/escuro. */
(function (g) {
  'use strict';

  var NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'perfil', label: 'Meu perfil', icon: '👤' },
    { id: 'curriculo', label: 'Currículo', icon: '📄' },
    { id: 'vagas', label: 'Analisar vaga', icon: '🔎' },
    { id: 'carta', label: 'Carta', icon: '✉️' },
    { id: 'candidaturas', label: 'Candidaturas', icon: '📌' },
    { id: 'plano', label: 'Meu plano', icon: '🧭' }
  ];

  function route() {
    return location.hash.replace(/^#\/?/, '').split('?')[0];
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('careeria:theme', theme); } catch (e) { /* ignorado */ }
  }
  function toggleTheme() {
    setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  }

  function shell(id, page) {
    return '<div class="shell">' +
      '<aside class="sidebar" id="sidebar" aria-label="Navegação principal">' +
      '<a class="brand" href="#/"><span class="brand__mark" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16l6-6 4 4 6-8"/></svg></span>CareerIA</a>' +
      '<nav class="nav" aria-label="Seções">' + NAV.map(function (n) {
        return '<a href="#/' + n.id + '"' + (n.id === id ? ' aria-current="page"' : '') + '><span aria-hidden="true">' + n.icon + '</span>' + n.label + '</a>';
      }).join('') + '</nav>' +
      '<div class="sidebar__foot"><button type="button" class="btn btn--ghost btn--sm" data-action="theme">Alternar tema</button>' +
      '<a class="btn btn--ghost btn--sm" href="#/">Página inicial</a></div></aside>' +
      '<div class="shell__main"><header class="topbar"><button type="button" class="btn btn--ghost btn--sm" data-action="menu" aria-controls="sidebar" aria-label="Abrir menu">☰ Menu</button>' +
      '<strong>' + page.title + '</strong><button type="button" class="btn btn--ghost btn--sm" data-action="theme" aria-label="Alternar tema">Tema</button></header>' +
      '<main id="main" class="content" tabindex="-1">' + page.render() + '</main></div></div>';
  }

  var lastRoute = null;

  function render() {
    var id = route();
    var root = document.getElementById('app');
    document.body.classList.remove('menu-open');

    if (id === '' || !g.Pages[id]) {
      if (id !== '') { location.replace('#/'); return; }
      root.innerHTML = g.Pages.landing.render();
      g.Pages.landing.mount(root);
      document.title = g.Pages.landing.title;
    } else {
      var page = g.Pages[id];
      root.innerHTML = shell(id, page);
      page.mount(root);
      document.title = page.title + ' | CareerIA';
    }
    if (lastRoute !== id) {
      window.scrollTo(0, 0);
      var main = document.getElementById('main');
      if (main && lastRoute !== null) main.focus({ preventScroll: true });
    }
    lastRoute = id;
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-action="theme"], [data-action="menu"]');
    if (!b) return;
    if (b.dataset.action === 'theme') toggleTheme();
    else document.body.classList.toggle('menu-open');
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') document.body.classList.remove('menu-open');
  });
  window.addEventListener('hashchange', render);
  window.addEventListener('offline', function () {
    g.UI.toast('Você está offline. Seus dados continuam salvos neste navegador.');
  });

  g.App = { render: render };
  render();
})(window);
