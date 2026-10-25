const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const courseGrid = $("#courseGrid");
const jobGrid = $("#jobGrid");
const newsGrid = $("#newsGrid");
const unitGrid = $("#unitGrid");
const root = document.documentElement;
const HOTSITE = "https://recife.oportunidades.salesianos.org.br/p/Hotsite/63894819714957545";

/* ---------- Dados reais (fontes públicas: escoladombosco.org.br, salesianos.org.br, rsb.org.br) ---------- */
const COURSES = [
  { title: "Auxiliar de Escritório – Administração", category: "Aprendizagem", duration: "24 meses", age: "14 a 24 anos" },
  { title: "Aprendiz em Vendas", category: "Aprendizagem", duration: "24 meses", age: "14 a 24 anos" },
  { title: "Aprendiz em Serviços Bancários", category: "Aprendizagem", duration: "24 meses", age: "14 a 18 anos" },
  { title: "Aprendiz em Recepção", category: "Aprendizagem", duration: "16 meses", age: "14 a 24 anos" },
  { title: "Auxiliar de Logística", category: "Aprendizagem", duration: "16 meses", age: "14 a 24 anos" },
  { title: "Atendente de Lanchonete – Alimentação", category: "Aprendizagem", duration: "16 meses", age: "14 a 24 anos" },
  { title: "Aprendiz COM.Direitos – Cultura", category: "Aprendizagem", duration: "24 meses", age: "14 a 24 anos" },
  { title: "Operador de Pré Impressão Gráfica", category: "Curso gráfico", duration: "20 meses", age: "14 a 24 anos" },
  { title: "Aprendiz em Serviços Gerais", category: "Aprendizagem", duration: "16 meses", age: "18 a 24 anos" },
  { title: "Auxiliar de Produção", category: "Aprendizagem", duration: "16 meses", age: "18 a 24 anos" },
  { title: "Operador de Telemarketing", category: "Aprendizagem", duration: "12 meses", age: "18 a 24 anos" },
  { title: "Aprendiz em Portaria", category: "Aprendizagem", duration: "16 meses", age: "18 a 22 anos e 7 meses" },
  { title: "Auxiliar em Serviços de Alimentação", category: "Aprendizagem", duration: "16 a 24 meses", age: "18 a 22 anos e 7 meses" }
];

const JOBS = [
  { type: "CONECT RH", title: "Vagas Salesianos Recife", company: "Lista atualizada de vagas das obras salesianas de Recife. Cadastro e candidatura direto no site oficial.", city: "Recife-PE", link: HOTSITE, cta: "Abrir vagas" },
  { type: "SALESIANOS NORDESTE", title: "Oportunidades e trabalhe conosco", company: "Página oficial da Inspetoria Salesiana do Nordeste com informações sobre oportunidades nas obras.", city: "Nordeste", link: "https://salesianos.org.br/oportunidades/", cta: "Ver página" },
  { type: "JOVEM APRENDIZ", title: "Programa Jovem Aprendiz", company: "Primeiro emprego com carteira assinada, com formação na Escola Dom Bosco e prática em empresas parceiras.", city: "Recife-PE", link: "https://linkme.bio/escoladombosco", cta: "Ver inscrições" }
];

const NEWS_FALLBACK = [
  { date: "Notícia", title: "Do Programa de Aprendizagem para a efetivação", text: "Histórias que mostram como a experiência como jovem aprendiz pode abrir caminhos no mercado de trabalho.", link: "https://escoladombosco.org.br/noticia/do-programa-de-aprendizagem-para-a-efetivacao-historias-que-mostram-o-impacto-da-formacao/" },
  { date: "Notícia", title: "Certificação “Entidade PRO”", text: "A Escola Dom Bosco foi reconhecida pela SRTE/PE por sua contribuição no combate ao trabalho infantil em Pernambuco.", link: "https://escoladombosco.org.br/noticia/certificacao-entidade-pro-por-contribuicao-no-combate-ao-trabalho-infantil-em-pernambuco/" },
  { date: "Edital", title: "Cursos Gráficos 2026.02", text: "Começou o processo seletivo para os Cursos Gráficos da Escola Dom Bosco, no bairro do Bongi (Recife-PE).", link: "https://escoladombosco.org.br/noticia/edital-curso-graficos-2026-02/" }
];

const UNITS = [
  { city: "Recife – Bongi", name: "Escola Dom Bosco de Artes e Ofícios", address: "Av. Eng. Abdias de Carvalho, 1855 – Bongi, Recife-PE, 50830-000", phone: "(81) 2129-4501", link: "https://escoladombosco.org.br/" },
  { city: "Recife – Boa Vista", name: "Colégio Salesiano Recife", address: "R. Dom Bosco, 551 – Boa Vista, Recife-PE, 50070-270", phone: "(81) 2129-5900", link: "https://www.salesianorecife.com.br/" },
  { city: "Jaboatão dos Guararapes", name: "Colégio Salesiano Jaboatão", address: "Rua Colônia dos Padres, 431 – Vila Rica, Jaboatão dos Guararapes-PE, 54090-450", phone: "(81) 9 8368-4767", link: "https://www.salesianojaboatao.org.br/" },
  { city: "Inspetoria do Nordeste", name: "Salesianos Nordeste", address: "Rua Estado de Israel, 386 – Paissandu, Recife-PE, 50070-215", phone: "(81) 2102-0800", link: "https://salesianos.org.br/contato/" }
];

const PARTNERS = ["Rede Salesiana Brasil", "Instituto Coca-Cola", "Plan Internacional", "Ministério do Trabalho e Emprego – PE", "Programa de Aprendizagem", "União Pela Vida (UPV)", "Don Bosco Green", "Aliança Empreendedora", "SaferNet Brasil", "Recode", "GIFE", "ABCR"];

const norm = t => (t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const esc = t => String(t ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const linkTo = (href, label) => `<p><a class="link" href="${esc(href)}" target="_blank" rel="noopener">${esc(label)} →</a></p>`;

/* Tenta a API do servidor Node (/api/...); se não existir, usa os dados reais acima. */
async function api(path, fallback) {
  try {
    const r = await fetch(path);
    if (!r.ok) throw new Error("Falha na API");
    return await r.json();
  } catch {
    return typeof fallback === "function" ? fallback() : fallback;
  }
}

/* ---------- Animação de entrada ao rolar ---------- */
const revealIO = "IntersectionObserver" in window
  ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); revealIO.unobserve(e.target); } }), { threshold: .12 })
  : null;
function reveal(scope = document) {
  scope.querySelectorAll(".card:not(.reveal),.step:not(.reveal),.timeline article:not(.reveal),.feature:not(.reveal),.banner:not(.reveal)").forEach((el, i) => {
    el.classList.add("reveal");
    el.style.transitionDelay = (i % 3) * 80 + "ms";
    revealIO ? revealIO.observe(el) : el.classList.add("in");
  });
}

/* ---------- Cursos (filtro por busca e categoria) ---------- */
let currentCat = "";
function courseCard(c) {
  return `<article class="card">
    <span class="card-date">${esc(c.category)}</span>
    <h3>${esc(c.title)}</h3>
    <p>Formação profissional com foco em competências para o mundo do trabalho.</p>
    <div class="meta"><span class="pill">${esc(c.duration)}</span><span class="pill">${esc(c.age)}</span></div>
  </article>`;
}

async function loadCourses(q = "") {
  let data = await api("/api/courses?q=" + encodeURIComponent(q), () =>
    COURSES.filter(c => norm(c.title + " " + c.category).includes(norm(q.trim()))));
  if (currentCat) data = data.filter(c => c.category === currentCat);
  $("#courseCount").textContent = `${data.length} curso(s)`;
  courseGrid.innerHTML = data.length
    ? data.map(courseCard).join("")
    : `<article class="card"><h3>Nenhum curso encontrado</h3><p>Tente outro termo de busca ou veja os cursos gratuitos online.</p></article>`;
  reveal(courseGrid);
}

/* ---------- Notícias ao vivo (site oficial), com reserva ---------- */
async function fetchLiveNews() {
  try {
    const r = await fetch("https://escoladombosco.org.br/wp-json/wp/v2/posts?per_page=3&_fields=title,link,date,excerpt");
    if (!r.ok) throw new Error("Falha ao ler notícias");
    const posts = await r.json();
    if (!posts.length) throw new Error("Sem notícias");
    const strip = h => { const d = document.createElement("div"); d.innerHTML = h; return d.textContent.trim(); };
    return posts.map(p => ({
      date: new Date(p.date).toLocaleDateString("pt-BR"),
      title: strip(p.title.rendered),
      text: strip(p.excerpt.rendered).slice(0, 180) + "…",
      link: p.link
    }));
  } catch {
    return NEWS_FALLBACK;
  }
}

async function loadData() {
  const [jobs, news, units] = await Promise.all([
    api("/api/jobs", JOBS),
    api("/api/news", fetchLiveNews),
    api("/api/units", UNITS)
  ]);

  jobGrid.innerHTML = jobs.map(j => `<article class="card"><span class="badge">${esc(j.type)}</span><h3>${esc(j.title)}</h3><p>${esc(j.company)}</p><div class="meta"><span class="pill">📍 ${esc(j.city)}</span></div>${j.link ? linkTo(j.link, j.cta || "Saiba mais") : ""}</article>`).join("");
  newsGrid.innerHTML = news.map(n => `<article class="card"><span class="card-date">${esc(n.date)}</span><h3>${esc(n.title)}</h3><p>${esc(n.text)}</p>${n.link ? linkTo(n.link, "Ler mais") : ""}</article>`).join("");
  unitGrid.innerHTML = units.map(u => `<article class="card"><span class="card-date">${esc(u.city)}</span><h3>${esc(u.name)}</h3><p>📍 ${esc(u.address)}</p><p>☎ <a class="link" href="tel:${esc(u.phone.replace(/[^\d+]/g, ""))}">${esc(u.phone)}</a></p>${u.link ? linkTo(u.link, "Site") : ""}</article>`).join("");
  reveal();
}

/* ---------- Abas ---------- */
function showTab(name) {
  $$(".tab").forEach(t => { const on = t.dataset.tab === name; t.classList.toggle("on", on); t.setAttribute("aria-selected", on); });
  $$(".panel").forEach(p => p.classList.toggle("on", p.id === "tab-" + name));
  reveal();
}
$$(".tab").forEach(t => t.addEventListener("click", () => showTab(t.dataset.tab)));
$$("[data-tab]:not(.tab)").forEach(a => a.addEventListener("click", () => showTab(a.dataset.tab)));

/* ---------- Filtros e busca ---------- */
$$("#courseChips .chip").forEach(c => c.addEventListener("click", () => {
  $$("#courseChips .chip").forEach(x => x.classList.remove("on"));
  c.classList.add("on");
  currentCat = c.dataset.cat;
  loadCourses($("#courseSearch").value);
}));

function doSearch(q) {
  showTab("presenciais");
  loadCourses(q);
  $("#cursos").scrollIntoView({ behavior: "smooth" });
}
$("#searchBtn").onclick = () => doSearch($("#courseSearch").value);
$("#courseSearch").addEventListener("keydown", e => { if (e.key === "Enter") doSearch(e.target.value); });
$$(".quick button").forEach(b => b.addEventListener("click", () => { $("#courseSearch").value = b.dataset.q; doSearch(b.dataset.q); }));

/* ---------- Pré-visualização das vagas (conteúdo de terceiros: só carrega após a pessoa aceitar) ---------- */
function setEmbed(open) {
  $("#embed").hidden = !open;
  $("#embedBtn").setAttribute("aria-expanded", open);
  $("#embedBtn").textContent = open ? "Ocultar pré-visualização" : "Pré-visualizar aqui";
}
$("#embedBtn").onclick = () => setEmbed($("#embed").hidden);
$("#embedAccept").onclick = () => {
  const frame = $("#embedFrame");
  if (!frame.getAttribute("src")) frame.setAttribute("src", HOTSITE);
  frame.hidden = false;
  $("#embedConsent").hidden = true;
};
$("#embedCancel").onclick = () => setEmbed(false);

/* ---------- Tema, fonte e menu ---------- */
$("#themeBtn").onclick = () => {
  const dark = root.dataset.theme === "dark";
  root.dataset.theme = dark ? "light" : "dark";
  $("#themeBtn").textContent = dark ? "☾" : "☀";
  try { localStorage.setItem("db-theme", root.dataset.theme); } catch {}
};
$("#fontBtn").onclick = () => document.body.classList.toggle("font-large");
$("#menuBtn").onclick = () => {
  const open = $(".nav").classList.toggle("open");
  $("#menuBtn").setAttribute("aria-expanded", open);
};
$$("#mainNav a").forEach(a => a.addEventListener("click", () => {
  $(".nav").classList.remove("open");
  $("#menuBtn").setAttribute("aria-expanded", "false");
}));
$$(".dd-toggle").forEach(btn => btn.addEventListener("click", e => {
  const box = btn.parentElement;
  const open = box.classList.toggle("open");
  btn.setAttribute("aria-expanded", open);
  e.stopPropagation();
}));
document.addEventListener("click", () => $$(".has-dd.open").forEach(b => b.classList.remove("open")));

let savedTheme = null;
try { savedTheme = localStorage.getItem("db-theme"); } catch {}
if (savedTheme) { root.dataset.theme = savedTheme; $("#themeBtn").textContent = savedTheme === "dark" ? "☀" : "☾"; }

/* ---------- Carrossel ---------- */
(function () {
  const slides = $$(".slide"), dots = $("#dots"), hero = $("#inicio");
  let cur = 0, timer;
  slides.forEach((_, i) => {
    const b = document.createElement("button");
    b.setAttribute("aria-label", "Slide " + (i + 1));
    b.onclick = () => { show(i); restart(); };
    dots.appendChild(b);
  });
  function show(i) {
    cur = (i + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle("active", k === cur));
    dots.querySelectorAll("button").forEach((d, k) => d.classList.toggle("on", k === cur));
  }
  function restart() {
    clearInterval(timer);
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) timer = setInterval(() => show(cur + 1), 7000);
  }
  $("#prevSlide").onclick = () => { show(cur - 1); restart(); };
  $("#nextSlide").onclick = () => { show(cur + 1); restart(); };
  hero.addEventListener("mouseenter", () => clearInterval(timer));
  hero.addEventListener("mouseleave", restart);
  let x0 = null;
  hero.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
  hero.addEventListener("touchend", e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) { show(cur + (dx < 0 ? 1 : -1)); restart(); }
    x0 = null;
  });
  show(0); restart();
})();

/* ---------- Contadores ---------- */
(function () {
  const els = $$("[data-count]");
  if (!els.length || !("IntersectionObserver" in window)) return;
  const fmt = (el, n) => el.dataset.plain ? String(n) : n.toLocaleString("pt-BR") + (el.dataset.suffix || "");
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    const el = e.target, end = +el.dataset.count, t0 = performance.now();
    const step = t => {
      const p = Math.min((t - t0) / 1200, 1);
      el.textContent = fmt(el, Math.round(end * p));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }), { threshold: .4 });
  els.forEach(el => io.observe(el));
})();

/* ---------- Rolagem: progresso, cabeçalho, voltar ao topo e destaque do menu ---------- */
(function () {
  const bar = $("#progress"), top = $("#topbar"), btn = $("#toTop");
  const links = [...$$("#mainNav > a[href^='#']:not(.btn)")];
  const map = links.map(a => [a, $(a.getAttribute("href"))]).filter(x => x[1]);
  let ticking = false;
  function update() {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    top.classList.toggle("scrolled", y > 20);
    btn.classList.toggle("show", y > 700);
    let active = null;
    map.forEach(([a, sec]) => { if (sec.getBoundingClientRect().top <= 140) active = a; });
    links.forEach(a => a.classList.toggle("active", a === active));
    ticking = false;
  }
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  btn.onclick = () => scrollTo({ top: 0, behavior: "smooth" });
  update();
})();

/* ---------- Galeria: se a imagem ainda não existir, mostra um retângulo no lugar do ícone quebrado ---------- */
$$(".gallery img").forEach(img => img.addEventListener("error", () => {
  img.style.display = "none";
  const box = document.createElement("div");
  box.style.cssText = "height:230px;display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:.8rem;text-align:center;padding:12px;background:var(--surface2)";
  box.textContent = "Adicione a imagem em " + img.getAttribute("src");
  img.replaceWith(box);
}, { once: true }));

/* ---------- Parceiros (faixa) ---------- */
$("#marquee").innerHTML = [...PARTNERS, ...PARTNERS].map(p => `<span>${esc(p)}</span>`).join("");

/* ---------- Início ---------- */
reveal();
loadCourses().catch(console.error);
loadData().catch(console.error);


/* ---------- App instalável (PWA): registra o service worker em HTTPS ou localhost ---------- */
if ("serviceWorker" in navigator && (location.protocol === "https:" || ["localhost", "127.0.0.1"].includes(location.hostname))) {
  addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}