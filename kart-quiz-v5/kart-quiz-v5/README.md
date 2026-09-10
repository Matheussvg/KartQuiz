# Kart Quiz — versão 5

Corrida 3D com perguntas de controle de qualidade. Mantém as salas multiplayer, 5 voltas, até 30 participantes e o banco de perguntas original.

## O que mudou
- Interface em azul escuro e verde-lima, velocímetro e medidor de drift.
- Direção suavizada, inércia nas curvas e drift: segure Shift enquanto vira e solte após carregar para ganhar turbo.
- Faíscas no drift e nas colisões, partículas e câmera mais aberta no turbo.
- Karts com aerofólio, para-choque, carenagens laterais e viseira.
- Cenário com montanhas, nuvens, placas e iluminação ajustada.
- Piloto automático durante as perguntas. Acerto dá 3 segundos de turbo após fechar a carta; erro ou tempo esgotado reduz a velocidade por 3 segundos após o aviso, sem teletransporte.
- Tecla R reposiciona na pista sem avançar o progresso.
- Botão de drift para telas sensíveis ao toque e limpeza das teclas ao perder foco.
- Aviso de conexão perdida visível durante a corrida.
- Three.js incluído em public/vendor com a licença original. As fontes usam fallback do sistema se o Google Fonts não carregar.

## Executar
Instale Node.js com npm, abra esta pasta no terminal e execute:

```sh
npm ci
npm start
```

Abra http://localhost:3000. Crie uma sala para jogar sozinho ou compartilhe o código com outros participantes. Não há bots nesta versão.

## Publicar no seu Render
Substitua os arquivos do repositório ligado ao seu serviço pelos arquivos desta pasta. Inclua public/vendor e package-lock.json. Não envie node_modules.

Use o comando de build `npm ci` e o comando de início `npm start`. O servidor utiliza a porta informada pelo Render. Para hospedar tudo no Render, mantenha `const SERVER = ""` em public/index.html.

O ZIP está pronto para substituir o projeto, mas esta entrega não altera automaticamente o site publicado.

## Controles
- WASD ou setas: acelerar, frear/ré e virar.
- Shift + curva: carregar drift; solte Shift para ganhar turbo quando o medidor indicar.
- Espaço: usar raio contra o próximo piloto à frente.
- R: recuperar o kart no centro da pista.
- 1–4 ou clique/toque: responder ao quiz.
- Celular: botões na tela, incluindo ↝ para drift.

## Perguntas e ajustes
Edite questions.js mantendo q, options e answer (índice de 0 a 3). Em server.js, LAPS controla as voltas, QUESTION_INTERVAL o intervalo entre perguntas e QUESTION_TIME o prazo para resposta.

## Verificação desta entrega
- Testes de movimento: piloto automático completando uma volta, limites da pista, carga e liberação de drift, penalidade e bloqueio na contagem regressiva.
- Teste local com dois clientes: criar/entrar na sala, largada, item, raio, pergunta, resposta, resultados e reinício.
- Inspeção no navegador em 1280 × 720 e 390 × 844. Sem erros de console na sessão inspecionada.

Ainda é necessário testar desempenho em celulares físicos e uma sala com 30 pessoas. O modelo original de posições informadas pelo cliente foi mantido: não é um servidor de física autoritativo nem um sistema antitrapaça.
