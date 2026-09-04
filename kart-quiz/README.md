# Kart Quiz

Corrida de kart 3D multiplayer no navegador. Um aluno cria a sala, os outros entram com o
código, quem criou dá a largada. Todos largam juntos em grid de 2 colunas. 5 voltas, pista larga
com barreiras nas laterais.

- **Caixa "?"** dá um raio. Espaço (ou o botão ⚡ no celular) derruba quem está imediatamente
  na sua frente — o kart dele roda e fica parado ~1 segundo. Só dá para carregar um raio por vez.
- **Carta de pergunta** (ás de espadas) aparece na tela de todos a cada 15 segundos de corrida.
  Enquanto a carta está aberta o kart fica parado. Acertou, a carta some na hora e você segue.
  Errou ou deixou os 12 segundos passarem, volta um trecho da pista.

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
- `QUESTION_INTERVAL` — intervalo entre cartas (em ms)
- `QUESTION_TIME` — tempo para responder a carta (em ms)
- `BOX_RESPAWN` — tempo até a caixa reaparecer
- `HIT_TIME` — quanto tempo o derrubado fica rodando

No `public/index.html`: `SCALE` muda o tamanho da pista, `HALF` a largura, `CTRL` são os pontos
que desenham o traçado. Os números `90` e `46` em `camGoal` são distância e altura da câmera.

## Publicar (Netlify + Render)

O Netlify só hospeda a parte estática (o jogo). O servidor precisa rodar em outro lugar.

1. Suba o projeto no GitHub.
2. **Render** (render.com): New → Web Service → conecte o repositório. Build: `npm install`.
   Start: `npm start`. Plano Free. Anote o endereço, tipo `kart-quiz.onrender.com`.
3. Abra `public/index.html` e preencha `const SERVER = "kart-quiz.onrender.com";` (sem https://).
4. **Netlify**: New site → mesmo repositório. O `netlify.toml` já aponta para a pasta `public`.
5. Compartilhe o link do Netlify com os alunos.

No plano grátis do Render o servidor dorme após 15 min parado e leva ~40 s para acordar.
Abra o link uns minutos antes da aula.
