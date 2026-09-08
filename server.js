const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const os = require('os');
const fs = require('fs');
const QRCode = require('qrcode');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

// Cartella locale persistente per i progetti salvati
const PROJECTS_DIR = path.join(__dirname, 'saved_projects');
if (!fs.existsSync(PROJECTS_DIR)) {
  fs.mkdirSync(PROJECTS_DIR, { recursive: true });
}

// Funzione per identificare l'IP locale (Wi-Fi o LAN principale)
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  let candidateIp = '127.0.0.1';

  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        if (name.toLowerCase().includes('wi-fi') || name.toLowerCase().includes('wlan') || name.toLowerCase().includes('ethernet')) {
          return net.address;
        }
        candidateIp = net.address;
      }
    }
  }
  return candidateIp;
}

const localIp = getLocalIpAddress();

// Middleware (limite aumentato per gestire file PDF e firme ad alta risoluzione)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Mappa delle sessioni attive: sessionId => { desktopWs, mobileWs, createdAt }
const sessions = new Map();

// Endpoint info server e rete
app.get('/api/info', (req, res) => {
  res.json({
    app: 'DocuTouchPDF',
    ip: localIp,
    port: PORT,
    touchpadUrl: `http://${localIp}:${PORT}/touchpad.html`,
    baseUrl: `http://${localIp}:${PORT}`
  });
});

// Endpoint per chiusura pulita dell'applicazione
app.post('/api/shutdown', (req, res) => {
  res.json({ success: true, message: 'Server DocuTouchPDF in fase di arresto...' });
  setTimeout(() => {
    process.exit(0);
  }, 400);
});


// Endpoint generatore QR Code
app.get('/api/qr', async (req, res) => {
  const text = req.query.url;
  if (!text) {
    return res.status(400).json({ error: 'Parametro url mancante' });
  }
  try {
    const qrDataUrl = await QRCode.toDataURL(text, {
      margin: 1,
      width: 320,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });
    res.json({ qrDataUrl });
  } catch (err) {
    res.status(500).json({ error: 'Errore generazione QR code' });
  }
});

// ==========================================
// API GESTIONE PROGETTI SALVATI (DASHBOARD)
// ==========================================

// GET /api/projects - Elenco di tutti i progetti salvati
app.get('/api/projects', (req, res) => {
  try {
    const items = fs.readdirSync(PROJECTS_DIR);
    const projects = [];

    for (const item of items) {
      const projPath = path.join(PROJECTS_DIR, item);
      const metaFile = path.join(projPath, 'metadata.json');
      if (fs.existsSync(metaFile)) {
        try {
          const meta = JSON.parse(fs.readFileSync(metaFile, 'utf-8'));
          projects.push(meta);
        } catch (e) {}
      }
    }

    projects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    res.json({ projects });
  } catch (err) {
    console.error('Errore lettura progetti:', err);
    res.status(500).json({ error: 'Impossibile leggere l\'archivio progetti' });
  }
});

// POST /api/projects - Salva o aggiorna un progetto
app.post('/api/projects', (req, res) => {
  try {
    const { id, name, originalPdfBase64, appliedSignatures, appliedDateStamps, finalPdfBase64, thumbnailBase64 } = req.body;
    const projectId = id || 'proj_' + Date.now();
    const projDir = path.join(PROJECTS_DIR, projectId);

    if (!fs.existsSync(projDir)) {
      fs.mkdirSync(projDir, { recursive: true });
    }

    if (originalPdfBase64) {
      const origBuffer = Buffer.from(originalPdfBase64.replace(/^data:application\/pdf;base64,/, ''), 'base64');
      if (origBuffer.length > 0) {
        fs.writeFileSync(path.join(projDir, 'original.pdf'), origBuffer);
      }
    }

    if (finalPdfBase64) {
      const finalBuffer = Buffer.from(finalPdfBase64.replace(/^data:application\/pdf;base64,/, ''), 'base64');
      if (finalBuffer.length > 0) {
        fs.writeFileSync(path.join(projDir, 'signed.pdf'), finalBuffer);
      }
    }

    if (thumbnailBase64) {
      const thumbBuffer = Buffer.from(thumbnailBase64.replace(/^data:image\/png;base64,/, ''), 'base64');
      if (thumbBuffer.length > 0) {
        fs.writeFileSync(path.join(projDir, 'thumbnail.png'), thumbBuffer);
      }
    }

    const metadata = {
      id: projectId,
      name: name || 'Documento senza titolo',
      updatedAt: new Date().toISOString(),
      signaturesCount: (appliedSignatures || []).length,
      datesCount: (appliedDateStamps || []).length,
      hasSignedPdf: !!finalPdfBase64,
      appliedSignatures: appliedSignatures || [],
      appliedDateStamps: appliedDateStamps || []
    };

    fs.writeFileSync(path.join(projDir, 'metadata.json'), JSON.stringify(metadata, null, 2));

    res.json({ success: true, project: metadata });
  } catch (err) {
    console.error('Errore salvataggio progetto:', err);
    res.status(500).json({ error: 'Errore durante il salvataggio del progetto' });
  }
});

// GET /api/projects/:id - Carica un progetto completo nell'editor
app.get('/api/projects/:id', (req, res) => {
  try {
    const projDir = path.join(PROJECTS_DIR, req.params.id);
    const metaFile = path.join(projDir, 'metadata.json');
    const origFile = path.join(projDir, 'original.pdf');

    if (!fs.existsSync(metaFile) || !fs.existsSync(origFile)) {
      return res.status(404).json({ error: 'Progetto non trovato' });
    }

    const metadata = JSON.parse(fs.readFileSync(metaFile, 'utf-8'));
    const originalPdfBuffer = fs.readFileSync(origFile);
    const originalPdfBase64 = `data:application/pdf;base64,${originalPdfBuffer.toString('base64')}`;

    res.json({
      metadata,
      originalPdfBase64
    });
  } catch (err) {
    console.error('Errore caricamento progetto:', err);
    res.status(500).json({ error: 'Impossibile caricare il progetto' });
  }
});

// GET /api/projects/:id/download - Scarica direttamente il PDF firmato
app.get('/api/projects/:id/download', (req, res) => {
  try {
    const projDir = path.join(PROJECTS_DIR, req.params.id);
    const signedFile = path.join(projDir, 'signed.pdf');
    const metaFile = path.join(projDir, 'metadata.json');

    if (!fs.existsSync(signedFile)) {
      return res.status(404).send('Nessun file PDF firmato generato per questo progetto.');
    }

    let fileName = 'documento_firmato.pdf';
    if (fs.existsSync(metaFile)) {
      const meta = JSON.parse(fs.readFileSync(metaFile, 'utf-8'));
      fileName = `${(meta.name || 'documento').replace(/\.pdf$/i, '')}_firmato.pdf`;
    }

    res.download(signedFile, fileName);
  } catch (err) {
    res.status(500).send('Errore durante il download');
  }
});

// GET /api/projects/:id/thumbnail - Ottieni la miniatura del progetto
app.get('/api/projects/:id/thumbnail', (req, res) => {
  const thumbFile = path.join(PROJECTS_DIR, req.params.id, 'thumbnail.png');
  if (fs.existsSync(thumbFile)) {
    res.sendFile(thumbFile);
  } else {
    res.status(404).send('Nessuna miniatura');
  }
});

// DELETE /api/projects/:id - Elimina un progetto
app.delete('/api/projects/:id', (req, res) => {
  try {
    const projDir = path.join(PROJECTS_DIR, req.params.id);
    if (fs.existsSync(projDir)) {
      fs.rmSync(projDir, { recursive: true, force: true });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Errore eliminazione progetto:', err);
    res.status(500).json({ error: 'Impossibile eliminare il progetto' });
  }
});

// ==========================================
// GESTIONE WEBSOCKET REAL-TIME
// ==========================================
wss.on('connection', (ws) => {
  let boundSessionId = null;
  let boundRole = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      const { type, sessionId } = data;

      if (!sessionId) return;

      if (!sessions.has(sessionId)) {
        sessions.set(sessionId, { desktopWs: null, mobileWs: null, createdAt: Date.now() });
      }
      const session = sessions.get(sessionId);

      switch (type) {
        case 'register-desktop':
          boundSessionId = sessionId;
          boundRole = 'desktop';
          session.desktopWs = ws;
          ws.send(JSON.stringify({ type: 'registered', role: 'desktop', sessionId }));
          if (session.mobileWs && session.mobileWs.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'mobile-connected' }));
          }
          break;

        case 'join-mobile':
          boundSessionId = sessionId;
          boundRole = 'mobile';
          session.mobileWs = ws;
          ws.send(JSON.stringify({ type: 'joined', role: 'mobile', sessionId }));
          if (session.desktopWs && session.desktopWs.readyState === WebSocket.OPEN) {
            session.desktopWs.send(JSON.stringify({ type: 'mobile-connected' }));
          }
          break;

        case 'live-stroke':
          if (session.desktopWs && session.desktopWs.readyState === WebSocket.OPEN) {
            session.desktopWs.send(JSON.stringify({
              type: 'live-stroke',
              stroke: data.stroke
            }));
          }
          break;

        case 'clear-signature':
          if (session.desktopWs && session.desktopWs.readyState === WebSocket.OPEN) {
            session.desktopWs.send(JSON.stringify({ type: 'clear-signature' }));
          }
          break;

        case 'submit-signature':
          if (session.desktopWs && session.desktopWs.readyState === WebSocket.OPEN) {
            session.desktopWs.send(JSON.stringify({
              type: 'signature-received',
              dataUrl: data.dataUrl
            }));
          }
          ws.send(JSON.stringify({ type: 'signature-delivered' }));
          break;

        case 'mobile-close-session':
          if (session.desktopWs && session.desktopWs.readyState === WebSocket.OPEN) {
            session.desktopWs.send(JSON.stringify({ type: 'mobile-session-closed' }));
          }
          ws.send(JSON.stringify({ type: 'session-closed-ack' }));
          break;

        case 'desktop-new-target':
          if (session.mobileWs && session.mobileWs.readyState === WebSocket.OPEN) {
            session.mobileWs.send(JSON.stringify({ type: 'new-target-ready' }));
          }
          break;

        case 'mobile-ready-again':
          if (session.desktopWs && session.desktopWs.readyState === WebSocket.OPEN) {
            session.desktopWs.send(JSON.stringify({ type: 'mobile-ready-again' }));
          }
          break;

        case 'ping':
          ws.send(JSON.stringify({ type: 'pong' }));
          break;
      }
    } catch (err) {
      console.error('Errore gestione messaggio WebSocket:', err);
    }
  });

  ws.on('close', () => {
    if (boundSessionId && sessions.has(boundSessionId)) {
      const session = sessions.get(boundSessionId);
      if (boundRole === 'desktop') {
        session.desktopWs = null;
      } else if (boundRole === 'mobile') {
        session.mobileWs = null;
        if (session.desktopWs && session.desktopWs.readyState === WebSocket.OPEN) {
          session.desktopWs.send(JSON.stringify({ type: 'mobile-disconnected' }));
        }
      }
      if (!session.desktopWs && !session.mobileWs) {
        setTimeout(() => {
          if (!session.desktopWs && !session.mobileWs) {
            sessions.delete(boundSessionId);
          }
        }, 10 * 60 * 1000);
      }
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('====================================================');
  console.log('                 DOCUTOUCHPDF                       ');
  console.log('       Firma & Annotazione PDF via Smartphone       ');
  console.log('====================================================');
  console.log(`[PC Desktop] Apri nel browser del PC:`);
  console.log(`  -> http://localhost:${PORT}`);
  console.log(`  -> http://${localIp}:${PORT}`);
  console.log(`\n[Smartphone] Inquadra il QR Code o apri:`);
  console.log(`  -> http://${localIp}:${PORT}/touchpad.html`);
  console.log('====================================================');
});
