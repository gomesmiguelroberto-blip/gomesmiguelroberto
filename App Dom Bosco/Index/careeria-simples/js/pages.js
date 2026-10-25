/* Telas do aplicativo. Cada tela tem: title, render() -> HTML e mount(root) -> eventos. */
(function (g) {
  'use strict';

  var esc = g.UI.esc, nl2br = g.UI.nl2br, toast = g.UI.toast;
  var formatDate = g.UI.formatDate, copyText = g.UI.copyText;
  var A = g.Analyzer, S = g.Store;
  var st = function () { return S.get(); };
  var rerender = function () { g.App.render(); };

  var STATUS = [
    { id: 'interessado', label: 'Interessado' },
    { id: 'candidatado', label: 'Candidatado' },
    { id: 'em-analise', label: 'Em análise' },
    { id: 'entrevista', label: 'Entrevista' },
    { id: 'aprovado', label: 'Aprovado' },
    { id: 'recusado', label: 'Recusado' }
  ];
  var ESTADOS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

  /* ---------- helpers de HTML ---------- */
  function field(name, label, value, o) {
    o = o || {};
    return '<div class="field' + (o.full ? ' field--full' : '') + '"><label for="f-' + name + '">' + label + '</label>' +
      '<input id="f-' + name + '" name="' + name + '" type="' + (o.type || 'text') + '" value="' + esc(value) + '"' +
      (o.ph ? ' placeholder="' + esc(o.ph) + '"' : '') + (o.auto ? ' autocomplete="' + o.auto + '"' : '') +
      (o.required ? ' required' : '') + '></div>';
  }
  function area(name, label, value, o) {
    o = o || {};
    return '<div class="field field--full"><label for="f-' + name + '">' + label + '</label>' +
      '<textarea id="f-' + name + '" name="' + name + '" rows="' + (o.rows || 4) + '"' +
      (o.ph ? ' placeholder="' + esc(o.ph) + '"' : '') + '>' + esc(value) + '</textarea>' +
      (o.hint ? '<small class="hint">' + o.hint + '</small>' : '') + '</div>';
  }
  function emptyState(message, label, href) {
    return '<div class="card empty"><p>' + message + '</p><a class="btn" href="' + href + '">' + label + '</a></div>';
  }
  function head(title, text) {
    return '<header class="page-head"><h1>' + title + '</h1>' + (text ? '<p>' + text + '</p>' : '') + '</header>';
  }
  function chips(list, kind) {
    if (!list || !list.length) return '<p class="hint">Nenhum item.</p>';
    return '<ul class="chips chips--' + kind + '">' + list.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</ul>';
  }
  function splitList(text) {
    var seen = {}, out = [];
    String(text || '').split(/[,;\n]/).forEach(function (t) {
      t = t.trim();
      if (t && !seen[t.toLowerCase()]) { seen[t.toLowerCase()] = 1; out.push(t); }
    });
    return out;
  }
  function safeUrl(u) { return /^https?:\/\//i.test(String(u || '').trim()) ? String(u).trim() : ''; }
  function printNow() { window.print(); }

  /* ---------- perfil: cálculo e coleta ---------- */
  function profileCompletion(p) {
    var checks = [
      p.nome, p.email, p.telefone, p.cidade, p.estado, p.objetivo, p.resumo,
      p.habilidades.length, p.idiomas.length,
      p.formacoes.some(function (f) { return f.curso; }),
      p.experiencias.some(function (e) { return e.cargo || e.empresa; }),
      p.linkedin || p.github || p.portfolio
    ];
    return Math.round(checks.filter(Boolean).length / checks.length * 100);
  }

  function rf(key, label, value, ph) {
    return '<label class="field"><span>' + label + '</span><input data-f="' + key + '" value="' + esc(value) + '"' +
      (ph ? ' placeholder="' + esc(ph) + '"' : '') + '></label>';
  }
  function eduRow(f, i) {
    return '<fieldset class="repeat"><legend>Formação ' + (i + 1) + '</legend><div class="grid grid--2">' +
      rf('instituicao', 'Instituição', f.instituicao) + rf('curso', 'Curso', f.curso) +
      rf('nivel', 'Nível', f.nivel, 'Ex.: Ensino médio, Técnico, Graduação') +
      rf('inicio', 'Início', f.inicio, 'Ex.: 2023') + rf('fim', 'Conclusão (ou previsão)', f.fim, 'Ex.: 2026') +
      '</div><div><button type="button" class="btn btn--danger btn--sm" data-action="remove-edu" data-index="' + i + '">Remover formação</button></div></fieldset>';
  }
  function expRow(e, i) {
    return '<fieldset class="repeat"><legend>Experiência ' + (i + 1) + '</legend><div class="grid grid--2">' +
      rf('empresa', 'Empresa', e.empresa) + rf('cargo', 'Cargo', e.cargo) +
      rf('inicio', 'Início', e.inicio, 'Ex.: 03/2023') + rf('fim', 'Fim (vazio = atual)', e.fim, 'Ex.: 12/2024') +
      '<label class="field field--full"><span>Atividades e resultados (uma por linha)</span><textarea data-f="descricao" rows="3">' + esc(e.descricao) + '</textarea></label>' +
      '</div><div><button type="button" class="btn btn--danger btn--sm" data-action="remove-exp" data-index="' + i + '">Remover experiência</button></div></fieldset>';
  }
  function val(root, key) {
    var el = root.querySelector('[data-f="' + key + '"]');
    return el ? el.value.trim() : '';
  }
  function collectProfile(form) {
    var v = function (n) { var el = form.elements[n]; return el ? el.value.trim() : ''; };
    var p = Object.assign({}, st().profile);
    ['nome', 'email', 'telefone', 'cidade', 'estado', 'objetivo', 'resumo', 'linkedin', 'github', 'portfolio'].forEach(function (k) { p[k] = v(k); });
    p.habilidades = splitList(v('habilidades'));
    p.idiomas = splitList(v('idiomas'));
    p.formacoes = Array.prototype.map.call(form.querySelectorAll('[data-list="edu"] .repeat'), function (fs) {
      return { instituicao: val(fs, 'instituicao'), curso: val(fs, 'curso'), nivel: val(fs, 'nivel'), inicio: val(fs, 'inicio'), fim: val(fs, 'fim') };
    });
    p.experiencias = Array.prototype.map.call(form.querySelectorAll('[data-list="exp"] .repeat'), function (fs) {
      return { empresa: val(fs, 'empresa'), cargo: val(fs, 'cargo'), inicio: val(fs, 'inicio'), fim: val(fs, 'fim'), descricao: val(fs, 'descricao') };
    });
    return p;
  }

  /* ---------- currículo ---------- */
  function period(item) {
    if (!item.inicio && !item.fim) return '';
    return esc(item.inicio || '') + (item.inicio ? ' – ' : '') + esc(item.fim || 'Atual');
  }
  function resumeHTML(p, tpl) {
    var contacts = [p.email, p.telefone, [p.cidade, p.estado].filter(Boolean).join(' - '), p.linkedin, p.github, p.portfolio].filter(Boolean);
    var html = '<div class="cv cv--' + esc(tpl) + '"><h1>' + esc(p.nome) + '</h1>';
    if (contacts.length) html += '<p class="cv-contact">' + contacts.map(esc).join(' | ') + '</p>';
    if (p.objetivo) html += '<h2>Objetivo profissional</h2><p>' + esc(p.objetivo) + '</p>';
    if (p.resumo) html += '<h2>Resumo</h2><p>' + nl2br(p.resumo) + '</p>';
    var exps = p.experiencias.filter(function (e) { return e.cargo || e.empresa; });
    if (exps.length) {
      html += '<h2>Experiência profissional</h2>' + exps.map(function (e) {
        var bullets = String(e.descricao || '').split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
        return '<div class="cv-item"><div class="cv-item-head"><span>' + esc(e.cargo) + '</span><span>' + period(e) + '</span></div>' +
          (e.empresa ? '<div class="cv-item-sub">' + esc(e.empresa) + '</div>' : '') +
          (bullets.length ? '<ul>' + bullets.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('') + '</ul>' : '') + '</div>';
      }).join('');
    }
    var edus = p.formacoes.filter(function (f) { return f.curso || f.instituicao; });
    if (edus.length) {
      html += '<h2>Formação acadêmica</h2>' + edus.map(function (f) {
        return '<div class="cv-item"><div class="cv-item-head"><span>' + esc(f.curso) + (f.nivel ? ' (' + esc(f.nivel) + ')' : '') + '</span><span>' + period(f) + '</span></div>' +
          (f.instituicao ? '<div class="cv-item-sub">' + esc(f.instituicao) + '</div>' : '') + '</div>';
      }).join('');
    }
    if (p.habilidades.length) html += '<h2>Habilidades</h2><p>' + p.habilidades.map(esc).join(', ') + '</p>';
    if (p.idiomas.length) html += '<h2>Idiomas</h2><p>' + p.idiomas.map(esc).join(', ') + '</p>';
    return html + '</div>';
  }

  /* ---------- análise de vaga: resultado ---------- */
  function analysisHTML(a) {
    var scoreBlock = a.score === null
      ? '<p class="notice">Não foi possível calcular a compatibilidade porque nenhuma habilidade conhecida foi reconhecida no texto.</p>'
      : '<div class="score-head"><div class="score" style="--v:' + a.score + '" role="img" aria-label="Compatibilidade de ' + a.score + ' por cento"><span>' + a.score + '%</span></div>' +
        '<div><h2>Compatibilidade</h2><p class="hint">Entre o seu perfil e os requisitos reconhecidos na vaga.</p></div></div>';
    var info = [
      ['Cargo', a.cargo], ['Empresa', a.empresa], ['Senioridade', a.senioridade],
      ['Formação', a.formacao.join(' | ')], ['Experiência', a.experiencia.join(' | ')], ['Idiomas', a.idiomas.join(', ')]
    ].filter(function (r) { return r[1]; });
    return '<section class="card stack" aria-labelledby="res-title"><h2 id="res-title" class="visually-hidden">Resultado da análise</h2>' + scoreBlock +
      '<div class="result-grid"><div><h3>Pontos fortes</h3>' + chips(a.strengths, 'ok') + '</div>' +
      '<div><h3>Pontos a desenvolver</h3>' + chips(a.missing, 'warn') + '</div></div>' +
      (a.missingDesired.length ? '<div><h3>Diferenciais que você ainda não tem</h3>' + chips(a.missingDesired, 'neutral') + '</div>' : '') +
      '<div><h3>Resumo da vaga</h3><dl class="kv">' + info.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('') + '</dl></div>' +
      (a.requisitos.length ? '<div><h3>Habilidades pedidas</h3>' + chips(a.requisitos, 'neutral') + '</div>' : '') +
      (a.responsabilidades.length ? '<div><h3>Responsabilidades</h3><ul>' + a.responsabilidades.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ul></div>' : '') +
      '<div><h3>Recomendação da CareerIA</h3><ul>' + a.recomendacoes.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ul></div>' +
      '<div class="btn-row">' +
      (a.missing.length ? '<button type="button" class="btn" data-action="to-plan" data-id="' + a.id + '">Adicionar ao Meu plano</button>' : '') +
      '<a class="btn btn--ghost" href="#/carta">Gerar carta para esta vaga</a></div></section>';
  }

  var Pages = {};
  var selectedAnalysis = null;
  var lastLetter = null;

  /* =================== LANDING =================== */
  Pages.landing = {
    title: 'CareerIA | Transforme seu potencial em oportunidade',
    render: function () {
      var feats = [
        ['📄', 'Currículo pronto para ATS', 'Preencha seu perfil uma vez e gere um currículo limpo, em dois modelos, pronto para virar PDF.'],
        ['🔎', 'Análise de vagas', 'Cole a descrição da vaga e veja o quanto seu perfil combina com ela e o que falta.'],
        ['✉️', 'Carta de apresentação', 'Gere uma carta em cinco tons, usando só o que está no seu perfil.'],
        ['🧭', 'Plano de desenvolvimento', 'Transforme as lacunas encontradas em etapas de estudo e acompanhe o progresso.'],
        ['📌', 'Acompanhamento de candidaturas', 'Um quadro para saber onde cada candidatura está, do interesse à resposta final.']
      ];
      return '<header class="land-nav"><div class="land-nav__in">' +
        '<a class="brand" href="#/"><span class="brand__mark" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16l6-6 4 4 6-8"/></svg></span>CareerIA</a>' +
        '<nav class="land-links" aria-label="Seções da página">' +
        '<button type="button" class="link hide-sm" data-scroll="recursos">Recursos</button>' +
        '<button type="button" class="link hide-sm" data-scroll="como-funciona">Como funciona</button>' +
        '<button type="button" class="link hide-sm" data-scroll="faq">Perguntas</button>' +
        '<button type="button" class="btn btn--ghost btn--sm" data-action="theme" aria-label="Alternar tema claro e escuro">Tema</button>' +
        '<a class="btn btn--sm" href="#/dashboard">Abrir a plataforma</a></nav></div></header>' +
        '<main id="main" tabindex="-1">' +
        '<div class="wrap"><section class="hero"><div>' +
        '<h1>Seu próximo emprego começa aqui.</h1>' +
        '<p class="hero__sub">Crie seu currículo, analise vagas, descubra suas lacunas profissionais e se prepare melhor para o mercado de trabalho.</p>' +
        '<div class="btn-row"><a class="btn btn--lg" href="#/dashboard">Começar gratuitamente</a>' +
        '<button type="button" class="btn btn--ghost btn--lg" data-scroll="recursos">Conhecer a plataforma</button></div>' +
        '<p class="hint" style="margin-top:1rem">Sem cadastro. Seus dados ficam salvos só neste navegador.</p></div>' +
        '<div class="card demo" aria-label="Exemplo ilustrativo de análise de vaga"><div class="demo__bar" aria-hidden="true"><i></i><i></i><i></i></div>' +
        '<div class="score-head"><div class="score" style="--v:78"><span>78%</span></div><div><h3>Compatibilidade</h3><p class="hint">Exemplo ilustrativo</p></div></div>' +
        '<h3 style="margin-top:1rem">Pontos fortes</h3><ul class="chips chips--ok"><li>HTML</li><li>CSS</li><li>JavaScript</li><li>Comunicação</li></ul>' +
        '<h3 style="margin-top:1rem">Pontos a desenvolver</h3><ul class="chips chips--warn"><li>SQL</li><li>Git e GitHub</li><li>APIs REST</li></ul></div></section></div>' +
        '<div class="wrap"><section class="section" id="recursos"><h2>Por que usar a CareerIA?</h2>' +
        '<p class="section__lead">Tudo o que você precisa para se candidatar com mais clareza, em um só lugar.</p><div class="grid grid--3">' +
        feats.map(function (f) { return '<article class="card feature"><div class="feature__ic" aria-hidden="true">' + f[0] + '</div><h3>' + f[1] + '</h3><p>' + f[2] + '</p></article>'; }).join('') +
        '</div></section>' +
        '<section class="section" id="como-funciona"><h2>Como funciona</h2><p class="section__lead">Três passos, sem complicação.</p><ol class="steps">' +
        '<li><h3>Preencha seu perfil</h3><p class="hint">Formação, experiências, habilidades e idiomas.</p></li>' +
        '<li><h3>Analise uma vaga</h3><p class="hint">Cole o texto da vaga e veja pontos fortes e lacunas.</p></li>' +
        '<li><h3>Candidate-se preparado</h3><p class="hint">Gere o currículo e a carta e acompanhe cada candidatura.</p></li></ol></section>' +
        '<section class="section"><h2>Benefícios</h2><div class="grid grid--3">' +
        '<article class="card"><h3>Seus dados ficam com você</h3><p class="hint">Nada é enviado para servidores: tudo fica no navegador do seu computador.</p></article>' +
        '<article class="card"><h3>Gratuito e sem cadastro</h3><p class="hint">Abra e use. Você não precisa criar conta.</p></article>' +
        '<article class="card"><h3>Currículo limpo</h3><p class="hint">Texto simples e estrutura clara, o formato que os sistemas de triagem leem melhor.</p></article></div></section>' +
        '<section class="section faq" id="faq"><h2>Perguntas frequentes</h2>' +
        '<details><summary>A CareerIA usa inteligência artificial?</summary><p>Nesta versão, não. A análise compara o texto da vaga com uma lista de habilidades conhecidas e com o seu perfil, e as cartas são montadas a partir de modelos e dos seus dados.</p></details>' +
        '<details><summary>Onde ficam meus dados?</summary><p>No armazenamento do seu navegador. Se limpar os dados do navegador ou trocar de computador, eles não vão junto.</p></details>' +
        '<details><summary>Como salvo meu currículo em PDF?</summary><p>Na tela Currículo, clique em Exportar PDF e escolha "Salvar como PDF" na janela de impressão.</p></details>' +
        '<details><summary>A análise de vaga é 100% precisa?</summary><p>Não. Ela reconhece uma lista de habilidades, então confira sempre o texto completo da vaga.</p></details></section>' +
        '<section class="section"><div class="cta"><h2>Transforme seu potencial em oportunidade.</h2><a class="btn btn--lg" href="#/dashboard">Começar gratuitamente</a></div></section></div></main>' +
        '<footer class="land-foot"><div class="wrap">CareerIA. Projeto de apoio a estudantes e candidatos ao primeiro emprego.</div></footer>';
    },
    mount: function (root) {
      root.addEventListener('click', function (e) {
        var b = e.target.closest('[data-scroll]');
        if (!b) return;
        var el = document.getElementById(b.dataset.scroll);
        if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  };

  /* =================== DASHBOARD =================== */
  Pages.dashboard = {
    title: 'Dashboard',
    render: function () {
      var s = st(), p = s.profile, pct = profileCompletion(p);
      var first = p.nome ? p.nome.split(' ')[0] : '';
      var steps = [];
      if (pct < 100) steps.push(['Complete seu perfil', 'Seu perfil está ' + pct + '% completo.', '#/perfil']);
      if (!s.analyses.length) steps.push(['Analisar minha primeira vaga', 'Descubra seus pontos fortes e lacunas.', '#/vagas']);
      else if (!s.letters.length) steps.push(['Gerar uma carta de apresentação', 'Use os dados do seu perfil.', '#/carta']);
      if (!s.plan.items.length) steps.push(['Montar meu plano de estudos', 'Transforme lacunas em etapas.', '#/plano']);
      if (!s.applications.length) steps.push(['Registrar uma candidatura', 'Acompanhe cada etapa no quadro.', '#/candidaturas']);
      steps.push(['Ver meu currículo', 'Exporte em PDF quando estiver pronto.', '#/curriculo']);

      var recent = s.analyses.slice(0, 3);
      var counts = STATUS.map(function (c) { return [c.label, s.applications.filter(function (a) { return a.status === c.id; }).length]; });
      var maxCount = Math.max(1, Math.max.apply(null, counts.map(function (c) { return c[1]; })));
      var done = s.plan.items.filter(function (i) { return i.feito; }).length;
      var planPct = s.plan.items.length ? Math.round(done / s.plan.items.length * 100) : 0;

      return head('Olá' + (first ? ', ' + esc(first) : '') + '!', 'Veja como está o seu progresso profissional.') +
        '<div class="grid grid--stats" style="margin-bottom:1.1rem">' +
        '<div class="card stat"><strong>' + pct + '%</strong><span>Perfil completo</span><div class="progress" aria-hidden="true"><i style="width:' + pct + '%"></i></div></div>' +
        '<div class="card stat"><strong>' + s.analyses.length + '</strong><span>Vagas analisadas</span></div>' +
        '<div class="card stat"><strong>' + s.letters.length + '</strong><span>Cartas geradas</span></div>' +
        '<div class="card stat"><strong>' + s.applications.length + '</strong><span>Candidaturas</span></div>' +
        '<div class="card stat"><strong>' + p.habilidades.length + '</strong><span>Habilidades no perfil</span></div></div>' +
        '<div class="grid grid--2">' +
        '<section class="card"><h2>Continue de onde parou</h2><ul class="list">' +
        steps.slice(0, 4).map(function (t) { return '<li><div><strong>' + t[0] + '</strong><div class="meta">' + t[1] + '</div></div><a class="btn btn--ghost btn--sm" href="' + t[2] + '">Abrir</a></li>'; }).join('') + '</ul></section>' +
        '<section class="card"><h2>Últimas análises</h2>' +
        (recent.length
          ? '<ul class="list">' + recent.map(function (a) { return '<li><div><strong>' + esc(a.cargo || 'Vaga') + '</strong><div class="meta">' + esc(a.empresa || 'Empresa não informada') + ' · ' + formatDate(a.criadoEm) + '</div></div><span class="badge">' + (a.score === null ? '—' : a.score + '%') + '</span></li>'; }).join('') + '</ul>'
          : '<div class="empty"><p>Você ainda não possui análises.</p><a class="btn" href="#/vagas">Analisar minha primeira vaga</a></div>') + '</section>' +
        '<section class="card"><h2>Candidaturas por etapa</h2>' +
        (s.applications.length
          ? '<ul class="list">' + counts.map(function (c) { return '<li><span>' + c[0] + '</span><span style="flex:1;min-width:80px"><span class="progress" style="display:block"><i style="width:' + Math.round(c[1] / maxCount * 100) + '%"></i></span></span><strong>' + c[1] + '</strong></li>'; }).join('') + '</ul>'
          : '<div class="empty"><p>Nenhuma candidatura registrada.</p><a class="btn" href="#/candidaturas">Registrar candidatura</a></div>') + '</section>' +
        '<section class="card"><h2>Próximos objetivos</h2>' +
        (s.plan.items.length
          ? '<p>' + (s.plan.objetivo ? '<strong>' + esc(s.plan.objetivo) + '</strong><br>' : '') + done + ' de ' + s.plan.items.length + ' etapas concluídas.</p><div class="progress" aria-hidden="true"><i style="width:' + planPct + '%"></i></div><p style="margin-top:.8rem"><a href="#/plano">Ver meu plano</a></p>'
          : '<div class="empty"><p>Você ainda não montou um plano de estudos.</p><a class="btn" href="#/plano">Montar meu plano</a></div>') + '</section></div>';
    },
    mount: function () {}
  };

  /* =================== PERFIL =================== */
  Pages.perfil = {
    title: 'Meu perfil',
    render: function () {
      var p = st().profile;
      return head('Meu perfil', 'Preencha uma vez. Currículo, análises e cartas usam estes dados.') +
        '<form id="profile-form" class="stack" novalidate>' +
        '<section class="card"><h2>Dados pessoais</h2><div class="grid grid--2">' +
        field('nome', 'Nome completo', p.nome, { auto: 'name', required: true }) +
        field('email', 'E-mail', p.email, { type: 'email', auto: 'email' }) +
        field('telefone', 'Telefone', p.telefone, { type: 'tel', auto: 'tel' }) +
        field('cidade', 'Cidade', p.cidade, { auto: 'address-level2' }) +
        '<div class="field"><label for="f-estado">Estado</label><select id="f-estado" name="estado"><option value="">Selecione</option>' +
        ESTADOS.map(function (u) { return '<option' + (u === p.estado ? ' selected' : '') + '>' + u + '</option>'; }).join('') + '</select></div>' +
        '</div></section>' +
        '<section class="card"><h2>Objetivo e resumo</h2><div class="grid">' +
        field('objetivo', 'Objetivo profissional', p.objetivo, { ph: 'Ex.: Desenvolvedor front-end júnior' }) +
        area('resumo', 'Resumo profissional', p.resumo, { rows: 4, ph: 'Duas ou três frases sobre você e o que busca.' }) +
        '</div></section>' +
        '<section class="card"><h2>Formação acadêmica</h2><div data-list="edu">' + p.formacoes.map(eduRow).join('') + '</div>' +
        '<button type="button" class="btn btn--ghost" data-action="add-edu">Adicionar formação</button></section>' +
        '<section class="card"><h2>Experiências profissionais</h2><div data-list="exp">' + p.experiencias.map(expRow).join('') + '</div>' +
        '<button type="button" class="btn btn--ghost" data-action="add-exp">Adicionar experiência</button></section>' +
        '<section class="card"><h2>Habilidades e idiomas</h2><div class="grid">' +
        area('habilidades', 'Habilidades', p.habilidades.join(', '), { rows: 3, ph: 'HTML, CSS, JavaScript, Comunicação...', hint: 'Separe por vírgula. Inclua habilidades técnicas e comportamentais.' }) +
        area('idiomas', 'Idiomas', p.idiomas.join(', '), { rows: 2, ph: 'Inglês básico, Espanhol...', hint: 'Separe por vírgula.' }) +
        '</div></section>' +
        '<section class="card"><h2>Links profissionais</h2><div class="grid grid--2">' +
        field('linkedin', 'LinkedIn', p.linkedin, { ph: 'linkedin.com/in/seu-nome' }) +
        field('github', 'GitHub', p.github, { ph: 'github.com/seu-usuario' }) +
        field('portfolio', 'Portfólio ou site', p.portfolio, { full: true }) +
        '</div></section>' +
        '<div class="btn-row"><button type="submit" class="btn btn--lg">Salvar perfil</button></div></form>';
    },
    mount: function (root) {
      var form = root.querySelector('#profile-form');
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var p = collectProfile(form);
        if (!p.nome) { toast('Informe seu nome completo.', 'error'); form.elements.nome.focus(); return; }
        if (p.email && !/^\S+@\S+\.\S+$/.test(p.email)) { toast('Digite um e-mail válido.', 'error'); form.elements.email.focus(); return; }
        st().profile = p;
        S.save();
        toast('Perfil salvo com sucesso!');
        rerender();
      });
      form.addEventListener('click', function (e) {
        var b = e.target.closest('[data-action]');
        if (!b) return;
        var p = collectProfile(form), a = b.dataset.action, i = Number(b.dataset.index);
        if (a === 'add-edu') p.formacoes.push({});
        else if (a === 'add-exp') p.experiencias.push({});
        else if (a === 'remove-edu') p.formacoes.splice(i, 1);
        else if (a === 'remove-exp') p.experiencias.splice(i, 1);
        else return;
        p.formacoes = p.formacoes.map(function (f) { return Object.assign({ instituicao: '', curso: '', nivel: '', inicio: '', fim: '' }, f); });
        p.experiencias = p.experiencias.map(function (x) { return Object.assign({ empresa: '', cargo: '', inicio: '', fim: '', descricao: '' }, x); });
        st().profile = p;
        S.save();
        rerender();
      });
    }
  };

  /* =================== CURRÍCULO =================== */
  Pages.curriculo = {
    title: 'Currículo',
    render: function () {
      var s = st(), p = s.profile;
      if (!p.nome) return head('Currículo') + emptyState('Seu currículo é montado a partir do seu perfil. Comece informando seus dados.', 'Preencher meu perfil', '#/perfil');
      return head('Currículo', 'Escolha o modelo e exporte em PDF. Para editar o conteúdo, atualize o seu perfil.') +
        '<div class="card" style="margin-bottom:1rem"><div class="btn-row" style="align-items:center;justify-content:space-between">' +
        '<div class="seg" role="radiogroup" aria-label="Modelo do currículo">' +
        ['minimalista', 'profissional'].map(function (t) {
          return '<label><input type="radio" name="tpl" value="' + t + '"' + (s.template === t ? ' checked' : '') + '><span>' + (t === 'minimalista' ? 'Minimalista' : 'Profissional') + '</span></label>';
        }).join('') + '</div>' +
        '<div class="btn-row"><a class="btn btn--ghost" href="#/perfil">Editar perfil</a><button type="button" class="btn" data-action="print">Exportar PDF</button></div></div>' +
        '<p class="hint" style="margin:.6rem 0 0">Na janela de impressão, escolha "Salvar como PDF" como destino.</p></div>' +
        '<div class="print-area">' + resumeHTML(p, s.template) + '</div>';
    },
    mount: function (root) {
      root.addEventListener('change', function (e) {
        if (e.target.name === 'tpl') { st().template = e.target.value; S.save(); rerender(); }
      });
      root.addEventListener('click', function (e) {
        if (e.target.closest('[data-action="print"]')) printNow();
      });
    }
  };

  /* =================== ANALISAR VAGA =================== */
  Pages.vagas = {
    title: 'Analisar vaga',
    render: function () {
      var s = st();
      var sel = s.analyses.filter(function (a) { return a.id === selectedAnalysis; })[0];
      var noSkills = !s.profile.habilidades.length;
      return head('Analisar vaga', 'Cole a descrição da vaga e veja o quanto o seu perfil combina com ela.') +
        (noSkills ? '<p class="notice" style="margin-bottom:1rem">Seu perfil ainda não tem habilidades cadastradas, então o resultado será limitado. <a href="#/perfil">Complete o perfil</a>.</p>' : '') +
        '<form id="job-form" class="card stack" novalidate><div class="grid grid--2">' +
        field('cargo', 'Cargo (opcional)', '', { ph: 'Ex.: Estagiário de TI' }) + field('empresa', 'Empresa (opcional)', '') + '</div>' +
        '<div class="field"><label for="f-texto">Descrição da vaga</label><textarea id="f-texto" name="texto" rows="9" placeholder="Cole aqui o texto completo da vaga, com requisitos e diferenciais."></textarea>' +
        '<small class="hint">A análise compara palavras-chave com o seu perfil. Não usa inteligência artificial.</small></div>' +
        '<div><button type="submit" class="btn btn--lg" id="job-btn">Analisar vaga</button></div></form>' +
        '<div id="job-result" style="margin-top:1.1rem" tabindex="-1">' + (sel ? analysisHTML(sel) : '') + '</div>' +
        '<section class="card" style="margin-top:1.1rem"><h2>Histórico de análises</h2>' +
        (s.analyses.length
          ? '<div class="field" style="margin-bottom:.8rem"><label for="f-busca">Pesquisar no histórico</label><input id="f-busca" type="search" placeholder="Cargo ou empresa"></div>' +
            '<ul class="list" id="hist">' + s.analyses.map(function (a) {
              return '<li data-search="' + esc((a.cargo + ' ' + a.empresa).toLowerCase()) + '"><div><strong>' + esc(a.cargo || 'Vaga') + '</strong><div class="meta">' + esc(a.empresa || 'Empresa não informada') + ' · ' + formatDate(a.criadoEm) + '</div></div>' +
                '<div class="btn-row"><span class="badge">' + (a.score === null ? '—' : a.score + '%') + '</span>' +
                '<button type="button" class="btn btn--ghost btn--sm" data-action="view" data-id="' + a.id + '">Ver</button>' +
                '<button type="button" class="btn btn--danger btn--sm" data-action="del" data-id="' + a.id + '">Excluir</button></div></li>';
            }).join('') + '</ul>'
          : '<div class="empty"><p>Você ainda não possui análises.</p></div>') + '</section>';
    },
    mount: function (root) {
      var form = root.querySelector('#job-form');
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var texto = form.elements.texto.value.trim();
        if (texto.length < 40) { toast('Cole a descrição completa da vaga (mínimo de 40 caracteres).', 'error'); form.elements.texto.focus(); return; }
        var btn = root.querySelector('#job-btn');
        btn.disabled = true; btn.textContent = 'Analisando...';
        setTimeout(function () {
          var res = A.analyzeJob({ texto: texto, cargo: form.elements.cargo.value, empresa: form.elements.empresa.value }, st().profile);
          res.id = S.uid(); res.criadoEm = new Date().toISOString(); res.texto = texto;
          st().analyses.unshift(res);
          st().analyses = st().analyses.slice(0, 50);
          S.save();
          selectedAnalysis = res.id;
          toast('Análise concluída!');
          rerender();
          var out = document.getElementById('job-result');
          if (out && out.scrollIntoView) out.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 350);
      });
      root.addEventListener('click', function (e) {
        var b = e.target.closest('[data-action]');
        if (!b) return;
        var id = b.dataset.id, a = b.dataset.action;
        var found = st().analyses.filter(function (x) { return x.id === id; })[0];
        if (a === 'view') { selectedAnalysis = id; rerender(); var o = document.getElementById('job-result'); if (o && o.scrollIntoView) o.scrollIntoView({ behavior: 'smooth' }); }
        else if (a === 'del') {
          if (!window.confirm('Excluir esta análise?')) return;
          st().analyses = st().analyses.filter(function (x) { return x.id !== id; });
          if (selectedAnalysis === id) selectedAnalysis = null;
          S.save(); toast('Análise excluída.'); rerender();
        } else if (a === 'to-plan' && found) {
          var existing = st().plan.items.map(function (i) { return i.titulo; });
          var n = st().plan.items.length;
          found.missing.forEach(function (name) {
            var titulo = 'Estudar ' + name;
            if (existing.indexOf(titulo) >= 0) return;
            n += 1;
            st().plan.items.push({ id: S.uid(), titulo: titulo, descricao: A.tipFor(name), habilidades: [name], feito: false });
          });
          if (!st().plan.objetivo && found.cargo) st().plan.objetivo = found.cargo;
          S.save(); toast('Etapas adicionadas ao Meu plano.');
          location.hash = '#/plano';
        }
      });
      var search = root.querySelector('#f-busca');
      if (search) search.addEventListener('input', function () {
        var q = search.value.trim().toLowerCase();
        root.querySelectorAll('#hist li').forEach(function (li) { li.hidden = q && li.dataset.search.indexOf(q) < 0; });
      });
    }
  };

  /* =================== CARTA =================== */
  Pages.carta = {
    title: 'Carta de apresentação',
    render: function () {
      var s = st();
      return head('Carta de apresentação', 'A carta usa somente as informações do seu perfil. Revise antes de enviar.') +
        (!s.profile.nome ? '<p class="notice" style="margin-bottom:1rem">Preencha seu <a href="#/perfil">perfil</a> para a carta sair com seus dados.</p>' : '') +
        '<form id="letter-form" class="card stack" novalidate><div class="grid grid--2">' +
        '<div class="field field--full"><label for="f-analise">Usar uma análise salva (opcional)</label><select id="f-analise" name="analise"><option value="">Nenhuma</option>' +
        s.analyses.map(function (a) { return '<option value="' + a.id + '">' + esc((a.cargo || 'Vaga') + (a.empresa ? ' - ' + a.empresa : '')) + '</option>'; }).join('') + '</select></div>' +
        field('empresa', 'Empresa', '', { ph: 'Ex.: Empresa Exemplo' }) +
        field('cargo', 'Cargo', '', { ph: 'Ex.: Estagiário de TI', required: true }) +
        '<div class="field field--full"><label for="f-tom">Tom da carta</label><select id="f-tom" name="tom">' +
        Object.keys(A.TONES).map(function (k) { return '<option value="' + k + '">' + A.TONES[k].label + '</option>'; }).join('') + '</select></div>' +
        '</div><div class="btn-row"><button type="submit" class="btn btn--lg">Gerar carta</button></div></form>' +
        '<div id="letter-out" style="margin-top:1.1rem">' + (lastLetter ? letterOut() : '') + '</div>' +
        '<section class="card" style="margin-top:1.1rem"><h2>Cartas geradas</h2>' +
        (s.letters.length
          ? '<ul class="list">' + s.letters.map(function (l) {
              return '<li><div><strong>' + esc(l.cargo || 'Carta') + '</strong><div class="meta">' + esc(l.empresa || 'Empresa não informada') + ' · ' + esc(A.TONES[l.tom] ? A.TONES[l.tom].label : '') + ' · ' + formatDate(l.criadoEm) + '</div></div>' +
                '<div class="btn-row"><button type="button" class="btn btn--ghost btn--sm" data-action="open" data-id="' + l.id + '">Abrir</button>' +
                '<button type="button" class="btn btn--danger btn--sm" data-action="del" data-id="' + l.id + '">Excluir</button></div></li>';
            }).join('') + '</ul>'
          : '<div class="empty"><p>Você ainda não gerou nenhuma carta.</p></div>') + '</section>';
    },
    mount: function (root) {
      var form = root.querySelector('#letter-form');
      function params() {
        var an = st().analyses.filter(function (a) { return a.id === form.elements.analise.value; })[0];
        return { profile: st().profile, empresa: form.elements.empresa.value, cargo: form.elements.cargo.value, tom: form.elements.tom.value, strengths: an ? an.strengths : [] };
      }
      form.elements.analise.addEventListener('change', function () {
        var an = st().analyses.filter(function (a) { return a.id === form.elements.analise.value; })[0];
        if (an) { form.elements.cargo.value = an.cargo || ''; form.elements.empresa.value = an.empresa || ''; }
      });
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!form.elements.cargo.value.trim()) { toast('Informe o cargo da vaga.', 'error'); form.elements.cargo.focus(); return; }
        var pr = params();
        var variant = Math.floor(Math.random() * 4);
        var entry = { id: S.uid(), cargo: pr.cargo.trim(), empresa: pr.empresa.trim(), tom: pr.tom, criadoEm: new Date().toISOString(), variant: variant, strengths: pr.strengths };
        entry.texto = A.generateLetter(Object.assign({ variant: variant }, pr));
        st().letters.unshift(entry);
        st().letters = st().letters.slice(0, 30);
        S.save();
        lastLetter = entry;
        toast('Carta gerada!');
        rerender();
      });
      root.addEventListener('click', function (e) {
        var b = e.target.closest('[data-action]');
        if (!b) return;
        var a = b.dataset.action;
        if (a === 'regen' && lastLetter) {
          lastLetter.variant = (lastLetter.variant || 0) + 1;
          lastLetter.texto = A.generateLetter({ profile: st().profile, empresa: lastLetter.empresa, cargo: lastLetter.cargo, tom: lastLetter.tom, strengths: lastLetter.strengths || [], variant: lastLetter.variant });
          S.save(); rerender();
        } else if (a === 'copy' && lastLetter) copyText(lastLetter.texto);
        else if (a === 'print') printNow();
        else if (a === 'open') {
          lastLetter = st().letters.filter(function (l) { return l.id === b.dataset.id; })[0] || null;
          rerender();
        } else if (a === 'del') {
          if (!window.confirm('Excluir esta carta?')) return;
          st().letters = st().letters.filter(function (l) { return l.id !== b.dataset.id; });
          if (lastLetter && lastLetter.id === b.dataset.id) lastLetter = null;
          S.save(); toast('Carta excluída.'); rerender();
        }
      });
    }
  };
  function letterOut() {
    return '<section class="card stack" aria-labelledby="letter-title"><h2 id="letter-title">Sua carta</h2>' +
      '<div class="letter print-area">' + esc(lastLetter.texto) + '</div>' +
      '<div class="btn-row"><button type="button" class="btn btn--ghost" data-action="regen">Regenerar</button>' +
      '<button type="button" class="btn btn--ghost" data-action="copy">Copiar</button>' +
      '<button type="button" class="btn" data-action="print">Exportar PDF</button></div></section>';
  }

  /* =================== CANDIDATURAS =================== */
  Pages.candidaturas = {
    title: 'Candidaturas',
    render: function () {
      var apps = st().applications;
      return head('Candidaturas', 'Arraste os cartões entre as colunas ou use o campo "Mover para".') +
        '<form id="app-form" class="card stack" novalidate><h2>Nova candidatura</h2><div class="grid grid--2">' +
        field('empresa', 'Empresa', '', { required: true }) + field('cargo', 'Cargo', '', { required: true }) +
        field('data', 'Data', new Date().toISOString().slice(0, 10), { type: 'date' }) +
        '<div class="field"><label for="f-status">Etapa</label><select id="f-status" name="status">' +
        STATUS.map(function (c) { return '<option value="' + c.id + '">' + c.label + '</option>'; }).join('') + '</select></div>' +
        field('link', 'Link da vaga', '', { type: 'url', ph: 'https://...', full: true }) +
        area('obs', 'Observações', '', { rows: 2 }) + '</div>' +
        '<div><button type="submit" class="btn">Adicionar candidatura</button></div></form>' +
        '<div class="board" style="margin-top:1.1rem">' + STATUS.map(function (col) {
          var items = apps.filter(function (a) { return a.status === col.id; });
          return '<section class="column" data-status="' + col.id + '" aria-label="' + col.label + '"><h3>' + col.label + ' <span class="count">' + items.length + '</span></h3><div class="column__list">' +
            (items.length ? items.map(function (a) {
              var url = safeUrl(a.link);
              return '<article class="app-card" draggable="true" data-id="' + a.id + '"><strong>' + esc(a.cargo) + '</strong><span class="meta">' + esc(a.empresa) + (a.data ? ' · ' + formatDate(a.data) : '') + '</span>' +
                (url ? '<a class="meta" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">Abrir vaga</a>' : '') +
                (a.obs ? '<span class="meta">' + esc(a.obs) + '</span>' : '') +
                '<label class="meta">Mover para <select data-action="move" data-id="' + a.id + '">' + STATUS.map(function (c) { return '<option value="' + c.id + '"' + (c.id === a.status ? ' selected' : '') + '>' + c.label + '</option>'; }).join('') + '</select></label>' +
                '<button type="button" class="btn btn--danger btn--sm" data-action="del" data-id="' + a.id + '">Excluir</button></article>';
            }).join('') : '<p class="empty-col">Nenhuma candidatura.</p>') + '</div></section>';
        }).join('') + '</div>';
    },
    mount: function (root) {
      var form = root.querySelector('#app-form');
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var v = function (n) { return form.elements[n].value.trim(); };
        if (!v('empresa') || !v('cargo')) { toast('Informe a empresa e o cargo.', 'error'); return; }
        var link = v('link');
        if (link && !safeUrl(link)) { toast('O link deve começar com http:// ou https://', 'error'); form.elements.link.focus(); return; }
        st().applications.unshift({ id: S.uid(), empresa: v('empresa'), cargo: v('cargo'), data: v('data'), link: link, obs: v('obs'), status: v('status') });
        S.save(); toast('Candidatura adicionada!'); rerender();
      });
      function moveTo(id, status) {
        var a = st().applications.filter(function (x) { return x.id === id; })[0];
        if (a && a.status !== status) { a.status = status; S.save(); rerender(); }
      }
      root.addEventListener('change', function (e) {
        if (e.target.dataset.action === 'move') moveTo(e.target.dataset.id, e.target.value);
      });
      root.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-action="del"]');
        if (!b) return;
        if (!window.confirm('Excluir esta candidatura?')) return;
        st().applications = st().applications.filter(function (x) { return x.id !== b.dataset.id; });
        S.save(); toast('Candidatura excluída.'); rerender();
      });
      root.addEventListener('dragstart', function (e) {
        var c = e.target.closest && e.target.closest('.app-card');
        if (c && e.dataTransfer) { e.dataTransfer.setData('text/plain', c.dataset.id); e.dataTransfer.effectAllowed = 'move'; }
      });
      root.querySelectorAll('.column').forEach(function (col) {
        col.addEventListener('dragover', function (e) { e.preventDefault(); col.classList.add('is-over'); });
        col.addEventListener('dragleave', function () { col.classList.remove('is-over'); });
        col.addEventListener('drop', function (e) {
          e.preventDefault(); col.classList.remove('is-over');
          var id = e.dataTransfer && e.dataTransfer.getData('text/plain');
          if (id) moveTo(id, col.dataset.status);
        });
      });
    }
  };

  /* =================== MEU PLANO =================== */
  Pages.plano = {
    title: 'Meu plano',
    render: function () {
      var plan = st().plan, items = plan.items;
      var done = items.filter(function (i) { return i.feito; }).length;
      var pct = items.length ? Math.round(done / items.length * 100) : 0;
      var lastA = st().analyses[0];
      return head('Meu plano', 'Transforme as lacunas das vagas em etapas de estudo e marque o que já concluiu.') +
        '<section class="card stack"><div class="field"><label for="f-obj">Objetivo profissional</label><input id="f-obj" value="' + esc(plan.objetivo) + '" placeholder="Ex.: Desenvolvedor front-end júnior"></div>' +
        (items.length ? '<div><strong>' + pct + '% concluído</strong> <span class="hint">(' + done + ' de ' + items.length + ' etapas)</span><div class="progress" style="margin-top:.4rem" aria-hidden="true"><i style="width:' + pct + '%"></i></div></div>' : '') +
        (lastA && lastA.missing.length ? '<div><button type="button" class="btn btn--ghost" data-action="suggest">Sugerir etapas com base na última análise</button></div>' : '') + '</section>' +
        '<div class="stack" style="margin-top:1.1rem">' +
        (items.length ? items.map(function (i, idx) {
          return '<article class="card step' + (i.feito ? ' is-done' : '') + '"><input type="checkbox" data-action="toggle" data-id="' + i.id + '"' + (i.feito ? ' checked' : '') + ' aria-label="Concluir etapa ' + esc(i.titulo) + '">' +
            '<div><h3>Etapa ' + (idx + 1) + ': ' + esc(i.titulo) + '</h3><p>' + esc(i.descricao) + '</p>' + (i.habilidades && i.habilidades.length ? chips(i.habilidades, 'neutral') : '') + '</div>' +
            '<button type="button" class="btn btn--danger btn--sm" data-action="del" data-id="' + i.id + '">Excluir</button></article>';
        }).join('') : '<div class="card empty"><p>Seu plano ainda não tem etapas. Adicione uma abaixo ou analise uma vaga para receber sugestões.</p><a class="btn" href="#/vagas">Analisar uma vaga</a></div>') + '</div>' +
        '<form id="step-form" class="card stack" style="margin-top:1.1rem" novalidate><h2>Adicionar etapa</h2><div class="grid grid--2">' +
        field('titulo', 'Título', '', { required: true, ph: 'Ex.: Aprender SQL' }) + field('habilidades', 'Habilidades (vírgula)', '', { ph: 'SQL, PostgreSQL' }) +
        area('descricao', 'Descrição e objetivo', '', { rows: 2 }) + '</div><div><button type="submit" class="btn">Adicionar etapa</button></div></form>';
    },
    mount: function (root) {
      var obj = root.querySelector('#f-obj');
      obj.addEventListener('change', function () { st().plan.objetivo = obj.value.trim(); S.save(); toast('Objetivo salvo.'); });
      var form = root.querySelector('#step-form');
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var t = form.elements.titulo.value.trim();
        if (!t) { toast('Informe o título da etapa.', 'error'); form.elements.titulo.focus(); return; }
        st().plan.items.push({ id: S.uid(), titulo: t, descricao: form.elements.descricao.value.trim(), habilidades: splitList(form.elements.habilidades.value), feito: false });
        S.save(); toast('Etapa adicionada!'); rerender();
      });
      root.addEventListener('change', function (e) {
        if (e.target.dataset.action !== 'toggle') return;
        var it = st().plan.items.filter(function (i) { return i.id === e.target.dataset.id; })[0];
        if (it) { it.feito = e.target.checked; S.save(); rerender(); }
      });
      root.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-action]');
        if (!b) return;
        if (b.dataset.action === 'del') {
          if (!window.confirm('Excluir esta etapa?')) return;
          st().plan.items = st().plan.items.filter(function (i) { return i.id !== b.dataset.id; });
          S.save(); rerender();
        } else if (b.dataset.action === 'suggest') {
          var a = st().analyses[0], existing = st().plan.items.map(function (i) { return i.titulo; }), added = 0;
          a.missing.forEach(function (name) {
            var titulo = 'Estudar ' + name;
            if (existing.indexOf(titulo) >= 0) return;
            st().plan.items.push({ id: S.uid(), titulo: titulo, descricao: A.tipFor(name), habilidades: [name], feito: false });
            added += 1;
          });
          if (!st().plan.objetivo && a.cargo) st().plan.objetivo = a.cargo;
          S.save(); toast(added ? added + ' etapa(s) adicionada(s).' : 'Essas etapas já estão no plano.'); rerender();
        }
      });
    }
  };

  g.Pages = Pages;
})(window);
