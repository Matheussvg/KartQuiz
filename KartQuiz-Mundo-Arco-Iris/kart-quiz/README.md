# Kart Quiz — garagem e poderes (v7)

Base: versão 4 enviada pelo usuário. A pista, as perguntas, a direção e as regras do quiz foram preservadas.

## Regras
- 5 voltas e até 30 jogadores por sala.
- Perguntas a cada 15 segundos, com 12 segundos para responder.
- O kart para durante a pergunta. Acerto permite continuar; erro ou tempo esgotado faz voltar um trecho.
- Sem turbo, drift ou piloto automático.
- Encostar na barreira não reduz a velocidade nem produz efeitos de batida. O limite mantém o kart dentro da pista e alinha suavemente a direção.

## Garagem
Clique em Personalizar meu kart no menu ou na sala de espera. Escolha pintura, personagem (piloto original, macaco, tartaruga ou coelho), carroceria (esportivo, buggy, clássico, supercarro italiano inspirado em Ferrari, caminhão monstro ou Fórmula), rodas (pista, largas, todo-terreno, Monster, neon ou retrô) e aerofólio (nenhum, esportivo ou duplo). Salve para aplicar.

A prévia é 3D, as escolhas ficam salvas neste navegador quando o armazenamento está disponível e os outros participantes veem o mesmo kart. Todas as peças são cosméticas, sem diferenças de desempenho. As alterações são permitidas antes da largada.

## Caixas prismáticas e poderes
As caixas flutuam e giram, com seis faces coloridas em gradiente prismático. Cada coleta sorteia um dos quatro poderes com chances iguais. Um poder por vez; a caixa reaparece após 8 segundos.

| Poder | Efeito | Visual |
|---|---|---|
| Raio | Derruba por 1,3s o piloto imediatamente à frente na classificação | Clarão no kart que dispara, raio em movimento até o alvo, descarga vertical e faíscas |
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
Testes passaram para as 432 combinações de personagem e peças, os quatro efeitos visuais e sua limpeza, bloqueio do escudo, alcance da onda, gelo, raio, sincronização da personalização, coleta aleatória, reinício e regras originais do quiz. Integração verificada com dois clientes WebSocket locais. Garagem e corrida inspecionadas no navegador.

Ainda não houve teste de carga com 30 jogadores nem teste em celular físico. O servidor continua recebendo posições calculadas pelo cliente, como na versão original. Esta entrega não publica automaticamente no Render.

## Ajuste 6.1
Pista 30% mais longa e cerca de 23% mais larga. Limite lateral considera o kart inteiro e usa projeção no segmento da pista, sem redução de velocidade. Demais regras, garagem e poderes preservados.

## Garagem ampliada — v7
Seis carrocerias, seis rodas, quatro personagens e três aerofólios: 432 combinações, além da pintura livre. Os personagens são modelos cartunescos próprios. O esportivo italiano é uma interpretação estilizada, sem emblemas. O caminhão monstro tem chassi elevado; o Fórmula tem bico e asas próprios. As peças e personagens não mudam o desempenho.

O disparo de raio mostra clarão na origem e um trajeto elétrico que avança até o alvo. Sem alvo, ainda aparece um disparo visual para a frente. A duração e as regras do poder continuam iguais. A pista ampliada e a correção das barreiras da versão 6.1 foram mantidas.


## Correção da ponte arco-íris
A ponte usa uma malha contínua tubular com 270 unidades de largura, eliminando lâminas triangulares esticadas. Sete linhas neon acompanham a superfície, as barreiras ficam nas bordas e a travessia é necessária antes da chegada.


## Transição visual ajustada
O aviso inicial diz apenas “Quarta volta”. Depois os jogadores ficam parados na pista original enquanto a ponte arco-íris sobe à frente por 4,2 segundos. O acesso direito fica fechado com um portão luminoso e uma placa indica a subida pela esquerda. Ao final da animação, os karts entram na ponte com suas barreiras e o novo mapa estrelado.


## Ajuste após teste de vídeo
O mapa arco-íris agora é ancorado dinamicamente na frente do kart que chega à quarta volta. Isso evita que a ponte apareça atrás ou fora da câmera. Durante o aviso, o jogador continua na pista original; a ponte é criada à frente e sobe do subsolo. Depois da subida, o kart entra no primeiro ponto da ponte, sem concluir a corrida fora dela.


## Ponte arco-íris jogável
A ponte deixou de conduzir o kart automaticamente. O jogador controla aceleração, ré e direção com WASD ou setas, enquanto a câmera acompanha o traçado. O limite das barreiras usa a mesma largura útil da pista normal; o contato com fantasmas reduz a velocidade por um instante. A chegada só é enviada no último segmento.


## Mapa novo arco-íris
A fase final agora é uma pista plana independente, com 270 unidades de largura, exatamente igual à pista original. O estilo muda apenas na apresentação: sete faixas neon, barreiras ciano suaves, céu estrelado e fantasmas. A malha acompanha a curva com normais próprias, sem triângulos esticados. O controle continua manual com WASD/setas.
