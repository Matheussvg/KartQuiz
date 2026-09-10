# Kart Quiz — garagem e poderes (v6)

Base: versão 4 enviada pelo usuário. A pista, as perguntas, a direção e as regras do quiz foram preservadas.

## Regras
- 5 voltas e até 30 jogadores por sala.
- Perguntas a cada 15 segundos, com 12 segundos para responder.
- O kart para durante a pergunta. Acerto permite continuar; erro ou tempo esgotado faz voltar um trecho.
- Sem turbo, drift ou piloto automático.
- Encostar na barreira não reduz a velocidade nem produz efeitos de batida. O limite mantém o kart dentro da pista e alinha suavemente a direção.

## Garagem
Clique em Personalizar meu kart no menu ou na sala de espera. Escolha pintura, carroceria (esportivo, buggy ou clássico), rodas (pista, largas ou todo-terreno) e aerofólio (nenhum, esportivo ou duplo). Salve para aplicar.

A prévia é 3D, as escolhas ficam salvas neste navegador quando o armazenamento está disponível e os outros participantes veem o mesmo kart. Todas as peças são cosméticas, sem diferenças de desempenho. As alterações são permitidas antes da largada.

## Caixas prismáticas e poderes
As caixas flutuam e giram, com seis faces coloridas em gradiente prismático. Cada coleta sorteia um dos quatro poderes com chances iguais. Um poder por vez; a caixa reaparece após 8 segundos.

| Poder | Efeito | Visual |
|---|---|---|
| Raio | Derruba por 1,3s o piloto imediatamente à frente na classificação | Raio vertical e faíscas |
| Escudo | Bloqueia um ataque durante até 8s; desaparece ao bloquear | Bolha azul translúcida e partículas |
| Gelo | Reduz por 3s a velocidade máxima do piloto imediatamente à frente | Projétil azul e cristais ao redor do kart |
| Onda de choque | Faz girar por 0,8s os adversários num raio de 180 unidades | Anel rosa que se expande |

Os poderes não alteram as penalidades do quiz. Raio e gelo escolhem o alvo pela posição na corrida; a onda usa a distância na pista. O poder é consumido mesmo sem alvo, com aviso na tela.

## Controles
WASD ou setas para dirigir. Espaço para usar o poder. Teclas 1–4 para responder. Em telas de toque, use os botões da pista e do poder.

## Render: substituir a versão antiga
O ZIP contém a pasta **kart-quiz**. No GitHub, substitua o conteúdo da pasta antiga **kart-quiz** pelos arquivos desta entrega. Inclua todos os arquivos de public, inclusive kart.js, garage.js e vendor.

No serviço existente do Render, use:
- Root Directory: `kart-quiz`
- Build Command: `npm ci`
- Start Command: `npm start`

Se você havia alterado Root Directory para kart-quiz-v5, volte para kart-quiz. Publique o commit atualizado. Não envie node_modules. Não é necessário criar outro serviço nem mudar o endereço do jogo.

Para testar no computador, abra esta pasta no terminal e execute `npm ci` e `npm start`. Acesse http://localhost:3000. A biblioteca Three.js acompanha o projeto com sua licença.

## Verificações
Testes passaram para as 27 combinações de peças, os quatro efeitos visuais e sua limpeza, bloqueio do escudo, alcance da onda, gelo, raio, sincronização da personalização, coleta aleatória, reinício e regras originais do quiz. Integração verificada com dois clientes WebSocket locais. Garagem e corrida inspecionadas no navegador.

Ainda não houve teste de carga com 30 jogadores nem teste em celular físico. O servidor continua recebendo posições calculadas pelo cliente, como na versão original. Esta entrega não publica automaticamente no Render.
