// Kart Quiz — servidor (Node.js + Express + ws)
// Responsável por: salas, retransmitir posições, sortear perguntas e decidir quem ganha o impulso.

const express = require("express");
const http = require("http");
const path = require("path");
const os = require("os");
const { WebSocketServer } = require("ws");
const QUESTIONS = require("./questions");

const PORT = process.env.PORT || 3000;
const LAPS = 3;
const QUESTION_TIME = 12000;   // ms para responder
const BOX_RESPAWN = 8000;      // ms até a caixa voltar
const N_BOXES = 3;
const COLORS = ["#ff4d4d", "#3d8bff", "#3ac569", "#ffc857", "#b46cff", "#ff8c42", "#2ed3d3", "#ff6bd6"];

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
    id: p.id, name: p.name, color: p.color, host: p.id === room.hostId,
    x: p.x, y: p.y, angle: p.angle, lap: p.lap, prog: p.prog, finished: p.finished, rank: p.rank, boost: p.boost,
  }));
}

function createRoom(ws, name) {
  const room = {
    code: code4(), hostId: null, players: new Map(), state: "lobby",
    boxes: Array.from({ length: N_BOXES }, () => ({ available: true })),
    question: null, usedQuestions: [], finishOrder: [], endTimer: null,
  };
  rooms.set(room.code, room);
  joinRoom(ws, room, name, true);
}

function joinRoom(ws, room, name, isHost) {
  const p = {
    id: nextId++, ws, name: (name || "Piloto").slice(0, 16), color: COLORS[room.players.size % COLORS.length],
    x: 0, y: 0, angle: 0, lap: 1, prog: 0, finished: false, rank: 0, boost: false, room,
  };
  room.players.set(p.id, p);
  if (isHost) room.hostId = p.id;
  ws.player = p;
  send(ws, { type: "joined", id: p.id, code: room.code, color: p.color, laps: LAPS });
  broadcast(room, { type: "lobby", players: playerList(room), state: room.state });
}

function startRace(room) {
  room.state = "countdown";
  room.finishOrder = [];
  for (const p of room.players.values()) { p.lap = 1; p.prog = 0; p.finished = false; p.rank = 0; p.boost = false; }
  for (const b of room.boxes) b.available = true;
  broadcast(room, { type: "countdown", players: playerList(room) });
  setTimeout(() => { if (room.state === "countdown") { room.state = "racing"; broadcast(room, { type: "go" }); } }, 3500);
}

function pickQuestion(room) {
  let pool = QUESTIONS.map((_, i) => i).filter(i => !room.usedQuestions.includes(i));
  if (pool.length === 0) { room.usedQuestions = []; pool = QUESTIONS.map((_, i) => i); }
  const i = pool[Math.floor(Math.random() * pool.length)];
  room.usedQuestions.push(i);
  return QUESTIONS[i];
}

function openQuestion(room, trigger, boxIdx) {
  const q = pickQuestion(room);
  room.state = "question";
  room.question = { q, winnerId: null, answers: new Map(), deadline: Date.now() + QUESTION_TIME, timer: null };
  room.boxes[boxIdx].available = false;
  setTimeout(() => { room.boxes[boxIdx].available = true; broadcast(room, { type: "box", idx: boxIdx, available: true }); }, BOX_RESPAWN);
  broadcast(room, { type: "box", idx: boxIdx, available: false });
  broadcast(room, {
    type: "question", trigger: trigger.name, text: q.q, options: q.options, deadline: room.question.deadline,
  });
  room.question.timer = setTimeout(() => closeQuestion(room), QUESTION_TIME + 300);
}

function closeQuestion(room) {
  const qs = room.question;
  if (!qs) return;
  clearTimeout(qs.timer);
  room.question = null;
  room.state = "racing";
  const results = {};
  for (const p of room.players.values()) {
    if (p.finished) continue;
    const a = qs.answers.get(p.id);
    results[p.id] = a === undefined ? "none" : (a ? "right" : "wrong");
  }
  const winner = qs.winnerId ? room.players.get(qs.winnerId) : null;
  broadcast(room, {
    type: "question_end", winnerId: qs.winnerId, winnerName: winner ? winner.name : null,
    correct: qs.q.options[qs.q.answer], results,
  });
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
    const p = ws.player; const room = p && p.room;

    if (m.type === "create") return createRoom(ws, m.name);
    if (m.type === "join") {
      const r = rooms.get((m.code || "").toUpperCase().trim());
      if (!r) return send(ws, { type: "error", text: "Sala não encontrada. Confere o código com quem criou." });
      if (r.state !== "lobby") return send(ws, { type: "error", text: "Essa corrida já começou. Peça pra criarem outra sala." });
      if (r.players.size >= COLORS.length) return send(ws, { type: "error", text: "Sala cheia (máximo 8 pilotos)." });
      return joinRoom(ws, r, m.name, false);
    }
    if (!room) return;

    if (m.type === "start" && p.id === room.hostId && (room.state === "lobby" || room.state === "results")) return startRace(room);

    if (m.type === "pos") {
      p.x = m.x; p.y = m.y; p.angle = m.angle; p.prog = m.prog; p.boost = !!m.boost;
      if (m.lap !== p.lap) { p.lap = m.lap; if (p.lap > LAPS) handleFinish(room, p); }
      return;
    }

    if (m.type === "pickup" && room.state === "racing" && !p.finished) {
      const b = room.boxes[m.idx];
      if (b && b.available) openQuestion(room, p, m.idx);
      return;
    }

    if (m.type === "answer" && room.question && !p.finished) {
      const qs = room.question;
      if (qs.answers.has(p.id)) return;
      const ok = m.idx === qs.q.answer;
      qs.answers.set(p.id, ok);
      if (ok && !qs.winnerId) { qs.winnerId = p.id; broadcast(room, { type: "first_correct", id: p.id, name: p.name }); }
      send(ws, { type: "answer_result", ok });
      const alive = [...room.players.values()].filter(x => !x.finished).length;
      if (qs.answers.size >= alive) closeQuestion(room);
      return;
    }

    if (m.type === "back_to_lobby" && p.id === room.hostId) {
      room.state = "lobby";
      for (const x of room.players.values()) { x.lap = 1; x.prog = 0; x.finished = false; x.rank = 0; }
      broadcast(room, { type: "lobby", players: playerList(room), state: "lobby" });
    }
  });

  ws.on("close", () => {
    const p = ws.player; if (!p) return;
    const room = p.room;
    room.players.delete(p.id);
    if (room.players.size === 0) { clearTimeout(room.endTimer); rooms.delete(room.code); return; }
    if (room.hostId === p.id) room.hostId = room.players.keys().next().value;
    broadcast(room, { type: "lobby", players: playerList(room), state: room.state, left: p.name });
    if (room.question) {
      const alive = [...room.players.values()].filter(x => !x.finished).length;
      if (room.question.answers.size >= alive) closeQuestion(room);
    }
  });
});

// Snapshot de posições 20x por segundo
setInterval(() => {
  for (const room of rooms.values()) {
    if (room.state !== "racing" && room.state !== "question" && room.state !== "countdown") continue;
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
