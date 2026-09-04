# Kart Quiz

Corrida de kart multiplayer no navegador. Um aluno cria a sala, os outros entram com o código,
quem criou dá a largada. 3 voltas numa pista pequena. Passar por uma caixa "?" abre uma pergunta
de controle de qualidade para todo mundo ao mesmo tempo:

- quem acerta primeiro ganha 3 segundos de impulso
- quem erra ou deixa o tempo acabar volta um trecho da pista
- quem acerta mas não foi o primeiro só continua

## Rodar (precisa do Node.js 18 ou mais novo)

```
npm install
npm start
```

O terminal mostra dois endereços. Os alunos abrem no Chrome o endereço "na mesma rede Wi-Fi"
(algo como `http://192.168.0.15:3000`). Todos precisam estar no mesmo Wi-Fi do computador
que está rodando o servidor. Até 8 pilotos por sala.

Se o firewall do Windows perguntar, permita o Node.js em redes privadas.

## Controles

Setas ou WASD. Teclas 1 a 4 respondem a pergunta. Em celular aparecem botões na tela.

## Perguntas

Estão em `questions.js`. Cada uma tem `q` (texto), `options` (4 alternativas) e `answer`
(índice da correta, começando em 0). É só adicionar mais no mesmo formato e reiniciar o servidor.

## Ajustes rápidos (server.js)

- `LAPS` — número de voltas
- `QUESTION_TIME` — segundos para responder (em ms)
- `BOX_RESPAWN` — tempo até a caixa reaparecer

No `public/index.html`, `CTRL` são os pontos que desenham a pista — mova-os para mudar o traçado.

## Colocar na internet (opcional)

Se quiser que funcione fora da sala de aula, o projeto sobe sem alteração em serviços como
Render, Railway ou Glitch: crie um app Node, aponte para este repositório e use `npm start`.
