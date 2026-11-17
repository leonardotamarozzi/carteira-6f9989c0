// Rodar: node --test tests/   (só node:test nativo, sem dependências)
// Todos os arquivos usados aqui são bytes fictícios gerados em código ("EXEMPLO").
const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../lib.js');

// "Arquivo" de EXEMPLO: bytes fictícios, não é documento real.
const exampleBytes = (n, seed = 7) => {
  const b = new Uint8Array(n);
  for (let i = 0; i < n; i++) b[i] = (i * 31 + seed) & 255;
  return b;
};
const EXEMPLO = new TextEncoder().encode('EXEMPLO');

test('Horizontal: imagem retrato gira 90° automaticamente', () => {
  assert.equal(L.autoRotation('h', 600, 900), 90);
  assert.equal(L.effectiveRotation('h', 600, 900, 0), 90);
  const box = L.fitBox(390, 600, 900, 90);
  // Depois do giro, a largura visível (altura do elemento) ocupa a tela toda.
  assert.equal(box.elH, 390);
  assert.equal(box.boxH, 260); // 390 * 600 / 900: fica deitado (mais largo que alto)
});

test('Horizontal: imagem paisagem não gira; Vertical nunca gira', () => {
  assert.equal(L.autoRotation('h', 900, 600), 0);
  assert.equal(L.autoRotation('v', 600, 900), 0);
  assert.equal(L.effectiveRotation('v', 600, 900, 0), 0);
  assert.equal(L.fitBox(390, 600, 900, 0).elW, 390);
});

test('botão Girar soma 90° e volta a 0 depois de 360°', () => {
  assert.equal(L.effectiveRotation('v', 600, 900, 90), 90);
  assert.equal(L.effectiveRotation('h', 600, 900, 270), 0);
  assert.equal(L.normRot(450), 90);
  assert.equal(L.normRot(-90), 270);
});

test('arquivo original inalterado: mesmo SHA-256 antes e depois de salvar, exibir e girar', async () => {
  const bytes = new Uint8Array([...EXEMPLO, ...exampleBytes(200000)]);
  const before = await L.sha256Hex(bytes);
  const blob = new Blob([bytes], { type: 'image/png' });
  const doc = { id: 'exemplo', nome: 'EXEMPLO', orient: 'h', rot: 0, front: blob, back: null, qr: null };
  // "exibir" e "girar": só calculam a transformação, não tocam no arquivo.
  L.effectiveRotation(doc.orient, 600, 900, doc.rot);
  doc.rot = L.normRot(doc.rot + 90);
  L.fitBox(390, 600, 900, L.effectiveRotation(doc.orient, 600, 900, doc.rot));
  // "salvar": ida e volta pelo formato do backup.
  const back = L.decodeDoc(JSON.parse(JSON.stringify(await L.encodeDoc(doc))));
  const after = await L.sha256Hex(new Uint8Array(await back.front.arrayBuffer()));
  assert.equal(after, before);
  assert.equal(await L.sha256Hex(new Uint8Array(await doc.front.arrayBuffer())), before);
  assert.equal(back.front.type, 'image/png');
});

test('cronômetro 60→0, desfoca em 0 e reinicia em 60 (relógio simulado)', () => {
  let now = 1_000_000;
  let started = now;
  let s = L.qrState(started, now);
  assert.equal(s.remaining, 60);
  assert.equal(L.fmtTimer(s.remaining), '01 : 00');
  assert.equal(s.blurred, false);

  now += 1000;
  s = L.qrState(started, now);
  assert.equal(L.fmtTimer(s.remaining), '00 : 59');

  now += 58_000;
  s = L.qrState(started, now);
  assert.equal(L.fmtTimer(s.remaining), '00 : 01');
  assert.equal(s.blurred, false);

  now += 1000;
  s = L.qrState(started, now);
  assert.equal(L.fmtTimer(s.remaining), '00 : 00');
  assert.equal(s.blurred, true);
  assert.equal(s.progress, 0);

  now += 30_000; // continua parado em 0
  assert.equal(L.qrState(started, now).remaining, 0);

  started = now; // "Tocar para mostrar de novo"
  s = L.qrState(started, now);
  assert.equal(s.remaining, 60);
  assert.equal(s.blurred, false);
  assert.equal(s.progress, 1);
});

test('QR Code: backup guarda e devolve os mesmos bytes anexados', async () => {
  const qrBytes = new Uint8Array([...EXEMPLO, ...exampleBytes(5000, 3)]);
  const doc = { id: 'q', nome: 'EXEMPLO', front: null, back: null, qr: new Blob([qrBytes], { type: 'image/png' }) };
  const back = L.decodeDoc(JSON.parse(JSON.stringify(await L.encodeDoc(doc))));
  assert.equal(await L.sha256Hex(new Uint8Array(await back.qr.arrayBuffer())), await L.sha256Hex(qrBytes));
});

test('backup: PDF de 3 MB volta com bytes idênticos', async () => {
  const pdf = new Uint8Array([...new TextEncoder().encode('%PDF-1.4 EXEMPLO\n'), ...exampleBytes(3 * 1024 * 1024)]);
  const doc = { id: 'p', nome: 'EXEMPLO', front: new Blob([pdf], { type: 'application/pdf' }), back: null, qr: null };
  const json = JSON.stringify(await L.encodeDoc(doc));
  const back = L.decodeDoc(JSON.parse(json));
  assert.equal(await L.sha256Hex(new Uint8Array(await back.front.arrayBuffer())), await L.sha256Hex(pdf));
  assert.equal(back.back, null);
});

test('arquivos aceitos: tipos e limite de 15 MB', () => {
  assert.equal(L.checkFile({ type: 'image/jpeg', size: 1000 }, 'doc'), null);
  assert.equal(L.checkFile({ type: 'application/pdf', size: L.MAX_FILE }, 'doc'), null);
  assert.match(L.checkFile({ type: 'application/pdf', size: L.MAX_FILE + 1 }, 'doc'), /15 MB/);
  assert.match(L.checkFile({ type: 'image/gif', size: 10 }, 'doc'), /JPG/);
  assert.match(L.checkFile({ type: 'application/pdf', size: 10 }, 'qr'), /imagem/);
});

test('migração: data URL antiga vira bytes iguais', () => {
  const r = L.dataUrlToBytes('data:image/jpeg;base64,' + Buffer.from('EXEMPLO').toString('base64'));
  assert.equal(r.type, 'image/jpeg');
  assert.equal(Buffer.from(r.bytes).toString(), 'EXEMPLO');
  assert.equal(L.dataUrlToBytes('lixo'), null);
});
