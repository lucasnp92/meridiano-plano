# Plano do Meridiano

Página de acompanhamento do projeto Meridiano: as fases, as etapas de cada uma e o que já foi concluído.

## Como atualizar

1. Edite o `plano.json`. Cada etapa tem `nome` e `estado`: `feito`, `andando` ou `afazer`. Entrega nova entra no começo de `diario`. Mude também o campo `atualizado`.
2. Rode `node montar.js`. Ele refaz o `index.html`.
3. Mande: `git add -A && git commit -m "plano: o que mudou" && git push`.

A página no ar muda em cerca de 1 minuto.

## O que tem aqui

- `plano.json`: a fonte. Só nomes de etapas e estados. Nada de cliente, senha ou chave entra aqui.
- `montar.js`, `plano-a.css`, `plano-base.css`: o gerador e o estilo.
- `index.html`: a página gerada. Não edite à mão.

O campo `f` de cada etapa lista os números das funcionalidades do documento do produto que ela cobre.
