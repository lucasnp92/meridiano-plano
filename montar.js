'use strict';

// Monta a página do plano do Meridiano (index.html) a partir do plano.json.
// Atualizar: edite o plano.json, rode  node montar.js  e mande:  git add -A && git commit -m "plano: <o que mudou>" && git push
// A página no ar muda em cerca de 1 minuto.

const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const d = JSON.parse(fs.readFileSync(path.join(DIR, 'plano.json'), 'utf8'));
const e = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const NOME_DO_ESTADO = { feito: 'Concluído', andando: 'Em andamento', afazer: 'A fazer' };
const QUANDO = { concluida: 'Concluída', atual: 'Agora', proxima: 'A seguir', depois: 'Depois' };

const ICONE = {
  feito: '<svg class="ic ic-feito" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="8"/><path d="M4.6 8.3l2.2 2.2 4.6-4.9"/></svg>',
  andando: '<svg class="ic ic-andando" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.9"/><path d="M8 1.1a6.9 6.9 0 0 1 0 13.8z"/></svg>',
  afazer: '<svg class="ic ic-afazer" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.9"/></svg>',
};

const BOTAO_DE_TEMA = '<button type="button" class="tema" id="tema" aria-label="Trocar o tema">' +
  '<svg class="t-lua" viewBox="0 0 20 20" aria-hidden="true"><path d="M16.5 12.2A7 7 0 0 1 7.8 3.5a7 7 0 1 0 8.7 8.7z"/></svg>' +
  '<svg class="t-sol" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="3.6"/><path d="M10 2v2.2M10 15.8V18M2 10h2.2M15.8 10H18M4.3 4.3l1.6 1.6M14.1 14.1l1.6 1.6M4.3 15.7l1.6-1.6M14.1 5.9l1.6-1.6"/></svg></button>';

// O botão troca entre claro e escuro e lembra a escolha neste navegador. Sem escolha, segue o sistema.
const SCRIPT_DO_TEMA = '<script>(function(){var r=document.documentElement,b=document.getElementById("tema");' +
  'function atual(){var t=r.getAttribute("data-theme");return t==="dark"||t==="light"?t:(window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light")}' +
  'function pinta(){var e=atual()==="dark";b.setAttribute("aria-label",e?"Tema escuro. Trocar para claro":"Tema claro. Trocar para escuro");b.setAttribute("data-atual",e?"escuro":"claro")}' +
  'try{var s=localStorage.getItem("plano-tema");if(s==="dark"||s==="light")r.setAttribute("data-theme",s)}catch(x){}' +
  'b.addEventListener("click",function(){var n=atual()==="dark"?"light":"dark";r.setAttribute("data-theme",n);try{localStorage.setItem("plano-tema",n)}catch(x){}pinta()});pinta()})();</' + 'script>\n';

function conta(itens) {
  const c = { feito: 0, andando: 0, afazer: 0, total: itens.length };
  itens.forEach((i) => { if (!(i.estado in NOME_DO_ESTADO)) throw new Error('estado desconhecido em ' + i.nome); c[i.estado]++; });
  return c;
}
function barra(c) {
  const p = (n) => (c.total ? (100 * n) / c.total : 0).toFixed(2);
  return '<span class="barra" role="img" aria-label="' + c.feito + ' de ' + c.total + ' concluídos, ' + c.andando + ' em andamento">' +
    '<span class="b-feito" style="width:' + p(c.feito) + '%"></span><span class="b-andando" style="width:' + p(c.andando) + '%"></span></span>';
}
// anel de progresso: concluído cheio, em andamento mais claro
function anel(c, n) {
  const R = 17, L = 2 * Math.PI * R;
  const f = c.total ? c.feito / c.total : 0, a = c.total ? c.andando / c.total : 0;
  return '<svg class="anel" viewBox="0 0 40 40" role="img" aria-label="Fase ' + n + ': ' + c.feito + ' de ' + c.total + ' concluídos">' +
    '<circle class="a-fundo" cx="20" cy="20" r="' + R + '"/>' +
    (f + a > 0 ? '<circle class="a-andando" cx="20" cy="20" r="' + R + '" stroke-dasharray="' + (L * (f + a)).toFixed(2) + ' ' + L.toFixed(2) + '" transform="rotate(-90 20 20)"/>' : '') +
    (f > 0 ? '<circle class="a-feito" cx="20" cy="20" r="' + R + '" stroke-dasharray="' + (L * f).toFixed(2) + ' ' + L.toFixed(2) + '" transform="rotate(-90 20 20)"/>' : '') +
    '<text x="20" y="24.5" text-anchor="middle">' + n + '</text></svg>';
}

const todos = d.fases.reduce((a, f) => a.concat(f.itens), []);
const geral = conta(todos);
const atual = d.fases.find((f) => f.estado === 'atual') || d.fases[0];
const cAtual = conta(atual.itens);

const trilho = d.fases.map((f) => {
  const c = conta(f.itens);
  const cheia = c.total && c.feito === c.total;
  return '<li class="no t-' + f.estado + (cheia ? ' t-cheia' : '') + '"><a href="#fase-' + f.n + '"><span class="bola num">' + f.n + '</span><span class="t-nome">' + e(f.curto) + '</span></a></li>';
}).join('');

const fases = d.fases.map((f) => {
  const c = conta(f.itens);
  const itens = f.itens.map((i) => '<li class="i-' + i.estado + '">' + ICONE[i.estado] + '<span>' + e(i.nome) + '</span><span class="sr">' + NOME_DO_ESTADO[i.estado] + '</span></li>').join('');
  return '<details class="fase f-' + f.estado + '" id="fase-' + f.n + '"' + (f.estado === 'atual' ? ' open' : '') + '>' +
    '<summary>' + anel(c, f.n) +
    '<span class="f-texto"><span class="f-quando">' + QUANDO[f.estado] + '</span><span class="f-nome">' + e(f.nome) + '</span><span class="f-linha">' + e(f.linha) + '</span></span>' +
    '<span class="f-conta"><span class="num"><b>' + c.feito + '</b> de ' + c.total + '</span>' + barra(c) + '</span>' +
    '</summary><ul class="itens">' + itens + '</ul></details>';
}).join('\n');

const diario = d.diario.map((x) => '<li><span class="dia num">' + e(x.dia) + '</span><span>' + e(x.texto) + '</span></li>').join('');

const css = fs.readFileSync(path.join(__dirname, 'plano-a.css'), 'utf8') + '\n' + fs.readFileSync(path.join(__dirname, 'plano-base.css'), 'utf8');

const miolo = '<title>Plano do Meridiano</title>\n' +
  '<meta name="claude:viewport-fit-sides" content="cover">\n' +
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=Urbanist:wght@500;600;700;800&display=swap">\n' +
  '<style>\n' + css + '\n</style>\n' +
  '<div class="pg des-a">\n' +
  '<header class="topo"><p class="marca"><b>Meridiano</b><span>BP Cruzeiros · MRG</span></p>' +
    '<p class="quando">Atualizado em <span class="num">' + e(d.atualizado) + '</span>' + BOTAO_DE_TEMA + '</p></header>\n' +
  '<section class="hero">' +
    '<div class="h-agora"><p class="rot">Agora</p><h1>Fase ' + atual.n + ' · ' + e(atual.nome) + '</h1><p class="h-linha">' + e(atual.linha) + '</p>' +
      '<p class="h-fase"><span class="num"><b>' + cAtual.feito + '</b> de ' + cAtual.total + '</span>' + barra(cAtual) + '</p></div>' +
    '<div class="h-geral"><p class="rot">O plano inteiro</p>' +
      '<ul class="numeros"><li><b class="num">' + geral.feito + '</b><span>concluídas</span></li><li><b class="num">' + geral.andando + '</b><span>em andamento</span></li><li><b class="num">' + geral.afazer + '</b><span>a fazer</span></li></ul>' + barra(geral) + '</div>' +
  '</section>\n' +
  '<nav aria-label="As fases"><ol class="trilho" style="--n:' + d.fases.length + '">' + trilho + '</ol></nav>\n' +
  '<div class="corpo">\n<section class="fases" aria-label="As fases em detalhe">\n' + fases + '\n</section>\n' +
  '<aside class="diario"><h2>Últimas entregas</h2><ul>' + diario + '</ul>' +
    '<p class="legenda"><span>' + ICONE.feito + 'Concluído</span><span>' + ICONE.andando + 'Em andamento</span><span>' + ICONE.afazer + 'A fazer</span></p></aside>\n' +
  '</div>\n</div>\n' + SCRIPT_DO_TEMA;

fs.writeFileSync(path.join(DIR, 'index.html'),
  '<!doctype html>\n<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow"></head><body>\n' + miolo + '</body></html>\n');

console.log('fases:', d.fases.length, '| etapas:', geral.total, '| concluídas:', geral.feito, '| em andamento:', geral.andando, '| a fazer:', geral.afazer, '| diário:', d.diario.length);
