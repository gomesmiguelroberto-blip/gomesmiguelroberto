/* Funções de apoio da interface. */
(function (g) {
  'use strict';

  // Evita XSS: todo texto digitado pelo usuário passa por aqui antes de ir para o HTML.
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function nl2br(value) {
    return esc(value).replace(/\n/g, '<br>');
  }

  function toast(message, type) {
    var box = document.getElementById('toasts');
    if (!box) return;
    var el = document.createElement('div');
    el.className = 'toast' + (type === 'error' ? ' toast--error' : '');
    el.textContent = message;
    if (type === 'error') el.setAttribute('role', 'alert');
    box.appendChild(el);
    setTimeout(function () { el.remove(); }, 3800);
  }

  function formatDate(value) {
    if (!value) return '';
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (m) return m[3] + '/' + m[2] + '/' + m[1];
    var d = new Date(value);
    return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString('pt-BR');
  }

  function copyText(text) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      ta.remove();
      toast(ok ? 'Texto copiado!' : 'Não foi possível copiar. Selecione o texto e use Ctrl + C.', ok ? 'success' : 'error');
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast('Texto copiado!'); }, fallback);
    } else {
      fallback();
    }
  }

  g.UI = { esc: esc, nl2br: nl2br, toast: toast, formatDate: formatDate, copyText: copyText };
})(window);
