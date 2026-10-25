/* Aplica o tema (claro/escuro) salvo no navegador nas páginas legais */
try { const t = localStorage.getItem("db-theme"); if (t) document.documentElement.dataset.theme = t; } catch (e) {}