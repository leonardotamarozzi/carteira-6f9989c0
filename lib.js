/* Lógica pura do app (sem DOM). Carregada pelo index.html e testada no Node (node --test tests/). */
(function (root) {
  'use strict';

  const MAX_FILE = 15 * 1024 * 1024; // 15 MB
  const DOC_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  const QR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const QR_SECONDS = 60;

  /* Valida um arquivo antes de guardar. Devolve a mensagem de erro ou null. */
  function checkFile(file, kind) {
    if (!file) return 'Nenhum arquivo escolhido.';
    const types = kind === 'qr' ? QR_TYPES : DOC_TYPES;
    if (!types.includes(file.type)) {
      return kind === 'qr' ? 'Escolha uma imagem JPG, PNG ou WebP.' : 'Escolha uma imagem JPG, PNG, WebP ou um PDF.';
    }
    if (file.size > MAX_FILE) return 'Arquivo grande demais. O limite é 15 MB.';
    return null;
  }

  /* Orientação: só muda a exibição, nunca o arquivo.
     'h' (Horizontal): retrato (mais alto que largo) gira 90° para ficar deitado.
     'v' (Vertical): fica em pé, sem giro automático.
     rot: giro extra escolhido pelo botão "Girar" (0, 90, 180, 270). */
  function autoRotation(orient, w, h) {
    return orient === 'h' && h > w ? 90 : 0;
  }
  function normRot(r) {
    const n = Math.round(Number(r) / 90) * 90;
    return Number.isFinite(n) ? ((n % 360) + 360) % 360 : 0;
  }
  function effectiveRotation(orient, w, h, rot) {
    return normRot(autoRotation(orient, w, h) + normRot(rot));
  }
  /* Tamanho do elemento (antes do giro) e altura da caixa para ocupar a largura W depois do giro. */
  function fitBox(W, w, h, rotation) {
    if (!(W > 0 && w > 0 && h > 0)) return { elW: 0, elH: 0, boxH: 0 };
    const sideways = normRot(rotation) % 180 !== 0;
    if (!sideways) return { elW: W, elH: (W * h) / w, boxH: (W * h) / w };
    // Girado 90°: a largura visível é a altura do elemento.
    return { elW: (W * w) / h, elH: W, boxH: (W * w) / h };
  }

  /* Cronômetro de privacidade do QR Code: só oculta a imagem, não indica validade. */
  function qrState(startedAt, now, duration) {
    const d = duration || QR_SECONDS;
    const elapsed = Math.max(0, Math.floor((now - startedAt) / 1000));
    const remaining = Math.max(0, d - elapsed);
    return { remaining, blurred: remaining === 0, progress: remaining / d };
  }
  function fmtTimer(sec) {
    const s = Math.max(0, Math.floor(sec));
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return mm + ' : ' + ss;
  }

  /* Bytes <-> base64 (em blocos, para arquivos grandes). */
  function bytesToB64(bytes) {
    if (typeof Buffer !== 'undefined' && typeof window === 'undefined') return Buffer.from(bytes).toString('base64');
    let bin = '';
    const CH = 0x8000;
    for (let i = 0; i < bytes.length; i += CH) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CH));
    return btoa(bin);
  }
  function b64ToBytes(b64) {
    if (typeof b64 !== 'string' || !/^[A-Za-z0-9+/]*={0,2}$/.test(b64)) throw new Error('base64 inválido');
    if (typeof Buffer !== 'undefined' && typeof window === 'undefined') return new Uint8Array(Buffer.from(b64, 'base64'));
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  /* data:URL (formato antigo do app) -> { type, bytes } */
  function dataUrlToBytes(d) {
    const m = /^data:([a-z]+\/[a-z0-9.+-]+);base64,(.*)$/i.exec(d || '');
    if (!m) return null;
    return { type: m[1].toLowerCase(), bytes: b64ToBytes(m[2]) };
  }

  async function sha256Hex(bytes) {
    const buf = await globalThis.crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
  }

  /* Backup: documento com Blobs -> objeto JSON com arquivos em base64, e o caminho de volta. */
  const FILE_SLOTS = ['front', 'back', 'qr'];
  async function encodeDoc(doc) {
    const out = { ...doc, files: {} };
    for (const k of FILE_SLOTS) {
      delete out[k];
      const f = doc[k];
      if (f && typeof f.arrayBuffer === 'function') {
        out.files[k] = { type: f.type || 'application/octet-stream', b64: bytesToB64(new Uint8Array(await f.arrayBuffer())) };
      }
    }
    return out;
  }
  function decodeDoc(obj) {
    if (!obj || typeof obj !== 'object') throw new Error('documento inválido');
    const doc = { ...obj };
    const files = obj.files && typeof obj.files === 'object' ? obj.files : {};
    delete doc.files;
    for (const k of FILE_SLOTS) {
      const f = files[k];
      if (f && typeof f.b64 === 'string' && typeof f.type === 'string' && DOC_TYPES.includes(f.type)) {
        doc[k] = new Blob([b64ToBytes(f.b64)], { type: f.type });
      } else doc[k] = null;
    }
    return doc;
  }

  const api = {
    MAX_FILE, DOC_TYPES, QR_TYPES, QR_SECONDS, FILE_SLOTS,
    checkFile, autoRotation, normRot, effectiveRotation, fitBox,
    qrState, fmtTimer, bytesToB64, b64ToBytes, dataUrlToBytes, sha256Hex, encodeDoc, decodeDoc
  };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PWC = api;
})(typeof self !== 'undefined' ? self : this);
