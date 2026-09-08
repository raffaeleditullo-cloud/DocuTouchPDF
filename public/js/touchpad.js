// DocuTouch Pro - Touchpad Mobile Controller (Final Pro Version)
(function() {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session') || 'default-session';

  const canvas = document.getElementById('signature-canvas');
  const container = document.getElementById('canvas-container');
  const ctx = canvas.getContext('2d');
  const guide = document.getElementById('canvas-guide');
  const statusBadge = document.getElementById('connection-status');
  const statusText = document.getElementById('status-text');
  const btnClear = document.getElementById('btn-clear');
  const btnSubmit = document.getElementById('btn-submit');
  const successScreen = document.getElementById('success-screen');
  const btnSignAgain = document.getElementById('btn-sign-again');
  const btnCloseSession = document.getElementById('btn-close-session');
  const completedScreen = document.getElementById('completed-screen');
  const btnReopenPad = document.getElementById('btn-reopen-pad');

  // Drawing state
  let isDrawing = false;
  let hasDrawn = false;
  let currentColor = '#0f172a';
  let currentThickness = 3.5;
  let points = [];
  let dpr = window.devicePixelRatio || 1;
  let strokeHistory = []; // Per undo o replay

  // Setup Canvas High DPI
  function resizeCanvas() {
    dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }

  window.addEventListener('resize', () => {
    if (!hasDrawn) {
      resizeCanvas();
    }
  });
  resizeCanvas();

  // Color selection
  document.querySelectorAll('.color-option').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.color-option').forEach(o => o.classList.remove('active'));
      el.classList.add('active');
      currentColor = el.dataset.color;
    });
  });

  // Thickness selection
  document.querySelectorAll('.thick-btn').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.thick-btn').forEach(b => b.classList.remove('active'));
      el.classList.add('active');
      currentThickness = parseFloat(el.dataset.size);
    });
  });

  // Touch & Pointer Handling
  function getCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure && e.pressure > 0 ? e.pressure : 0.5
    };
  }

  function startDrawing(e) {
    e.preventDefault();
    isDrawing = true;
    hasDrawn = true;
    guide.style.opacity = '0.15';
    const point = getCoordinates(e);
    points = [point];

    ctx.beginPath();
    ctx.fillStyle = currentColor;
    ctx.arc(point.x, point.y, currentThickness / 2, 0, Math.PI * 2);
    ctx.fill();

    // Stream point start to desktop in real-time
    sendLiveStroke({
      type: 'start',
      x: point.x / (canvas.width / dpr),
      y: point.y / (canvas.height / dpr),
      color: currentColor,
      width: currentThickness
    });
  }

  function drawMove(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const point = getCoordinates(e);
    points.push(point);

    if (points.length >= 3) {
      const p0 = points[points.length - 3];
      const p1 = points[points.length - 2];
      const p2 = points[points.length - 1];

      // Midpoints per interpolazione Bézier liscia
      const mid1 = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
      const mid2 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

      ctx.beginPath();
      ctx.moveTo(mid1.x, mid1.y);
      ctx.quadraticCurveTo(p1.x, p1.y, mid2.x, mid2.y);
      ctx.strokeStyle = currentColor;
      
      const dynamicWidth = currentThickness * (0.8 + (p1.pressure || 0.5) * 0.4);
      ctx.lineWidth = dynamicWidth;
      ctx.stroke();

      // Stream stroke segment in real-time to desktop
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      sendLiveStroke({
        type: 'curve',
        mid1X: mid1.x / w,
        mid1Y: mid1.y / h,
        cpX: p1.x / w,
        cpY: p1.y / h,
        mid2X: mid2.x / w,
        mid2Y: mid2.y / h,
        color: currentColor,
        width: dynamicWidth
      });
    }
  }

  function stopDrawing(e) {
    if (!isDrawing) return;
    isDrawing = false;
    points = [];
    sendLiveStroke({ type: 'end' });
  }

  canvas.addEventListener('pointerdown', startDrawing);
  canvas.addEventListener('pointermove', drawMove);
  canvas.addEventListener('pointerup', stopDrawing);
  canvas.addEventListener('pointercancel', stopDrawing);

  // Throttled Live Stroke Sender
  let strokeQueue = [];
  let streamTimer = null;

  function sendLiveStroke(segment) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    strokeQueue.push(segment);
    if (!streamTimer) {
      streamTimer = setTimeout(() => {
        if (strokeQueue.length > 0 && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'live-stroke',
            sessionId: sessionId,
            stroke: strokeQueue
          }));
          strokeQueue = [];
        }
        streamTimer = null;
      }, 30); // ~33 fps streaming
    }
  }

  // Clear Canvas
  function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    hasDrawn = false;
    guide.style.opacity = '1';
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'clear-signature', sessionId }));
    }
  }

  btnClear.addEventListener('click', () => {
    if (navigator.vibrate) navigator.vibrate(30);
    clearCanvas();
  });

  // Ritaglio automatico della firma senza margini vuoti
  function getCroppedSignature() {
    const w = canvas.width;
    const h = canvas.height;
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    let minX = w, minY = h, maxX = 0, maxY = 0;
    let found = false;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const alpha = data[(y * w + x) * 4 + 3];
        if (alpha > 20) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          found = true;
        }
      }
    }

    if (!found) return null;

    const padding = 16 * dpr;
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(w, maxX + padding);
    maxY = Math.min(h, maxY + padding);

    const cropWidth = maxX - minX;
    const cropHeight = maxY - minY;

    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = cropWidth;
    cropCanvas.height = cropHeight;
    const cropCtx = cropCanvas.getContext('2d');

    cropCtx.drawImage(canvas, minX, minY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
    return cropCanvas.toDataURL('image/png');
  }

  // WebSocket Sync
  let ws = null;

  function connectWebSocket() {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${location.host}`;
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      statusBadge.classList.remove('disconnected');
      statusText.textContent = 'Connesso al PC';
      ws.send(JSON.stringify({
        type: 'join-mobile',
        sessionId: sessionId
      }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'signature-delivered') {
          if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
          successScreen.classList.add('active');
        } else if (msg.type === 'new-target-ready') {
          if (navigator.vibrate) navigator.vibrate(40);
          successScreen.classList.remove('active');
          completedScreen.classList.remove('active');
          clearCanvas();
        } else if (msg.type === 'session-closed-ack') {
          successScreen.classList.remove('active');
          completedScreen.classList.add('active');
        }
      } catch (err) {}
    };

    ws.onclose = () => {
      statusBadge.classList.add('disconnected');
      statusText.textContent = 'Disconnesso';
      if (!completedScreen.classList.contains('active')) {
        setTimeout(connectWebSocket, 2500);
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  }

  connectWebSocket();

  // Invia Firma
  btnSubmit.addEventListener('click', () => {
    if (!hasDrawn) {
      alert('Traccia la tua firma prima di confermare.');
      return;
    }

    const trimmedDataUrl = getCroppedSignature();
    if (!trimmedDataUrl) {
      alert('Nessun tratto rilevato.');
      return;
    }

    if (navigator.vibrate) navigator.vibrate(50);

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'submit-signature',
        sessionId: sessionId,
        dataUrl: trimmedDataUrl
      }));
    } else {
      alert('Connessione al PC persa. Attendi la riconnessione.');
    }
  });

  // Azione 1: Fai un'altra firma
  if (btnSignAgain) {
    btnSignAgain.addEventListener('click', () => {
      if (navigator.vibrate) navigator.vibrate(30);
      successScreen.classList.remove('active');
      clearCanvas();
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'mobile-ready-again', sessionId }));
      }
    });
  }

  // Azione 2: Conferma e chiudi sessione dal telefono
  if (btnCloseSession) {
    btnCloseSession.addEventListener('click', () => {
      if (navigator.vibrate) navigator.vibrate([40, 60]);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'mobile-close-session', sessionId }));
      }
      successScreen.classList.remove('active');
      completedScreen.classList.add('active');
    });
  }

  // Azione 3: Riapri touchpad se serve
  if (btnReopenPad) {
    btnReopenPad.addEventListener('click', () => {
      completedScreen.classList.remove('active');
      clearCanvas();
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        connectWebSocket();
      }
    });
  }

})();
