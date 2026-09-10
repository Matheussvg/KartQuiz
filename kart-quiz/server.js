// Kart Quiz — servidor (Node.js + Express + ws)
// Responsável por: salas, retransmitir posições, sortear perguntas e decidir quem ganha o impulso.

const express = require("express");
const http = require("http");
const path = require("path");
const os = require("os");
const { WebSocketServer } = require("ws");
const QUESTIONS = require("./questions");

const PORT = process.env.PORT || 3000;
const LAPS = 5;
const QUESTION_TIME = 12000;       // ms para responder a carta
const QUESTION_INTERVAL = 15000;   // ms entre uma carta e outra
const BOX_RESPAWN = 8000;          // ms até a caixa voltar
const N_BOXES = 9;
const MAX_PLAYERS = 30;
const HIT_TIME = 1300;             // ms que o atingido fica rodando
const COLORS = ["#ff4d4d", "#3d8bff", "#3ac569", "#ffc857", "#b46cff", "#ff8c42", "#2ed3d3", "#ff6bd6"];
// a partir do 9º piloto as cores são geradas girando o matiz, para nunca repetir
function colorFor(n) { if (n < COLORS.length) return COLORS[n]; const h = (n * 137.508) % 360; return `hsl(${h.toFixed(0)}, 85%, ${n % 2 ? 62 : 48}%)`; }

const app = express();
app.use(express.static(path.join(__dirname, "public")));
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const rooms = new Map();   // code -> room
let nextId = 1;

function code4() {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  let c = "";
  do { c = Array.from({ length: 4 }, () => a[Math.floor(Math.random() * a.length)]).join(""); } while (rooms.has(c));
  return c;
}

function send(ws, msg) { if (ws.readyState === 1) ws.send(JSON.stringify(msg)); }
function broadcast(room, msg) { for (const p of room.players.values()) send(p.ws, msg); }

function playerList(room) {
  return [...room.players.values()].map(p => ({
    id: p.id, name: p.name, color: p.color, style: p.style, shieldUntil: p.shieldUntil, iceUntil: p.iceUntil, host: p.id === room.hostId,
    x: p.x, y: p.y, angle: p.angle, lap: p.lap, prog: p.prog, finished: p.finished, rank: p.rank, boost: p.boost, item: p.item, rainbow: !!p.rainbow,
  }));
}

function createRoom(ws, name, style) {
  const room = {
    code: code4(), hostId: null, players: new Map(), state: "lobby",
    boxes: Array.from({ length: N_BOXES }, () => ({ available: true })),
    question: null, usedQuestions: [], finishOrder: [], endTimer: null, cardTimer: null,
    rainbow: false, transition: false,
  };
  rooms.set(room.code, room);
  joinRoom(ws, room, name, true, style);
}

function joinRoom(ws, room, name, isHost, style) {
  const p = {
    id: nextId++, ws, name: (name || "Piloto").slice(0, 16), color: normalizeStyle(style).color, style: normalizeStyle(style), shieldUntil: 0, iceUntil: 0,
    x: 0, y: 0, angle: 0, lap: 1, prog: 0, finished: false, rank: 0, boost: false, item: false, room,
  };
  room.players.set(p.id, p);
  if (isHost) room.hostId = p.id;
  ws.player = p;
  send(ws, { type: "joined", id: p.id, code: room.code, color: p.color, style: p.style, laps: LAPS });
  broadcast(room, { type: "lobby", players: playerList(room), state: room.state });
}

function startRace(room) {
  clearTimeout(room.endTimer); room.endTimer=null; if(room.question) {clearTimeout(room.question.timer);room.question=null;}
  room.round=(room.round||0)+1; room.rainbow=false; room.transition=false;
  room.state = "countdown";
  room.finishOrder = [];
  for (const p of room.players.values()) { p.lap = 1; p.prog = 0; p.finished = false; p.rank = 0; p.boost = false; p.item = false; p.shieldUntil = 0; p.iceUntil = 0; p.rainbow = false; }
  clearInterval(room.cardTimer); room.cardTimer = null;
  for (const b of room.boxes) b.available = true;
  broadcast(room, { type: "countdown", players: playerList(room) });
  setTimeout(() => {
    if (room.state !== "countdown") return;
    room.state = "racing"; broadcast(room, { type: "go" });
    room.cardTimer = setInterval(() => { if (room.state === "racing" && !room.question) openQuestion(room); }, QUESTION_INTERVAL);
  }, 3500);
}

function beginRainbow(room) {
  if (room.rainbow || room.transition) return;
  room.transition = true;
  clearInterval(room.cardTimer); room.cardTimer = null;
  if (room.question) closeQuestion(room);
  broadcast(room, { type: "rainbow_warning", text: "Quarta volta" });
  setTimeout(() => {
    if (room.state !== "racing") return;
    room.rainbow = true; room.transition = false;
    broadcast(room, { type: "rainbow_start" });
    room.cardTimer = setInterval(() => { if (room.state === "racing" && room.rainbow && !room.question) openQuestion(room); }, QUESTION_INTERVAL);
  }, 5200);
}

function pickQuestion(room) {
  let pool = QUESTIONS.map((_, i) => i).filter(i => !room.usedQuestions.includes(i));
  if (pool.length === 0) { room.usedQuestions = []; pool = QUESTIONS.map((_, i) => i); }
  const i = pool[Math.floor(Math.random() * pool.length)];
  room.usedQuestions.push(i);
  return QUESTIONS[i];
}

function openQuestion(room) {
  const q = pickQuestion(room);
  room.question = { q, answers: new Map(), deadline: Date.now() + QUESTION_TIME, timer: null };
  broadcast(room, { type: "question", text: q.q, options: q.options, deadline: room.question.deadline });
  room.question.timer = setTimeout(() => closeQuestion(room), QUESTION_TIME + 300);
}

function closeQuestion(room) {
  const qs = room.question;
  if (!qs) return;
  clearTimeout(qs.timer);
  room.question = null;
  broadcast(room, { type: "question_end", correct: qs.q.options[qs.q.answer] });
}

const POWERS = ['lightning', 'shield', 'ice', 'pulse'];
function normalizeStyle(v) {
  v=v && typeof v==='object'?v:{};
  return {character:['driver','monkey','turtle','rabbit'].includes(v.character)?v.character:'driver',color:/^#[0-9a-f]{6}$/i.test(v.color)?v.color:'#ff4d64', body:['sport','buggy','classic','italian','monster','formula'].includes(v.body)?v.body:'sport', wheels:['standard','wide','offroad','monster','neon','retro'].includes(v.wheels)?v.wheels:'standard', wing:['none','sport','double'].includes(v.wing)?v.wing:'sport'};
}
function useItem(room,p) {
  if(!p.item || room.state!=='racing' || p.finished) return;
  const power=p.item; p.item=false;
  const now=Date.now();
  if(power==='shield') {
    p.shieldUntil=now+8000;
    broadcast(room,{type:'power',power,id:p.id,x:p.x,y:p.y,until:p.shieldUntil}); return;
  }
  const score=x=>x.lap*100000+x.prog;
  let targets=[...room.players.values()].filter(x=>x!==p&&!x.finished);
  if(power==='pulse') targets=targets.filter(x=>Math.hypot(x.x-p.x,x.y-p.y)<=180);
  else targets=targets.filter(x=>score(x)>score(p)).sort((a,b)=>score(a)-score(b)).slice(0,1);
  broadcast(room,{type:'power',power,id:p.id,x:p.x,y:p.y,targets:targets.map(x=>({id:x.id,x:x.x,y:x.y}))});
  if(!targets.length) return send(p.ws,{type:'item_miss'});
  for(const target of targets) {
    if(target.shieldUntil>now) {target.shieldUntil=0;broadcast(room,{type:'blocked',id:target.id,x:target.x,y:target.y});continue;}
    if(power==='ice') {target.iceUntil=now+3000;broadcast(room,{type:'iced',id:target.id,until:target.iceUntil});}
    else broadcast(room,{type:'hit',id:target.id,name:target.name,by:p.name,duration:power==='pulse'?800:HIT_TIME});
  }
}

function handleFinish(room, p) {
  if (p.finished) return;
  p.finished = true;
  room.finishOrder.push(p.id);
  p.rank = room.finishOrder.length;
  broadcast(room, { type: "finished", id: p.id, name: p.name, rank: p.rank });
  const racing = [...room.players.values()].filter(x => !x.finished);
  if (racing.length === 0) endRace(room);
  else if (!room.endTimer) room.endTimer = setTimeout(() => endRace(room), 40000);
}

function endRace(room) {
  if (room.state === "results") return;
  clearTimeout(room.endTimer); room.endTimer = null;
  clearInterval(room.cardTimer); room.cardTimer = null;
  if (room.question) closeQuestion(room);
  room.state = "results";
  const ranked = [...room.players.values()].sort((a, b) => {
    if (a.finished && b.finished) return a.rank - b.rank;
    if (a.finished) return -1; if (b.finished) return 1;
    return (b.lap * 10000 + b.prog) - (a.lap * 10000 + a.prog);
  }).map((p, i) => ({ id: p.id, name: p.name, color: p.color, rank: i + 1, finished: p.finished }));
  broadcast(room, { type: "results", ranking: ranked });
}

wss.on("connection", ws => {
  ws.on("message", raw => {
    let m; try { m = JSON.parse(raw); } catch { return; }
    if(!m || typeof m!=='object') return;
    const p = ws.player; const room = p && p.room;

    if (m.type === "create" && !p) return createRoom(ws, typeof m.name === "string" ? m.name : "Piloto", m.style);
    if (m.type === "join") {
      if(p || typeof m.code!=="string") return;
      const r = rooms.get((m.code || "").toUpperCase().trim());
      if (!r) return send(ws, { type: "error", text: "Sala não encontrada. Confere o código com quem criou." });
      if (r.state !== "lobby") return send(ws, { type: "error", text: "Essa corrida já começou. Peça pra criarem outra sala." });
      if (r.players.size >= MAX_PLAYERS) return send(ws, { type: "error", text: `Sala cheia (máximo ${MAX_PLAYERS} pilotos).` });
      return joinRoom(ws, r, typeof m.name === "string" ? m.name : "Piloto", false, m.style);
    }
    if (!room) return;
    if(m.type==='customize' && room.state==='lobby') {p.style=normalizeStyle(m.style);p.color=p.style.color;send(ws,{type:'customized',style:p.style,color:p.color});broadcast(room,{type:'lobby',players:playerList(room),state:room.state});return;}

    if (m.type === "start" && p.id === room.hostId && (room.state === "lobby" || room.state === "results")) return startRace(room);

    if (m.type === "pos") {
      if(room.state!=="racing" || p.finished || ![m.x,m.y,m.angle,m.prog,m.lap].every(Number.isFinite) || !Number.isInteger(m.lap) || m.lap<1 || m.lap>LAPS+1) return;
      p.x = m.x; p.y = m.y; p.angle = m.angle; p.prog = m.prog; p.boost = false; p.rainbow = !!m.rainbow;
      if (!room.rainbow && p.lap >= 4) beginRainbow(room);
      if (m.lap !== p.lap) { p.lap = m.lap; if (p.lap > LAPS) handleFinish(room, p); }
      return;
    }

    if (m.type === "pickup" && room.state === "racing" && !p.finished) {
      const b = room.boxes[m.idx];
      if (!b || !b.available || p.item) return;
      b.available = false; p.item = POWERS[Math.floor(Math.random()*POWERS.length)];
      broadcast(room, { type: "box", idx: m.idx, available: false });
      send(ws, { type: "item", power:p.item });
      const round=room.round; setTimeout(() => { if(room.round!==round || room.state!=="racing") return; b.available = true; broadcast(room, { type: "box", idx: m.idx, available: true }); }, BOX_RESPAWN);
      return;
    }

    if (m.type === "use_item") return useItem(room, p);

    if (m.type === "answer" && room.question && !p.finished) {
      const qs = room.question;
      if (qs.answers.has(p.id) || Date.now()>qs.deadline || !Number.isInteger(m.idx) || m.idx<0 || m.idx>=qs.q.options.length) return;
      const ok = m.idx === qs.q.answer;
      qs.answers.set(p.id, ok);
      send(ws, { type: "answer_result", ok, correct: qs.q.options[qs.q.answer] });
      return;
    }

    if (m.type === "back_to_lobby" && p.id === room.hostId && room.state === "results") {
      room.state = "lobby";
      clearInterval(room.cardTimer); room.cardTimer = null;
      for (const x of room.players.values()) { x.lap = 1; x.prog = 0; x.finished = false; x.rank = 0; }
      broadcast(room, { type: "lobby", players: playerList(room), state: "lobby" });
    }
  });

  ws.on("close", () => {
    const p = ws.player; if (!p) return;
    const room = p.room;
    room.players.delete(p.id);
    if (room.players.size === 0) { room.state="closed"; if(room.question) clearTimeout(room.question.timer); clearTimeout(room.endTimer); clearInterval(room.cardTimer); rooms.delete(room.code); return; }
    if (room.hostId === p.id) room.hostId = room.players.keys().next().value;
    broadcast(room, { type: "lobby", players: playerList(room), state: room.state, left: p.name });
  });
});

// Snapshot de posições 20x por segundo
setInterval(() => {
  for (const room of rooms.values()) {
    if (room.state !== "racing" && room.state !== "countdown") continue;
    broadcast(room, { type: "snap", players: playerList(room), state: room.state });
  }
}, 50);

server.listen(PORT, () => {
  const nets = os.networkInterfaces();
  const ips = Object.values(nets).flat().filter(n => n && n.family === "IPv4" && !n.internal).map(n => n.address);
  console.log(`\nKart Quiz rodando!`);
  console.log(`  Neste computador:  http://localhost:${PORT}`);
  for (const ip of ips) console.log(`  Na mesma rede Wi-Fi: http://${ip}:${PORT}`);
  console.log();
});
