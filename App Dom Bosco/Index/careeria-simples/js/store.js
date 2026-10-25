/* Camada de dados: tudo fica salvo no navegador (localStorage). */
(function (g) {
  'use strict';

  var KEY = 'careeria:v1';

  function defaults() {
    return {
      profile: {
        nome: '', email: '', telefone: '', cidade: '', estado: '',
        objetivo: '', resumo: '', linkedin: '', github: '', portfolio: '',
        habilidades: [], idiomas: [], formacoes: [], experiencias: []
      },
      template: 'minimalista',
      analyses: [],
      letters: [],
      applications: [],
      plan: { objetivo: '', items: [] }
    };
  }

  function merge(base, saved) {
    var out = Object.assign({}, base, saved || {});
    out.profile = Object.assign({}, base.profile, (saved && saved.profile) || {});
    out.plan = Object.assign({}, base.plan, (saved && saved.plan) || {});
    ['analyses', 'letters', 'applications'].forEach(function (k) {
      if (!Array.isArray(out[k])) out[k] = [];
    });
    return out;
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return defaults();
      return merge(defaults(), JSON.parse(raw));
    } catch (e) {
      return defaults();
    }
  }

  var state = load();

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      console.error('Não foi possível salvar os dados', e);
      return false;
    }
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  g.Store = {
    get: function () { return state; },
    save: save,
    uid: uid
  };
})(window);
