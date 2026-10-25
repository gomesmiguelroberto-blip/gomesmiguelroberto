/*
 * Análise de vagas SEM inteligência artificial.
 * Funciona comparando o texto da vaga com uma lista de habilidades conhecidas
 * (e seus sinônimos) e com o que está escrito no perfil do usuário.
 * Para ensinar uma habilidade nova ao sistema, basta adicionar um item em SKILLS.
 */
(function (g) {
  'use strict';

  function norm(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  var SOFT_TIP = 'Prepare exemplos reais (situação, ação e resultado) que mostrem essa habilidade e use-os no currículo e na entrevista.';

  var SKILLS = [
    { name: 'HTML', aliases: ['html', 'html5'], tip: 'Estude HTML semântico e acessibilidade e monte uma página completa do zero.' },
    { name: 'CSS', aliases: ['css', 'css3', 'sass', 'scss'], tip: 'Pratique Flexbox, Grid e layout responsivo reproduzindo páginas reais.' },
    { name: 'JavaScript', aliases: ['javascript', 'js', 'ecmascript'], tip: 'Treine manipulação do DOM, funções, arrays e requisições com fetch em pequenos projetos.' },
    { name: 'TypeScript', aliases: ['typescript'], tip: 'Aprenda tipos, interfaces e generics convertendo um projeto JavaScript para TypeScript.' },
    { name: 'React', aliases: ['react', 'reactjs', 'react.js'], tip: 'Construa um app pequeno com componentes, estado e hooks.' },
    { name: 'Angular', aliases: ['angular'], tip: 'Faça o tutorial oficial e crie um CRUD com rotas e formulários.' },
    { name: 'Vue', aliases: ['vue', 'vuejs', 'vue.js'], tip: 'Siga o guia oficial e crie uma lista de tarefas com componentes.' },
    { name: 'Node.js', aliases: ['node', 'nodejs', 'node.js'], tip: 'Crie uma API simples com Express e rotas básicas.' },
    { name: 'Java', aliases: ['java'], tip: 'Pratique orientação a objetos, coleções e exceções com exercícios e um projeto de console.' },
    { name: 'Spring Boot', aliases: ['spring boot', 'spring'], tip: 'Monte uma API REST com controller, service e repository.' },
    { name: 'Python', aliases: ['python'], tip: 'Resolva exercícios de lógica e automatize uma tarefa do dia a dia com um script.' },
    { name: 'SQL', aliases: ['sql'], tip: 'Pratique SELECT, JOIN, GROUP BY e filtros em um banco de exemplo.' },
    { name: 'PostgreSQL', aliases: ['postgresql', 'postgres'], tip: 'Instale o PostgreSQL, crie tabelas com chaves e relacionamentos e faça consultas.' },
    { name: 'MySQL', aliases: ['mysql'], tip: 'Crie um banco, tabelas e relacionamentos e pratique consultas.' },
    { name: 'MongoDB', aliases: ['mongodb', 'mongo'], tip: 'Entenda documentos e coleções e faça um CRUD simples.' },
    { name: 'Git e GitHub', aliases: ['git', 'github', 'gitlab'], tip: 'Aprenda commit, branch, merge e publique seus projetos no GitHub.' },
    { name: 'APIs REST', aliases: ['api rest', 'apis rest', 'rest', 'restful', 'api', 'apis'], tip: 'Entenda métodos HTTP e códigos de status e consuma uma API pública em um projeto.' },
    { name: 'Docker', aliases: ['docker', 'containers', 'conteineres'], tip: 'Aprenda imagem, contêiner e docker compose subindo um banco de dados local.' },
    { name: 'Linux', aliases: ['linux'], tip: 'Pratique os comandos básicos de terminal, arquivos e permissões.' },
    { name: 'C#', aliases: ['c#', 'csharp'], tip: 'Faça exercícios de orientação a objetos e um projeto de console.' },
    { name: '.NET', aliases: ['.net', 'dotnet'], tip: 'Crie uma API simples com ASP.NET Core.' },
    { name: 'PHP', aliases: ['php'], tip: 'Crie um formulário com PHP e banco de dados.' },
    { name: 'Excel', aliases: ['excel', 'planilhas'], tip: 'Pratique fórmulas (PROCV, SE, SOMASE), tabelas dinâmicas e gráficos.' },
    { name: 'Power BI', aliases: ['power bi', 'powerbi'], tip: 'Monte um painel com dados públicos e aprenda medidas básicas.' },
    { name: 'Pacote Office', aliases: ['pacote office', 'microsoft office', 'office'], tip: 'Pratique Word, Excel e PowerPoint criando documentos e apresentações completas.' },
    { name: 'Figma', aliases: ['figma'], tip: 'Desenhe as telas de um app pequeno e aprenda componentes e grids.' },
    { name: 'Photoshop', aliases: ['photoshop'], tip: 'Pratique recorte, camadas e ajustes de cor em peças simples.' },
    { name: 'Metodologias ágeis', aliases: ['scrum', 'agil', 'ageis', 'metodologias ageis', 'kanban'], tip: 'Entenda Scrum e Kanban e organize um projeto pessoal em um quadro de tarefas.' },
    { name: 'Testes', aliases: ['testes', 'teste automatizado', 'testes automatizados', 'jest', 'junit', 'tdd'], tip: 'Escreva testes unitários para funções simples do seu projeto.' },
    { name: 'Marketing digital', aliases: ['marketing digital', 'seo', 'midias sociais', 'redes sociais'], tip: 'Estude o funil de marketing e crie um calendário de conteúdo para uma conta fictícia.' },
    { name: 'Atendimento ao cliente', aliases: ['atendimento ao cliente', 'atendimento'], tip: 'Treine escuta ativa e como lidar com reclamações, com exemplos de situações reais.' },
    { name: 'Vendas', aliases: ['vendas', 'negociacao'], tip: 'Estude técnicas de abordagem e negociação e simule uma venda.' },
    { name: 'Inglês', aliases: ['ingles', 'english'], tip: 'Dedique alguns minutos por dia a leitura técnica e vocabulário da área.' },
    { name: 'Espanhol', aliases: ['espanhol'], tip: 'Pratique leitura e conversação básica com conteúdos da sua área.' },
    { name: 'Comunicação', aliases: ['comunicacao', 'boa comunicacao'], tip: SOFT_TIP },
    { name: 'Trabalho em equipe', aliases: ['trabalho em equipe', 'trabalho em grupo', 'colaboracao', 'colaborativo'], tip: SOFT_TIP },
    { name: 'Proatividade', aliases: ['proatividade', 'proativo', 'proativa', 'iniciativa'], tip: SOFT_TIP },
    { name: 'Organização', aliases: ['organizacao', 'organizado', 'organizada'], tip: SOFT_TIP },
    { name: 'Liderança', aliases: ['lideranca', 'lider'], tip: SOFT_TIP },
    { name: 'Resolução de problemas', aliases: ['resolucao de problemas', 'resolver problemas', 'solucao de problemas'], tip: SOFT_TIP },
    { name: 'Criatividade', aliases: ['criatividade', 'criativo', 'criativa'], tip: SOFT_TIP },
    { name: 'Adaptabilidade', aliases: ['adaptabilidade', 'flexibilidade'], tip: SOFT_TIP },
    { name: 'Pensamento analítico', aliases: ['pensamento analitico', 'analitico', 'analise de dados'], tip: SOFT_TIP },
    { name: 'Gestão do tempo', aliases: ['gestao do tempo'], tip: SOFT_TIP }
  ];

  var IDIOMAS = ['Inglês', 'Espanhol'];
  var BY_NAME = {};
  SKILLS.forEach(function (s) { BY_NAME[s.name] = s; });

  function escRx(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  var MATCHERS = SKILLS.map(function (s) {
    return {
      skill: s,
      rx: s.aliases.map(function (a) {
        return new RegExp('(^|[^a-z0-9+#])' + escRx(a) + '($|[^a-z0-9+#])');
      })
    };
  });

  function findSkills(text) {
    var n = norm(text);
    var found = new Set();
    MATCHERS.forEach(function (m) {
      if (m.rx.some(function (r) { return r.test(n); })) found.add(m.skill.name);
    });
    return found;
  }

  function tipFor(name) {
    return BY_NAME[name] ? BY_NAME[name].tip : SOFT_TIP;
  }

  function profileText(p) {
    return [
      p.resumo, p.objetivo, (p.habilidades || []).join('\n'), (p.idiomas || []).join('\n'),
      (p.experiencias || []).map(function (e) { return (e.cargo || '') + ' ' + (e.descricao || ''); }).join('\n'),
      (p.formacoes || []).map(function (f) { return (f.curso || '') + ' ' + (f.nivel || ''); }).join('\n')
    ].join('\n');
  }

  function detectSeniority(n) {
    if (/estagi/.test(n)) return 'Estágio';
    if (/trainee/.test(n)) return 'Trainee';
    if (/(^|[^a-z])(junior|jr)([^a-z]|$)/.test(n)) return 'Júnior';
    if (/(^|[^a-z])pleno([^a-z]|$)/.test(n)) return 'Pleno';
    if (/(senior|(^|[^a-z])sr([^a-z]|$))/.test(n)) return 'Sênior';
    return 'Não informada';
  }

  function analyzeJob(input, profile) {
    var texto = String(input.texto || '');
    var lines = texto.split(/\r?\n/);
    var required = new Set();
    var desired = new Set();
    var formacao = [];
    var experiencia = [];
    var responsabilidades = [];
    var mode = 'required';
    var inResp = false;

    lines.forEach(function (raw) {
      var line = raw.trim();
      if (!line) return;
      var n = norm(line);
      var isHeading = n.length < 70;
      var lineMode = mode;
      var isRespHeading = isHeading && /(responsabilidade|atividades|atribuic)/.test(n);

      if (/(diferenci|desejavel|desejaveis|nice to have|sera um plus|e um plus|conhecimentos adicionais|bonus)/.test(n)) {
        lineMode = 'desired';
        if (isHeading) mode = 'desired';
        inResp = false;
      } else if (isHeading && /(requisito|obrigatori|exigid|necessari|pre-requisito|qualificac|o que buscamos|o que esperamos)/.test(n)) {
        mode = 'required';
        lineMode = 'required';
        inResp = false;
      } else if (isRespHeading) {
        inResp = true;
      } else if (isHeading && /:\s*$/.test(line)) {
        inResp = false;
      } else if (inResp && responsabilidades.length < 6) {
        responsabilidades.push(line.replace(/^[-•*·\d.)\s]+/, ''));
      }

      findSkills(line).forEach(function (name) {
        (lineMode === 'desired' ? desired : required).add(name);
      });

      if (formacao.length < 3 && /(ensino medio|ensino superior|graduac|cursando|tecnico em|tecnologo|bacharel|formacao)/.test(n)) {
        formacao.push(line.slice(0, 160));
      }
      if (experiencia.length < 3 && /experienc/.test(n) && /(\d+\s*\+?\s*anos?|meses|sem experiencia|nao exige|nao e necessaria)/.test(n)) {
        experiencia.push(line.slice(0, 160));
      }
    });

    required.forEach(function (name) { desired.delete(name); });

    var have = findSkills(profileText(profile));
    var reqList = Array.from(required);
    var desList = Array.from(desired);
    var strengths = reqList.concat(desList).filter(function (n) { return have.has(n); });
    var missing = reqList.filter(function (n) { return !have.has(n); });
    var missingDesired = desList.filter(function (n) { return !have.has(n); });

    var score = null;
    if (reqList.length || desList.length) {
      var reqHit = reqList.filter(function (n) { return have.has(n); }).length;
      var desHit = desList.filter(function (n) { return have.has(n); }).length;
      if (reqList.length && desList.length) {
        score = Math.round((reqHit / reqList.length) * 80 + (desHit / desList.length) * 20);
      } else if (reqList.length) {
        score = Math.round((reqHit / reqList.length) * 100);
      } else {
        score = Math.round((desHit / desList.length) * 100);
      }
    }

    var idiomas = reqList.concat(desList).filter(function (n) { return IDIOMAS.indexOf(n) >= 0; });
    var skillsOnly = reqList.filter(function (n) { return IDIOMAS.indexOf(n) < 0; });

    var recs = [];
    if (score === null) {
      recs.push('Não reconheci habilidades conhecidas no texto. Cole a descrição completa da vaga, com os requisitos.');
    } else {
      if (score >= 75) recs.push('Seu perfil está bem alinhado com esta vaga. Destaque no currículo: ' + joinList(strengths.slice(0, 5)) + '.');
      else if (score >= 50) recs.push('Você tem uma boa base para esta vaga. Vale se candidatar e, ao mesmo tempo, estudar os pontos a desenvolver.');
      else recs.push('Há lacunas importantes em relação aos requisitos. Considere estudar os pontos abaixo antes de se candidatar, ou procure vagas mais iniciais.');
      if (missing.length) {
        recs.push('Prioridade de estudo: ' + joinList(missing.slice(0, 3)) + '.');
      } else {
        recs.push('Você cobre todos os requisitos reconhecidos nesta vaga.');
      }
      recs.push('Use no currículo as palavras da vaga que você realmente domina, sem acrescentar o que não conhece.');
    }
    recs.push('Esta análise compara palavras-chave. Leia a vaga completa e confira os requisitos que não foram reconhecidos.');

    var first = lines.map(function (l) { return l.trim(); }).filter(Boolean)[0] || '';
    return {
      cargo: String(input.cargo || '').trim() || first.slice(0, 80),
      empresa: String(input.empresa || '').trim(),
      senioridade: detectSeniority(norm(texto)),
      formacao: formacao,
      experiencia: experiencia,
      idiomas: idiomas,
      responsabilidades: responsabilidades,
      requisitos: skillsOnly,
      desejaveis: desList,
      strengths: strengths,
      missing: missing,
      missingDesired: missingDesired,
      score: score,
      recomendacoes: recs
    };
  }

  function joinList(arr) {
    if (!arr.length) return '';
    if (arr.length === 1) return arr[0];
    return arr.slice(0, -1).join(', ') + ' e ' + arr[arr.length - 1];
  }

  /* ---------- Carta de apresentação (modelos por tom) ---------- */
  var TONES = {
    profissional: {
      label: 'Profissional',
      greet: 'Prezados(as) responsáveis pela seleção,',
      opens: ['Venho, por meio desta, manifestar meu interesse na vaga de {cargo}{em}.', 'Escrevo para me candidatar à vaga de {cargo}{em}.'],
      closes: ['Agradeço a atenção e coloco-me à disposição para uma conversa.', 'Fico à disposição para detalhar minha trajetória em uma entrevista.'],
      sign: 'Atenciosamente,'
    },
    objetivo: {
      label: 'Objetivo',
      greet: 'Olá,',
      opens: ['Meu interesse é na vaga de {cargo}{em}.', 'Candidato-me à vaga de {cargo}{em}.'],
      closes: ['Posso conversar quando for conveniente.', 'Fico disponível para uma entrevista.'],
      sign: 'Obrigado(a),'
    },
    confiante: {
      label: 'Confiante',
      greet: 'Olá, equipe{de},',
      opens: ['Tenho certeza de que posso contribuir como {cargo}{em}.', 'A vaga de {cargo}{em} combina com o que venho construindo e quero fazer parte.'],
      closes: ['Será um prazer mostrar na prática como posso agregar ao time.', 'Estou pronto(a) para o próximo passo.'],
      sign: 'Até breve,'
    },
    iniciante: {
      label: 'Iniciante',
      greet: 'Olá,',
      opens: ['Estou começando minha carreira e tenho muito interesse na vaga de {cargo}{em}.', 'Sou candidato(a) em início de carreira e gostaria de me candidatar à vaga de {cargo}{em}.'],
      closes: ['Tenho muita vontade de aprender e crescer com a equipe. Agradeço a oportunidade.', 'Agradeço a oportunidade e a chance de aprender com vocês.'],
      sign: 'Atenciosamente,'
    },
    formal: {
      label: 'Formal',
      greet: 'Ilustríssimos(as) Senhores(as),',
      opens: ['Dirijo-me a Vossas Senhorias para apresentar minha candidatura à vaga de {cargo}{em}.', 'Apresento, respeitosamente, minha candidatura ao cargo de {cargo}{em}.'],
      closes: ['Coloco-me à disposição para esclarecimentos e para eventual entrevista.', 'Aguardo, respeitosamente, a possibilidade de uma conversa.'],
      sign: 'Respeitosamente,'
    }
  };

  function generateLetter(opts) {
    var p = opts.profile;
    var tone = TONES[opts.tom] || TONES.profissional;
    var v = opts.variant || 0;
    var empresa = String(opts.empresa || '').trim();
    var cargo = String(opts.cargo || '').trim() || 'oportunidade';
    var em = empresa ? ' na empresa ' + empresa : '';
    var de = empresa ? ' da empresa ' + empresa : '';
    var fill = function (s) { return s.replace('{cargo}', cargo).replace('{em}', em).replace('{de}', de); };

    var paragraphs = [];
    paragraphs.push(fill(tone.opens[v % tone.opens.length]));

    var body = [];
    var edu = (p.formacoes || []).filter(function (f) { return f.curso; })[0];
    if (edu) body.push('Possuo formação em ' + edu.curso + (edu.instituicao ? ' (' + edu.instituicao + ')' : '') + '.');
    var exp = (p.experiencias || []).filter(function (e) { return e.cargo || e.empresa; })[0];
    if (exp) {
      var firstLine = String(exp.descricao || '').split('\n').map(function (l) { return l.trim(); }).filter(Boolean)[0];
      body.push('Tenho experiência como ' + (exp.cargo || 'profissional') + (exp.empresa ? ' em ' + exp.empresa : '') + (firstLine ? ', onde ' + lowerFirst(firstLine.replace(/[.;]+$/, '')) : '') + '.');
    }
    if (body.length) paragraphs.push(body.join(' '));

    var skills = (opts.strengths && opts.strengths.length ? opts.strengths : p.habilidades || []).slice(0, 6);
    if (skills.length) {
      paragraphs.push((opts.strengths && opts.strengths.length
        ? 'Identifiquei afinidade com os requisitos da vaga, como '
        : 'Entre minhas principais habilidades estão ') + joinList(skills) + '.');
    }
    if (p.objetivo) paragraphs.push('Meu objetivo profissional é ' + lowerFirst(p.objetivo.replace(/[.]+$/, '')) + '.');

    paragraphs.push(tone.closes[v % tone.closes.length]);

    var contato = [p.telefone, p.email].filter(Boolean).join(' | ');
    return [fill(tone.greet), '', paragraphs.join('\n\n'), '', tone.sign, p.nome || '', contato].join('\n').trim();
  }

  function lowerFirst(s) { return s ? s.charAt(0).toLowerCase() + s.slice(1) : s; }

  g.Analyzer = {
    analyzeJob: analyzeJob,
    generateLetter: generateLetter,
    tipFor: tipFor,
    TONES: TONES,
    joinList: joinList
  };
})(window);
