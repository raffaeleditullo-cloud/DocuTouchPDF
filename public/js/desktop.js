// DocuTouch Pro - Desktop Application Controller (Full Edition with Dashboard & Click-to-Date)
(function() {
  if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'vendor/pdf.worker.min.js';
  }

  // Generatore ID Sessione
  function generateSessionId() {
    return 'docu_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  }
  const sessionId = generateSessionId();

  // ID Progetto Corrente (se salvato o caricato dalla dashboard)
  let currentProjectId = null;

  // Elementi DOM Suite & Navigazione
  const brandHomeBtn = document.getElementById('brand-home-btn');
  const navBtnDashboard = document.getElementById('nav-btn-dashboard');
  const navBtnEditor = document.getElementById('nav-btn-editor');
  const navBtnTouchpad = document.getElementById('nav-btn-touchpad');
  const navBtnHelp = document.getElementById('nav-btn-help');
  const navProjectsCount = document.getElementById('nav-projects-count');
  const editorStatusBadge = document.getElementById('editor-status-badge');

  const viewDashboard = document.getElementById('view-dashboard');
  const viewEditor = document.getElementById('view-editor');
  const viewTouchpad = document.getElementById('view-touchpad');
  const viewHelp = document.getElementById('view-help');

  const editorSubcontrols = document.getElementById('editor-subcontrols');
  const editorActionsGroup = document.getElementById('editor-actions-group');
  const dashboardActionsGroup = document.getElementById('dashboard-actions-group');

  const btnHeaderNewProject = document.getElementById('btn-header-new-project');
  const btnBackToDashboard = document.getElementById('btn-back-to-dashboard');
  const btnEditorBackDash = document.getElementById('btn-editor-back-dash');
  const editorFilenameDisplay = document.getElementById('editor-filename-display');

  // KPI & Dashboard Elements
  const statTotalProjects = document.getElementById('stat-total-projects');
  const statSignedProjects = document.getElementById('stat-signed-projects');
  const statDraftProjects = document.getElementById('stat-draft-projects');
  const statTotalSignatures = document.getElementById('stat-total-signatures');

  const dashDropzone = document.getElementById('dash-dropzone');
  const dashFileInput = document.getElementById('dash-file-input');
  const btnDashSelectFile = document.getElementById('btn-dash-select-file');
  const btnDashSample = document.getElementById('btn-dash-sample');

  const dashDeviceBadge = document.getElementById('dash-device-badge');
  const dashQrImg = document.getElementById('dash-qr-img');
  const dashDirectUrl = document.getElementById('dash-direct-url');
  const btnCopyDeviceUrl = document.getElementById('btn-copy-device-url');

  const dashboardSearchInput = document.getElementById('dashboard-search-input');
  const filterPillAll = document.getElementById('filter-pill-all');
  const filterPillSigned = document.getElementById('filter-pill-signed');
  const filterPillDrafts = document.getElementById('filter-pill-drafts');
  const filterCountAll = document.getElementById('filter-count-all');
  const filterCountSigned = document.getElementById('filter-count-signed');
  const filterCountDrafts = document.getElementById('filter-count-drafts');
  const projectsGrid = document.getElementById('projects-grid');

  // Editor Tools & Actions
  const toolBtnSignature = document.getElementById('tool-btn-signature');
  const toolBtnDate = document.getElementById('tool-btn-date');
  const toolInstructText = document.getElementById('tool-instruct-text');

  const modalUpload = document.getElementById('modal-upload');
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');
  const btnLoadSample = document.getElementById('btn-load-sample');
  const btnSaveProject = document.getElementById('btn-save-project');
  const btnPrintDoc = document.getElementById('btn-print-doc');
  const btnDownloadPdf = document.getElementById('btn-download-pdf');

  const viewportWrapper = document.getElementById('viewport-wrapper');
  const pdfCanvas = document.getElementById('pdf-canvas');
  const targetBox = document.getElementById('signature-target-box');
  const targetLiveCanvas = document.getElementById('target-live-canvas');
  const overlayLayer = document.getElementById('signature-overlay-layer');

  const floatingControls = document.getElementById('floating-controls');
  const btnPrevPage = document.getElementById('btn-prev-page');
  const btnNextPage = document.getElementById('btn-next-page');
  const pageNumDisplay = document.getElementById('page-num-display');
  const btnZoomIn = document.getElementById('btn-zoom-in');
  const btnZoomOut = document.getElementById('btn-zoom-out');
  const zoomDisplay = document.getElementById('zoom-display');

  // Elementi Menu a Tendina (Dropdown)
  const dropdownDoc = document.getElementById('dropdown-doc');
  const btnDropdownDoc = document.getElementById('btn-dropdown-doc');
  const itemDocNew = document.getElementById('item-doc-new');
  const itemDocSample = document.getElementById('item-doc-sample');
  const itemDocSave = document.getElementById('item-doc-save');
  const itemDocPrint = document.getElementById('item-doc-print');
  const itemDocDownload = document.getElementById('item-doc-download');

  const dropdownTools = document.getElementById('dropdown-tools');
  const btnDropdownTools = document.getElementById('btn-dropdown-tools');
  const selectedToolIcon = document.getElementById('selected-tool-icon');
  const selectedToolLabel = document.getElementById('selected-tool-label');
  const itemToolZoomIn = document.getElementById('item-tool-zoom-in');
  const itemToolZoomOut = document.getElementById('item-tool-zoom-out');

  const dropdownDevice = document.getElementById('dropdown-device');
  const headerPhoneStatusPill = document.getElementById('header-phone-status-pill');
  const headerQrImg = document.getElementById('header-qr-img');
  const headerDirectUrl = document.getElementById('header-direct-url');
  const btnCopyHeaderUrl = document.getElementById('btn-copy-header-url');

  // Elementi Drawer Laterale Collassabile
  const editorSidebar = document.getElementById('editor-sidebar');
  const btnToggleDrawer = document.getElementById('btn-toggle-drawer');
  const btnCloseDrawer = document.getElementById('btn-close-drawer');
  const drawerFloatingTrigger = document.getElementById('drawer-floating-trigger');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const badgeElementsCount = document.getElementById('badge-elements-count');

  const modalQr = document.getElementById('modal-qr');
  const btnCloseQr = document.getElementById('btn-close-qr');
  const qrImage = document.getElementById('qr-image');
  const qrDirectLink = document.getElementById('qr-direct-link');
  const qrStatusText = document.getElementById('qr-status-text');
  const qrConnectionStatus = document.getElementById('qr-connection-status');
  const modalLiveBox = document.getElementById('modal-live-box');
  const qrMonitorCanvas = document.getElementById('qr-monitor-canvas');

  const desktopStatusDot = document.getElementById('desktop-status-dot');
  const desktopStatusText = document.getElementById('desktop-status-text');
  const appliedSignaturesList = document.getElementById('applied-signatures-list');
  const thumbnailsContainer = document.getElementById('thumbnails-container');

  const standaloneQrImg = document.getElementById('standalone-qr-img');

  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');
  const toastIcon = document.getElementById('toast-icon');

  // Stato applicativo
  let currentPdfDoc = null;
  let currentPdfBytes = null;
  let originalFilename = 'documento.pdf';
  let currentPageIndex = 0;
  let currentScale = 1.25;
  let currentViewport = null;

  // Strumento Attivo: 'signature' (default) oppure 'date'
  let currentTool = 'signature';
  let targetCoords = null;
  let appliedSignatures = [];
  let appliedDateStamps = [];
  let currentFilter = 'all';

  function showToast(message, icon = 'ℹ️', duration = 3000) {
    toastMessage.textContent = message;
    toastIcon.textContent = icon;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
  }

  // ==========================================
  // GESTORE COMMUTAZIONE VISTE (SUITE ROUTER)
  // ==========================================
  function switchView(viewName) {
    if (navBtnDashboard) navBtnDashboard.classList.toggle('active', viewName === 'dashboard');
    if (navBtnEditor) navBtnEditor.classList.toggle('active', viewName === 'editor');
    if (navBtnTouchpad) navBtnTouchpad.classList.toggle('active', viewName === 'touchpad');
    if (navBtnHelp) navBtnHelp.classList.toggle('active', viewName === 'help');

    if (viewDashboard) viewDashboard.style.display = viewName === 'dashboard' ? 'block' : 'none';
    if (viewEditor) viewEditor.style.display = viewName === 'editor' ? 'flex' : 'none';
    if (viewTouchpad) viewTouchpad.style.display = viewName === 'touchpad' ? 'block' : 'none';
    if (viewHelp) viewHelp.style.display = viewName === 'help' ? 'block' : 'none';

    if (viewName === 'editor') {
      if (editorSubcontrols) editorSubcontrols.style.display = 'flex';
      if (editorActionsGroup) editorActionsGroup.style.display = 'flex';
      if (dashboardActionsGroup) dashboardActionsGroup.style.display = 'none';

      if (!currentPdfDoc) {
        showToast('Nessun documento aperto. Seleziona un PDF per iniziare!', '📂');
      }
    } else {
      if (editorSubcontrols) editorSubcontrols.style.display = 'none';
      if (editorActionsGroup) editorActionsGroup.style.display = 'none';
      if (dashboardActionsGroup) dashboardActionsGroup.style.display = 'block';
    }

    if (viewName === 'dashboard') {
      loadProjectsDashboard();
    } else if (viewName === 'touchpad') {
      initStandalonePad();
    }
  }

  if (navBtnDashboard) navBtnDashboard.addEventListener('click', () => switchView('dashboard'));
  if (navBtnEditor) navBtnEditor.addEventListener('click', () => switchView('editor'));
  if (navBtnTouchpad) navBtnTouchpad.addEventListener('click', () => switchView('touchpad'));
  if (navBtnHelp) navBtnHelp.addEventListener('click', () => switchView('help'));

  if (brandHomeBtn) brandHomeBtn.addEventListener('click', () => switchView('dashboard'));
  if (btnBackToDashboard) btnBackToDashboard.addEventListener('click', () => switchView('dashboard'));
  if (btnEditorBackDash) btnEditorBackDash.addEventListener('click', () => switchView('dashboard'));
  if (btnHeaderNewProject) btnHeaderNewProject.addEventListener('click', () => { if (dashFileInput) dashFileInput.click(); });

  // ==========================================
  // GESTORE GLOBALE DROPDOWN (ACCESSIBILE)
  // ==========================================
  function closeAllDropdowns() {
    document.querySelectorAll('.dropdown').forEach(d => {
      d.classList.remove('open');
      const toggle = d.querySelector('.dropdown-toggle');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  }

  function toggleDropdown(dropdownEl) {
    if (!dropdownEl) return;
    const wasOpen = dropdownEl.classList.contains('open');
    closeAllDropdowns();
    if (!wasOpen) {
      dropdownEl.classList.add('open');
      const toggle = dropdownEl.querySelector('.dropdown-toggle');
      if (toggle) toggle.setAttribute('aria-expanded', 'true');
    }
  }

  if (btnDropdownDoc && dropdownDoc) {
    btnDropdownDoc.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDropdown(dropdownDoc);
    });
  }

  if (btnDropdownTools && dropdownTools) {
    btnDropdownTools.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDropdown(dropdownTools);
    });
  }

  if (headerPhoneStatusPill && dropdownDevice) {
    headerPhoneStatusPill.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDropdown(dropdownDevice);
    });
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) {
      closeAllDropdowns();
    }
  });

  // Azioni delle Voci del Menu Documento
  if (itemDocNew) {
    itemDocNew.addEventListener('click', () => {
      closeAllDropdowns();
      if (dashFileInput) dashFileInput.click();
      else if (fileInput) fileInput.click();
    });
  }

  if (itemDocSample) {
    itemDocSample.addEventListener('click', () => {
      closeAllDropdowns();
      if (btnDashSample) btnDashSample.click();
      else if (btnLoadSample) btnLoadSample.click();
    });
  }

  if (itemDocSave) {
    itemDocSave.addEventListener('click', () => {
      closeAllDropdowns();
      if (btnSaveProject) btnSaveProject.click();
    });
  }

  if (itemDocPrint) {
    itemDocPrint.addEventListener('click', () => {
      closeAllDropdowns();
      if (btnPrintDoc) btnPrintDoc.click();
    });
  }

  if (itemDocDownload) {
    itemDocDownload.addEventListener('click', () => {
      closeAllDropdowns();
      if (btnDownloadPdf) btnDownloadPdf.click();
    });
  }

  if (itemToolZoomIn) {
    itemToolZoomIn.addEventListener('click', () => {
      closeAllDropdowns();
      if (btnZoomIn) btnZoomIn.click();
    });
  }

  if (itemToolZoomOut) {
    itemToolZoomOut.addEventListener('click', () => {
      closeAllDropdowns();
      if (btnZoomOut) btnZoomOut.click();
    });
  }

  if (btnCopyHeaderUrl && headerDirectUrl) {
    btnCopyHeaderUrl.addEventListener('click', (e) => {
      e.stopPropagation();
      navigator.clipboard.writeText(headerDirectUrl.value).then(() => {
        showToast('Link touchscreen copiato!', '📋');
      }).catch(() => {
        headerDirectUrl.select();
        document.execCommand('copy');
        showToast('Link touchscreen copiato!', '📋');
      });
    });
  }

  // ==========================================
  // GESTORE DRAWER LATERALE COLLASSABILE (CTRL+B)
  // ==========================================
  let isDrawerOpen = localStorage.getItem('docutouch_drawer_open') !== '0';

  function toggleSidebarDrawer(forceState) {
    if (!editorSidebar) return;
    if (typeof forceState === 'boolean') {
      isDrawerOpen = forceState;
    } else {
      isDrawerOpen = !isDrawerOpen;
    }

    editorSidebar.classList.toggle('collapsed', !isDrawerOpen);
    if (drawerFloatingTrigger) {
      drawerFloatingTrigger.style.display = isDrawerOpen ? 'none' : 'flex';
    }
    if (drawerBackdrop) {
      drawerBackdrop.classList.toggle('active', isDrawerOpen && window.innerWidth <= 992);
    }
    if (btnToggleDrawer) {
      btnToggleDrawer.classList.toggle('active', isDrawerOpen);
      btnToggleDrawer.setAttribute('aria-expanded', isDrawerOpen ? 'true' : 'false');
    }

    localStorage.setItem('docutouch_drawer_open', isDrawerOpen ? '1' : '0');

    // Ricalcola centraggio del viewport PDF
    setTimeout(() => {
      if (currentPdfDoc) {
        renderCurrentPage();
      }
    }, 280);
  }

  if (btnToggleDrawer) btnToggleDrawer.addEventListener('click', () => toggleSidebarDrawer());
  if (btnCloseDrawer) btnCloseDrawer.addEventListener('click', () => toggleSidebarDrawer(false));
  if (drawerFloatingTrigger) drawerFloatingTrigger.addEventListener('click', () => toggleSidebarDrawer(true));
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', () => toggleSidebarDrawer(false));

  // Inizializza stato drawer salvato
  if (!isDrawerOpen && editorSidebar) {
    editorSidebar.classList.add('collapsed');
    if (drawerFloatingTrigger) drawerFloatingTrigger.style.display = 'flex';
  }

  // Scorciatoie da Tastiera Globali: Ctrl+B per Drawer, Esc per chiudere Dropdown/Modal
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
      e.preventDefault();
      toggleSidebarDrawer();
    } else if (e.key === 'Escape') {
      closeAllDropdowns();
      if (drawerBackdrop && drawerBackdrop.classList.contains('active')) {
        toggleSidebarDrawer(false);
      }
    }
  });

  // ==========================================
  // SELETTORE STRUMENTO (FIRMA vs DATA)
  // ==========================================
  function setToolMode(tool) {
    currentTool = tool;
    closeAllDropdowns();

    if (tool === 'signature') {
      if (toolBtnSignature) {
        toolBtnSignature.classList.add('active');
        const b = toolBtnSignature.querySelector('.tool-bullet');
        if (b) b.textContent = '✓';
      }
      if (toolBtnDate) {
        toolBtnDate.classList.remove('active');
        const b = toolBtnDate.querySelector('.tool-bullet');
        if (b) b.textContent = '';
      }
      if (selectedToolIcon) selectedToolIcon.textContent = '✍️';
      if (selectedToolLabel) selectedToolLabel.textContent = 'Firma';

      if (toolInstructText) {
        toolInstructText.innerHTML = `
          <strong style="color: #60a5fa;">✍️ Modalità Firma Attiva:</strong><br>
          Fai clic sul documento nel punto esatto dove vuoi firmare: apparirà subito il QR Code!
        `;
      }
      if (pdfCanvas) pdfCanvas.style.cursor = 'crosshair';
      showToast('Strumento attivo: Firma Touch', '✍️', 2000);

    } else if (tool === 'date') {
      if (toolBtnDate) {
        toolBtnDate.classList.add('active');
        const b = toolBtnDate.querySelector('.tool-bullet');
        if (b) b.textContent = '✓';
      }
      if (toolBtnSignature) {
        toolBtnSignature.classList.remove('active');
        const b = toolBtnSignature.querySelector('.tool-bullet');
        if (b) b.textContent = '';
      }
      if (selectedToolIcon) selectedToolIcon.textContent = '📅';
      if (selectedToolLabel) selectedToolLabel.textContent = 'Data';

      if (toolInstructText) {
        toolInstructText.innerHTML = `
          <strong style="color: #34d399;">📅 Modalità Data Attiva:</strong><br>
          Fai clic sul documento nel punto esatto dove desideri posizionare la data odierna!
        `;
      }
      if (pdfCanvas) pdfCanvas.style.cursor = 'cell';
      showToast('Strumento attivo: Data Scrivibile', '📅', 2000);
    }
  }

  if (toolBtnSignature) toolBtnSignature.addEventListener('click', () => setToolMode('signature'));
  if (toolBtnDate) toolBtnDate.addEventListener('click', () => setToolMode('date'));

  // ==========================================
  // WEBSOCKET & LIVE STREAMING
  // ==========================================
  let ws = null;

  function initWebSocket() {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${protocol}//${location.host}`);

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'register-desktop',
        sessionId: sessionId
      }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        handleWsMessage(msg);
      } catch (err) {
        console.error('Errore WS:', err);
      }
    };

    ws.onclose = () => setTimeout(initWebSocket, 2500);
  }

  function handleWsMessage(msg) {
    switch (msg.type) {
      case 'mobile-connected':
        setMobileConnectedStatus(true);
        break;

      case 'mobile-disconnected':
        setMobileConnectedStatus(false);
        break;

      case 'live-stroke':
        handleLiveStroke(msg.stroke);
        break;

      case 'clear-signature':
        clearLiveCanvases();
        break;

      case 'signature-received':
        handleSignatureReceived(msg.dataUrl);
        break;

      case 'mobile-session-closed':
        setMobileSessionClosed();
        break;

      case 'mobile-ready-again':
        if (desktopStatusText) desktopStatusText.textContent = 'Smartphone pronto alla firma';
        showToast('Smartphone pronto per la prossima firma!', '✍️', 2500);
        break;
    }
  }

  function setMobileSessionClosed() {
    if (desktopStatusDot) {
      desktopStatusDot.classList.remove('connected');
      desktopStatusDot.classList.add('completed');
    }
    if (desktopStatusText) {
      desktopStatusText.textContent = 'Sessione smartphone conclusa';
    }
    if (dashDeviceBadge) {
      dashDeviceBadge.textContent = 'Sessione completata';
      dashDeviceBadge.classList.remove('connected');
    }
    showToast('Lo smartphone ha completato e chiuso la sessione con successo! 🎉', '📱', 4000);
  }

  function setMobileConnectedStatus(connected) {
    if (connected) {
      desktopStatusDot.classList.add('connected');
      desktopStatusText.textContent = 'Smartphone connesso!';
      if (dashDeviceBadge) {
        dashDeviceBadge.textContent = 'Smartphone connesso!';
        dashDeviceBadge.classList.add('connected');
      }
      qrStatusText.textContent = 'Smartphone connesso! Firma sullo schermo...';
      qrConnectionStatus.classList.add('connected');
      modalLiveBox.style.display = 'block';
      resizeLiveCanvases();
      showToast('Smartphone collegato!', '📱');
    } else {
      desktopStatusDot.classList.remove('connected');
      desktopStatusText.textContent = 'Smartphone in attesa...';
      if (dashDeviceBadge) {
        dashDeviceBadge.textContent = 'In attesa di scansione';
        dashDeviceBadge.classList.remove('connected');
      }
      qrStatusText.textContent = 'In attesa di scansione...';
      qrConnectionStatus.classList.remove('connected');
      modalLiveBox.style.display = 'none';
    }
  }

  function resizeLiveCanvases() {
    if (qrMonitorCanvas) {
      const rect = qrMonitorCanvas.getBoundingClientRect();
      qrMonitorCanvas.width = rect.width;
      qrMonitorCanvas.height = rect.height;
    }
    if (targetLiveCanvas && targetBox) {
      const rect = targetBox.getBoundingClientRect();
      targetLiveCanvas.width = rect.width;
      targetLiveCanvas.height = rect.height;
    }
  }

  function handleLiveStroke(segments) {
    if (!segments || !Array.isArray(segments)) return;

    const monitorCtx = qrMonitorCanvas.getContext('2d');
    const targetCtx = targetLiveCanvas.getContext('2d');

    const monW = qrMonitorCanvas.width;
    const monH = qrMonitorCanvas.height;
    const tgtW = targetLiveCanvas.width;
    const tgtH = targetLiveCanvas.height;

    for (const seg of segments) {
      if (seg.type === 'start') {
        monitorCtx.beginPath();
        monitorCtx.fillStyle = seg.color || '#0f172a';
        monitorCtx.arc(seg.x * monW, seg.y * monH, (seg.width || 3) / 2, 0, Math.PI * 2);
        monitorCtx.fill();

        targetCtx.beginPath();
        targetCtx.fillStyle = seg.color || '#0f172a';
        targetCtx.arc(seg.x * tgtW, seg.y * tgtH, (seg.width || 3) / 2, 0, Math.PI * 2);
        targetCtx.fill();
      } else if (seg.type === 'curve') {
        monitorCtx.beginPath();
        monitorCtx.moveTo(seg.mid1X * monW, seg.mid1Y * monH);
        monitorCtx.quadraticCurveTo(seg.cpX * monW, seg.cpY * monH, seg.mid2X * monW, seg.mid2Y * monH);
        monitorCtx.strokeStyle = seg.color || '#0f172a';
        monitorCtx.lineWidth = seg.width || 3;
        monitorCtx.lineCap = 'round';
        monitorCtx.stroke();

        targetCtx.beginPath();
        targetCtx.moveTo(seg.mid1X * tgtW, seg.mid1Y * tgtH);
        targetCtx.quadraticCurveTo(seg.cpX * tgtW, seg.cpY * tgtH, seg.mid2X * tgtW, seg.mid2Y * tgtH);
        targetCtx.strokeStyle = seg.color || '#0f172a';
        targetCtx.lineWidth = seg.width || 3;
        targetCtx.lineCap = 'round';
        targetCtx.stroke();
      }
    }
  }

  function clearLiveCanvases() {
    if (qrMonitorCanvas) {
      const ctx = qrMonitorCanvas.getContext('2d');
      ctx.clearRect(0, 0, qrMonitorCanvas.width, qrMonitorCanvas.height);
    }
    if (targetLiveCanvas) {
      const ctx = targetLiveCanvas.getContext('2d');
      ctx.clearRect(0, 0, targetLiveCanvas.width, targetLiveCanvas.height);
    }
  }

  // Caricamento Info Rete & QR
  async function loadNetworkInfo() {
    try {
      const res = await fetch('/api/info');
      const info = await res.json();
      const touchpadUrl = `${info.touchpadUrl}?session=${sessionId}`;

      const qrRes = await fetch(`/api/qr?url=${encodeURIComponent(touchpadUrl)}`);
      const qrData = await qrRes.json();

      if (qrImage) qrImage.src = qrData.qrDataUrl;
      if (qrDirectLink) {
        qrDirectLink.href = touchpadUrl;
        qrDirectLink.textContent = touchpadUrl;
      }
      if (dashQrImg) dashQrImg.src = qrData.qrDataUrl;
      if (dashDirectUrl) dashDirectUrl.value = touchpadUrl;
      if (headerQrImg) headerQrImg.src = qrData.qrDataUrl;
      if (headerDirectUrl) headerDirectUrl.value = touchpadUrl;
      if (standaloneQrImg) standaloneQrImg.src = qrData.qrDataUrl;
    } catch (err) {
      console.error('Impossibile caricare info di rete:', err);
    }
  }

  if (btnCopyDeviceUrl) {
    btnCopyDeviceUrl.addEventListener('click', (e) => {
      e.stopPropagation();
      if (dashDirectUrl && dashDirectUrl.value) {
        navigator.clipboard.writeText(dashDirectUrl.value).then(() => {
          showToast('Indirizzo copiato negli appunti! Incollalo sul telefono.', '📋', 3000);
        }).catch(() => {
          dashDirectUrl.select();
          document.execCommand('copy');
          showToast('Indirizzo copiato negli appunti!', '📋', 3000);
        });
      }
    });
  }

  // ==========================================
  // CARICAMENTO FILE & CREATION HUB
  // ==========================================
  // Dropzone Dashboard
  if (dashDropzone) {
    dashDropzone.addEventListener('click', () => { if (dashFileInput) dashFileInput.click(); });
    dashDropzone.addEventListener('dragover', (e) => { e.preventDefault(); dashDropzone.classList.add('drag-over'); });
    dashDropzone.addEventListener('dragleave', () => dashDropzone.classList.remove('drag-over'));
    dashDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dashDropzone.classList.remove('drag-over');
      if (e.dataTransfer.files.length > 0) loadFile(e.dataTransfer.files[0]);
    });
  }

  if (btnDashSelectFile) {
    btnDashSelectFile.addEventListener('click', (e) => {
      e.stopPropagation();
      if (dashFileInput) dashFileInput.click();
    });
  }

  if (dashFileInput) {
    dashFileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) loadFile(e.target.files[0]);
    });
  }

  if (btnDashSample) {
    btnDashSample.addEventListener('click', (e) => {
      e.stopPropagation();
      loadDemoSample();
    });
  }

  // Dropzone Modale Fallback
  if (dropzone) {
    dropzone.addEventListener('click', () => { if (fileInput) fileInput.click(); });
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files.length > 0) loadFile(e.dataTransfer.files[0]);
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) loadFile(e.target.files[0]);
    });
  }

  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      const f = e.dataTransfer.files[0];
      if (f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')) {
        loadFile(f);
      }
    }
  });

  async function loadDemoSample() {
    try {
      showToast('Caricamento contratto dimostrativo...', '⏳');
      const res = await fetch('sample.pdf');
      const blob = await res.blob();
      blob.name = 'contratto_servizi_demo.pdf';
      loadFile(blob);
    } catch (err) {
      showToast('Errore nel caricamento del file demo', '❌');
    }
  }

  if (btnLoadSample) {
    btnLoadSample.addEventListener('click', (e) => {
      e.stopPropagation();
      loadDemoSample();
    });
  }

  async function loadFile(file) {
    originalFilename = file.name || 'documento.pdf';
    currentProjectId = null;
    modalUpload.classList.remove('active');
    showToast(`Caricamento di "${originalFilename}"...`, '📄');

    const reader = new FileReader();
    reader.onload = async function() {
      const rawBuffer = this.result;
      currentPdfBytes = new Uint8Array(rawBuffer.slice(0));

      try {
        const workerBuffer = new Uint8Array(rawBuffer.slice(0));
        currentPdfDoc = await pdfjsLib.getDocument({ data: workerBuffer }).promise;
        currentPageIndex = 0;
        appliedSignatures = [];
        appliedDateStamps = [];
        targetCoords = null;

        await renderCurrentPage();

        if (editorFilenameDisplay) editorFilenameDisplay.textContent = originalFilename;
        if (editorStatusBadge) {
          editorStatusBadge.textContent = '1 File Aperto';
          editorStatusBadge.classList.add('has-doc');
        }

        btnSaveProject.disabled = false;
        btnPrintDoc.disabled = false;
        btnDownloadPdf.disabled = false;
        if (itemDocSave) itemDocSave.disabled = false;
        if (itemDocPrint) itemDocPrint.disabled = false;
        if (itemDocDownload) itemDocDownload.disabled = false;
        viewportWrapper.style.display = 'inline-block';
        floatingControls.style.display = 'flex';

        updateAppliedSignaturesSummary();
        generatePageThumbnails();

        switchView('editor');
        showToast('Documento pronto! Fai clic sulla riga in cui vuoi firmare.', '👆', 4000);

      } catch (err) {
        console.error('Errore apertura PDF:', err);
        showToast('Errore durante l\'apertura del PDF', '❌');
      }
    };
    reader.readAsArrayBuffer(file);
  }

  // ==========================================
  // MINIATURE PAGINE RAPIDE (THUMBNAILS)
  // ==========================================
  async function generatePageThumbnails() {
    thumbnailsContainer.innerHTML = '';
    const numPages = currentPdfDoc.numPages;

    for (let p = 1; p <= numPages; p++) {
      const page = await currentPdfDoc.getPage(p);
      const thumbViewport = page.getViewport({ scale: 0.2 });

      const card = document.createElement('div');
      card.className = `thumbnail-card ${p - 1 === currentPageIndex ? 'active' : ''}`;
      card.id = `thumb-${p - 1}`;

      const tCanvas = document.createElement('canvas');
      tCanvas.width = thumbViewport.width;
      tCanvas.height = thumbViewport.height;

      await page.render({
        canvasContext: tCanvas.getContext('2d'),
        viewport: thumbViewport
      }).promise;

      card.appendChild(tCanvas);

      const numLabel = document.createElement('span');
      numLabel.className = 'thumbnail-number';
      numLabel.textContent = `Pagina ${p}`;
      card.appendChild(numLabel);

      card.onclick = () => {
        currentPageIndex = p - 1;
        renderCurrentPage();
      };

      thumbnailsContainer.appendChild(card);
    }
  }

  function updateActiveThumbnail() {
    document.querySelectorAll('.thumbnail-card').forEach((tc, idx) => {
      tc.classList.toggle('active', idx === currentPageIndex);
    });
  }

  // ==========================================
  // RENDERIZZAZIONE PAGINA & EVENTI CLIC SUL FOGLIO
  // ==========================================
  async function renderCurrentPage() {
    if (!currentPdfDoc) return;

    const page = await currentPdfDoc.getPage(currentPageIndex + 1);
    currentViewport = page.getViewport({ scale: currentScale });

    pdfCanvas.width = currentViewport.width;
    pdfCanvas.height = currentViewport.height;

    await page.render({
      canvasContext: pdfCanvas.getContext('2d'),
      viewport: currentViewport
    }).promise;

    pageNumDisplay.textContent = `Pagina ${currentPageIndex + 1} / ${currentPdfDoc.numPages}`;
    btnPrevPage.disabled = currentPageIndex === 0;
    btnNextPage.disabled = currentPageIndex === currentPdfDoc.numPages - 1;
    zoomDisplay.textContent = `${Math.round(currentScale * 100)}%`;

    updateActiveThumbnail();
    updateTargetBoxPosition();
    updateOverlaysPosition();
  }

  // GESTIONE DEL CLIC SUL DOCUMENTO: FIRMA OPPURE DATA
  viewportWrapper.addEventListener('click', (e) => {
    // Non fare nulla se si clicca su elementi esistenti o controlli
    if (e.target.closest('.signature-overlay-item') || e.target.closest('.date-stamp-item') || e.target.closest('.signature-target-box')) {
      return;
    }

    if (!currentViewport) return;

    const rect = pdfCanvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Converti coordinate del clic in punti PDF
    const [pdfX, pdfY] = currentViewport.convertToPdfPoint(clickX, clickY);

    if (currentTool === 'signature') {
      // MODALITÀ FIRMA: Piazza bersaglio e apri QR Code
      const sigWidth = 175;
      const sigHeight = 65;

      targetCoords = {
        pageIndex: currentPageIndex,
        x: Math.max(20, pdfX - sigWidth / 2),
        y: Math.max(20, pdfY - sigHeight / 2),
        width: sigWidth,
        height: sigHeight
      };

      updateTargetBoxPosition();
      openQrModal();
      showToast(`Punto di firma selezionato! Inquadra il QR con lo smartphone.`, '📱', 3000);

    } else if (currentTool === 'date') {
      // MODALITÀ DATA: Inserisci campo data scrivibile direttamente sul foglio!
      const today = new Date();
      const formatted = today.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });

      const newId = 'date_' + Date.now();
      const newDate = {
        id: newId,
        pageIndex: currentPageIndex,
        x: Math.max(10, pdfX),
        y: Math.max(10, pdfY - 14),
        text: formatted
      };

      appliedDateStamps.push(newDate);
      updateOverlaysPosition();
      updateAppliedSignaturesSummary();

      // Focus sul contenitore della data appena inserita per permettere subito lo spostamento o la modifica
      setTimeout(() => {
        const itemEl = document.getElementById(`date-item-${newId}`);
        if (itemEl) {
          itemEl.focus();
        }
      }, 50);

      showToast('Data inserita! Puoi trascinarla liberamente sulla riga o modificarla.', '📅', 3000);
    }
  });

  function updateTargetBoxPosition() {
    if (!targetCoords || targetCoords.pageIndex !== currentPageIndex) {
      targetBox.style.display = 'none';
      return;
    }

    targetBox.style.display = 'flex';

    const [vx1, vy1] = currentViewport.convertToViewportPoint(targetCoords.x, targetCoords.y + targetCoords.height);
    const [vx2, vy2] = currentViewport.convertToViewportPoint(targetCoords.x + targetCoords.width, targetCoords.y);

    const cssLeft = Math.min(vx1, vx2);
    const cssTop = Math.min(vy1, vy2);
    const cssWidth = Math.abs(vx2 - vx1);
    const cssHeight = Math.abs(vy2 - vy1);

    targetBox.style.left = `${cssLeft}px`;
    targetBox.style.top = `${cssTop}px`;
    targetBox.style.width = `${cssWidth}px`;
    targetBox.style.height = `${cssHeight}px`;

    resizeLiveCanvases();
  }

  // ==========================================
  // APPLICAZIONE FIRMA E OVERLAYS
  // ==========================================
  function handleSignatureReceived(dataUrl) {
    if (!targetCoords) return;

    const newSig = {
      id: 'sig_' + Date.now(),
      pageIndex: targetCoords.pageIndex,
      x: targetCoords.x,
      y: targetCoords.y,
      width: targetCoords.width,
      height: targetCoords.height,
      dataUrl: dataUrl
    };

    appliedSignatures.push(newSig);
    targetCoords = null;
    targetBox.style.display = 'none';

    clearLiveCanvases();
    closeQrModal();
    updateOverlaysPosition();
    updateAppliedSignaturesSummary();

    showToast('Firma inserita con successo nel punto selezionato!', '✅', 4000);
  }

  function updateOverlaysPosition() {
    overlayLayer.innerHTML = '';

    // Render Firme sulla pagina corrente
    appliedSignatures.filter(s => s.pageIndex === currentPageIndex).forEach(sig => {
      const [vx1, vy1] = currentViewport.convertToViewportPoint(sig.x, sig.y + sig.height);
      const [vx2, vy2] = currentViewport.convertToViewportPoint(sig.x + sig.width, sig.y);

      const cssLeft = Math.min(vx1, vx2);
      const cssTop = Math.min(vy1, vy2);
      const cssWidth = Math.abs(vx2 - vx1);
      const cssHeight = Math.abs(vy2 - vy1);

      const sigDiv = document.createElement('div');
      sigDiv.className = 'signature-overlay-item selected';
      sigDiv.style.left = `${cssLeft}px`;
      sigDiv.style.top = `${cssTop}px`;
      sigDiv.style.width = `${cssWidth}px`;
      sigDiv.style.height = `${cssHeight}px`;

      const img = document.createElement('img');
      img.src = sig.dataUrl;
      sigDiv.appendChild(img);

      const delBtn = document.createElement('button');
      delBtn.className = 'signature-delete-btn';
      delBtn.innerHTML = '&times;';
      delBtn.title = 'Rimuovi questa firma';
      delBtn.onclick = (e) => {
        e.stopPropagation();
        appliedSignatures = appliedSignatures.filter(s => s.id !== sig.id);
        updateOverlaysPosition();
        updateAppliedSignaturesSummary();
        showToast('Firma rimossa', '🗑️');
      };
      sigDiv.appendChild(delBtn);

      const handleSe = document.createElement('div');
      handleSe.className = 'signature-handle handle-se';
      sigDiv.appendChild(handleSe);

      setupOverlayDragAndResize(sigDiv, handleSe, sig);
      overlayLayer.appendChild(sigDiv);
    });

    // Render Campi Data / Testo scrivibili sulla pagina corrente
    appliedDateStamps.filter(d => d.pageIndex === currentPageIndex).forEach(dt => {
      const [vx, vy] = currentViewport.convertToViewportPoint(dt.x, dt.y + 14);

      const dateDiv = document.createElement('div');
      dateDiv.className = 'date-stamp-item';
      dateDiv.id = `date-item-${dt.id}`;
      dateDiv.tabIndex = 0;
      dateDiv.style.left = `${vx}px`;
      dateDiv.style.top = `${vy}px`;

      const controlsDiv = document.createElement('div');
      controlsDiv.className = 'date-stamp-controls';

      const dragHandle = document.createElement('span');
      dragHandle.className = 'date-stamp-drag-handle';
      dragHandle.title = 'Trascina con il mouse per allineare sulla riga (o usa le frecce)';
      dragHandle.innerHTML = `
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="9" cy="5" r="1.5"></circle><circle cx="9" cy="12" r="1.5"></circle><circle cx="9" cy="19" r="1.5"></circle>
          <circle cx="15" cy="5" r="1.5"></circle><circle cx="15" cy="12" r="1.5"></circle><circle cx="15" cy="19" r="1.5"></circle>
        </svg>
        <span>Sposta</span>
      `;

      const delBtn = document.createElement('span');
      delBtn.className = 'date-stamp-delete';
      delBtn.innerHTML = '&times;';
      delBtn.title = 'Elimina data';

      controlsDiv.appendChild(dragHandle);
      controlsDiv.appendChild(delBtn);

      const inputWrap = document.createElement('div');
      inputWrap.className = 'date-stamp-input-wrap';

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'date-stamp-input';
      input.id = `input-${dt.id}`;
      input.value = dt.text || '';
      input.placeholder = 'GG/MM/AAAA';
      input.spellcheck = false;
      input.autocomplete = 'off';

      const updateInputWidth = () => {
        const len = Math.max(10, (input.value || '').length);
        input.style.width = (len * 8.8 + 14) + 'px';
      };
      updateInputWidth();

      input.addEventListener('input', (e) => {
        dt.text = e.target.value;
        updateInputWidth();
      });

      inputWrap.appendChild(input);
      dateDiv.appendChild(controlsDiv);
      dateDiv.appendChild(inputWrap);

      setupDateItemInteractions(dateDiv, input, dragHandle, delBtn, dt);
      overlayLayer.appendChild(dateDiv);
    });
  }

  function setupOverlayDragAndResize(el, handle, sigData) {
    let isMoving = false;
    let isResizing = false;
    let startX, startY, startW, startH, startLeft, startTop;

    el.addEventListener('mousedown', (e) => {
      if (e.target === handle) return;
      isMoving = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = parseFloat(el.style.left);
      startTop = parseFloat(el.style.top);
      e.stopPropagation();
    });

    handle.addEventListener('mousedown', (e) => {
      isResizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startW = parseFloat(el.style.width);
      startH = parseFloat(el.style.height);
      e.stopPropagation();
    });

    window.addEventListener('mousemove', (e) => {
      if (isMoving) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const newLeft = startLeft + dx;
        const newTop = startTop + dy;
        el.style.left = `${newLeft}px`;
        el.style.top = `${newTop}px`;

        const [pdfX, pdfY] = currentViewport.convertToPdfPoint(newLeft, newTop);
        sigData.x = pdfX;
        sigData.y = pdfY - sigData.height;
      } else if (isResizing) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const newW = Math.max(60, startW + dx);
        const newH = Math.max(30, startH + dy);
        el.style.width = `${newW}px`;
        el.style.height = `${newH}px`;

        sigData.width = newW / currentScale;
        sigData.height = newH / currentScale;
      }
    });

    window.addEventListener('mouseup', () => {
      isMoving = false;
      isResizing = false;
    });
  }

  function setupDateItemInteractions(dateDiv, input, dragHandle, delBtn, dt) {
    let isMouseDown = false;
    let isDragging = false;
    let startX = 0, startY = 0;
    let startLeft = 0, startTop = 0;
    const DRAG_THRESHOLD = 3;

    // Rimozione campo data
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      appliedDateStamps = appliedDateStamps.filter(item => item.id !== dt.id);
      updateOverlaysPosition();
      updateAppliedSignaturesSummary();
      showToast('Data rimossa', '🗑️');
    });
    delBtn.addEventListener('mousedown', (e) => e.stopPropagation());

    function startDragCheck(clientX, clientY, isImmediate) {
      isMouseDown = true;
      isDragging = isImmediate;
      startX = clientX;
      startY = clientY;
      startLeft = parseFloat(dateDiv.style.left) || 0;
      startTop = parseFloat(dateDiv.style.top) || 0;

      if (isImmediate) {
        dateDiv.classList.add('is-dragging');
      }
    }

    function moveDrag(clientX, clientY) {
      if (!isMouseDown) return;
      const dx = clientX - startX;
      const dy = clientY - startY;

      if (!isDragging) {
        if (Math.hypot(dx, dy) >= DRAG_THRESHOLD) {
          isDragging = true;
          dateDiv.classList.add('is-dragging');
          if (document.activeElement === input) {
            input.blur();
          }
        }
      }

      if (isDragging) {
        const newLeft = startLeft + dx;
        const newTop = startTop + dy;
        dateDiv.style.left = `${newLeft}px`;
        dateDiv.style.top = `${newTop}px`;

        const [pdfX, pdfY] = currentViewport.convertToPdfPoint(newLeft, newTop);
        dt.x = pdfX;
        dt.y = pdfY - 14;
      }
    }

    function endDrag(e) {
      if (isMouseDown) {
        if (isDragging) {
          dateDiv.classList.remove('is-dragging');
          if (e) {
            e.stopPropagation();
            e.preventDefault();
          }
        }
        isMouseDown = false;
        isDragging = false;
      }
    }

    // Trascinamento rapido dalla maniglia "Sposta"
    dragHandle.addEventListener('mousedown', (e) => {
      startDragCheck(e.clientX, e.clientY, true);
      e.stopPropagation();
      e.preventDefault();
    });

    // Clic e trascinamento sul box o sul testo
    dateDiv.addEventListener('mousedown', (e) => {
      if (e.target === delBtn) return;
      if (e.target === input) {
        // Se si clicca sul testo: se si muove il mouse diventa trascinamento, se si rilascia subito permette la digitazione
        startDragCheck(e.clientX, e.clientY, false);
      } else {
        startDragCheck(e.clientX, e.clientY, true);
        e.stopPropagation();
        e.preventDefault();
      }
    });

    // Supporto schermi touch / stylus su PC
    dragHandle.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        startDragCheck(e.touches[0].clientX, e.touches[0].clientY, true);
        e.stopPropagation();
      }
    }, { passive: false });

    dateDiv.addEventListener('touchstart', (e) => {
      if (e.target === delBtn) return;
      if (e.touches.length === 1) {
        startDragCheck(e.touches[0].clientX, e.touches[0].clientY, e.target !== input);
        if (e.target !== input) e.stopPropagation();
      }
    }, { passive: true });

    window.addEventListener('mousemove', (e) => {
      if (isMouseDown) moveDrag(e.clientX, e.clientY);
    });

    window.addEventListener('touchmove', (e) => {
      if (isMouseDown && e.touches.length === 1) {
        moveDrag(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchend', endDrag);

    // Spostamento millimetrico con i tasti freccia (Nudge)
    function nudgePosition(dx, dy) {
      const curLeft = parseFloat(dateDiv.style.left) || 0;
      const curTop = parseFloat(dateDiv.style.top) || 0;
      const newLeft = curLeft + dx;
      const newTop = curTop + dy;
      dateDiv.style.left = `${newLeft}px`;
      dateDiv.style.top = `${newTop}px`;

      const [pdfX, pdfY] = currentViewport.convertToPdfPoint(newLeft, newTop);
      dt.x = pdfX;
      dt.y = pdfY - 14;
    }

    dateDiv.addEventListener('keydown', (e) => {
      const step = e.shiftKey ? 5 : 1;
      if (document.activeElement === input) {
        if (e.key === 'Enter' || e.key === 'Escape') {
          input.blur();
          dateDiv.focus();
          e.preventDefault();
        } else if (e.altKey || e.ctrlKey) {
          if (e.key === 'ArrowUp') { nudgePosition(0, -step); e.preventDefault(); }
          if (e.key === 'ArrowDown') { nudgePosition(0, step); e.preventDefault(); }
          if (e.key === 'ArrowLeft') { nudgePosition(-step, 0); e.preventDefault(); }
          if (e.key === 'ArrowRight') { nudgePosition(step, 0); e.preventDefault(); }
        } else if (e.key === 'ArrowUp') {
          nudgePosition(0, -step);
          e.preventDefault();
        } else if (e.key === 'ArrowDown') {
          nudgePosition(0, step);
          e.preventDefault();
        }
      } else {
        if (e.key === 'ArrowUp') { nudgePosition(0, -step); e.preventDefault(); }
        else if (e.key === 'ArrowDown') { nudgePosition(0, step); e.preventDefault(); }
        else if (e.key === 'ArrowLeft') { nudgePosition(-step, 0); e.preventDefault(); }
        else if (e.key === 'ArrowRight') { nudgePosition(step, 0); e.preventDefault(); }
        else if (e.key === 'Delete' || e.key === 'Backspace') {
          delBtn.click();
          e.preventDefault();
        } else if (e.key === 'Enter') {
          input.focus();
          e.preventDefault();
        }
      }
    });

    input.addEventListener('click', (e) => {
      if (!isDragging) {
        e.stopPropagation();
      }
    });
  }

  function updateAppliedSignaturesSummary() {
    const totalItems = appliedSignatures.length + appliedDateStamps.length;
    if (badgeElementsCount) badgeElementsCount.textContent = totalItems;
    if (totalItems === 0) {
      appliedSignaturesList.innerHTML = 'Nessun elemento ancora inserito.<br>Fai clic sul foglio per iniziare.';
    } else {
      let html = '';
      appliedSignatures.forEach((sig, idx) => {
        html += `
          <div style="display:flex; justify-content:space-between; align-items:center; padding: 3px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
            <span>✍️ Firma ${idx + 1} (Pag. ${sig.pageIndex + 1})</span>
            <span style="color:#10b981; font-weight:600;">✓ Inserita</span>
          </div>
        `;
      });
      appliedDateStamps.forEach((dt, idx) => {
        html += `
          <div style="display:flex; justify-content:space-between; align-items:center; padding: 3px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
            <span>📅 Data ${idx + 1} (Pag. ${dt.pageIndex + 1})</span>
            <span style="color:#60a5fa; font-weight:600;">✓ Inserita</span>
          </div>
        `;
      });
      appliedSignaturesList.innerHTML = html;
    }
  }

  // ==========================================
  // SALVATAGGIO & GESTIONE DASHBOARD PROGETTI
  // ==========================================

  // Aggiorna contatore badge nella vista
  async function updateProjectsBadgeCount() {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      dashboardCountBadge.textContent = (data.projects || []).length;
    } catch (err) {}
  }

  let allProjects = [];

    // Ricerca dinamica
    if (dashboardSearchInput) {
      dashboardSearchInput.addEventListener('input', () => {
        applyProjectFiltersAndRender();
      });
    }

    // Filtri pillola
    function setupFilterPills() {
      const pills = [
        { el: filterPillAll, key: 'all' },
        { el: filterPillSigned, key: 'signed' },
        { el: filterPillDrafts, key: 'drafts' }
      ];

      pills.forEach(({ el, key }) => {
        if (!el) return;
        el.addEventListener('click', () => {
          pills.forEach(p => p.el && p.el.classList.remove('active'));
          el.classList.add('active');
          currentFilter = key;
          applyProjectFiltersAndRender();
        });
      });
    }
    setupFilterPills();

    async function loadProjectsDashboard() {
      try {
        if (projectsGrid) {
          projectsGrid.innerHTML = '<div style="color:var(--text-muted); text-align:center; padding:40px; grid-column:1/-1;">Caricamento archivio progetti...</div>';
        }
        const res = await fetch('/api/projects');
        const data = await res.json();
        allProjects = data.projects || [];
        
        // Calcolo KPI
        const total = allProjects.length;
        const signed = allProjects.filter(p => p.hasSignedPdf || p.signaturesCount > 0).length;
        const drafts = total - signed;
        const totalSigs = allProjects.reduce((sum, p) => sum + (p.signaturesCount || 0) + (p.datesCount || 0), 0);

        if (statTotalProjects) statTotalProjects.textContent = total;
        if (statSignedProjects) statSignedProjects.textContent = signed;
        if (statDraftProjects) statDraftProjects.textContent = drafts;
        if (statTotalSignatures) statTotalSignatures.textContent = totalSigs;

        if (navProjectsCount) navProjectsCount.textContent = total;
        if (filterCountAll) filterCountAll.textContent = total;
        if (filterCountSigned) filterCountSigned.textContent = signed;
        if (filterCountDrafts) filterCountDrafts.textContent = drafts;

        applyProjectFiltersAndRender();
      } catch (err) {
        console.error('Errore caricamento dashboard:', err);
        if (projectsGrid) {
          projectsGrid.innerHTML = '<div style="color:#ef4444; text-align:center; padding:40px; grid-column:1/-1;">Errore durante il caricamento dei progetti.</div>';
        }
      }
    }

    function applyProjectFiltersAndRender() {
      const q = (dashboardSearchInput ? dashboardSearchInput.value : '').toLowerCase().trim();
      let filtered = allProjects.filter(p => p.name.toLowerCase().includes(q));

      if (currentFilter === 'signed') {
        filtered = filtered.filter(p => p.hasSignedPdf || p.signaturesCount > 0);
      } else if (currentFilter === 'drafts') {
        filtered = filtered.filter(p => !p.hasSignedPdf && (!p.signaturesCount || p.signaturesCount === 0));
      }

      renderProjectsList(filtered);
    }

    function renderProjectsList(projects) {
      if (!projectsGrid) return;
      if (projects.length === 0) {
        projectsGrid.innerHTML = `
          <div class="project-empty-state">
            <div style="font-size: 44px; margin-bottom: 12px;">📁</div>
            <h3 style="color:#fff; font-size: 18px; margin-bottom: 6px;">Nessun progetto trovato</h3>
            <p style="color:var(--text-muted); font-size: 13.5px; margin-bottom: 20px;">Trascina un file PDF nell'area sopra oppure clicca sul pulsante qui sotto per iniziare.</p>
            <button class="toolbar-btn btn-primary" onclick="document.getElementById('dash-file-input').click();">
              + Crea Nuovo Progetto PDF
            </button>
          </div>
        `;
        return;
      }

      projectsGrid.innerHTML = '';
      projects.forEach(p => {
        const card = document.createElement('div');
        card.className = 'project-card';
        const dateFormatted = new Date(p.updatedAt).toLocaleString('it-IT', { dateStyle: 'medium', timeStyle: 'short' });

        card.innerHTML = `
          <div class="project-thumb-box">
            <img src="/api/projects/${p.id}/thumbnail" alt="Anteprima ${p.name}" onerror="this.parentElement.innerHTML='<div class=\\'project-thumb-placeholder\\'>📄</div>'">
          </div>
          <div class="project-info">
            <div class="project-name" title="${p.name}">${p.name}</div>
            <div class="project-meta">
              <span>🕒 ${dateFormatted}</span>
            </div>
            <div class="project-badges">
              <span class="project-badge ${p.signaturesCount > 0 ? 'success' : ''}">✍️ ${p.signaturesCount} ${p.signaturesCount === 1 ? 'Firma' : 'Firme'}</span>
              ${p.datesCount > 0 ? `<span class="project-badge">📅 ${p.datesCount} ${p.datesCount === 1 ? 'Data' : 'Date'}</span>` : ''}
            </div>
            <div class="project-actions">
              <button class="toolbar-btn btn-primary btn-open-proj" data-id="${p.id}" title="Riapri nell'editor">
                <span>📂 Apri</span>
              </button>
              ${p.hasSignedPdf ? `
                <a href="/api/projects/${p.id}/download" class="toolbar-btn btn-success" style="text-decoration:none;" title="Scarica PDF finale firmato">
                  <span>📥 Scarica</span>
                </a>
              ` : ''}
              <button class="btn-delete-proj" data-id="${p.id}" title="Elimina progetto dall'archivio">
                🗑️
              </button>
            </div>
          </div>
        `;

        card.querySelector('.btn-open-proj').onclick = () => openProjectFromDashboard(p.id);

        card.querySelector('.btn-delete-proj').onclick = async () => {
          if (confirm(`Vuoi davvero eliminare definitivamente "${p.name}" dall'archivio?`)) {
            try {
              await fetch(`/api/projects/${p.id}`, { method: 'DELETE' });
              showToast('Progetto eliminato dall\'archivio', '🗑️');
              loadProjectsDashboard();
            } catch (err) {
              showToast('Errore durante l\'eliminazione', '❌');
            }
          }
        };

        projectsGrid.appendChild(card);
      });
    }

    // Gestione Scorciatoie da Tastiera Globali
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' && e.key !== 'Escape') return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (!btnSaveProject.disabled) btnSaveProject.click();
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        if (!btnPrintDoc.disabled) btnPrintDoc.click();
      }

      if (e.key === 'Escape') {
        closeQrModal();
        modalUpload.classList.remove('active');
      }
    });

  // Riapri un progetto salvato nell'editor
  async function openProjectFromDashboard(projId) {
    try {
      showToast('Caricamento progetto in corso...', '⏳');
      const res = await fetch(`/api/projects/${projId}`);
      if (!res.ok) throw new Error('Progetto non trovato');
      const data = await res.json();

      currentProjectId = projId;
      originalFilename = data.metadata.name;
      appliedSignatures = data.metadata.appliedSignatures || [];
      appliedDateStamps = data.metadata.appliedDateStamps || [];

      // Converti Base64 in Uint8Array
      const binaryString = atob(data.originalPdfBase64.replace(/^data:application\/pdf;base64,/, ''));
      const len = binaryString.length;
      currentPdfBytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        currentPdfBytes[i] = binaryString.charCodeAt(i);
      }

      const workerBuffer = new Uint8Array(currentPdfBytes.slice(0));
      currentPdfDoc = await pdfjsLib.getDocument({ data: workerBuffer }).promise;
      currentPageIndex = 0;
      targetCoords = null;

      if (editorFilenameDisplay) editorFilenameDisplay.textContent = originalFilename;
      if (editorStatusBadge) {
        editorStatusBadge.textContent = '1 File Aperto';
        editorStatusBadge.classList.add('has-doc');
      }

      await renderCurrentPage();
      btnSaveProject.disabled = false;
      btnPrintDoc.disabled = false;
      btnDownloadPdf.disabled = false;
      viewportWrapper.style.display = 'inline-block';
      floatingControls.style.display = 'flex';

      updateAppliedSignaturesSummary();
      generatePageThumbnails();

      switchView('editor');
      showToast(`Progetto "${originalFilename}" caricato con successo!`, '📂');
    } catch (err) {
      console.error('Errore riapertura progetto:', err);
      showToast('Errore durante l\'apertura del progetto', '❌');
    }
  }

  // ==========================================
  // TOUCHPAD STANDALONE SU PC (DIRETTO)
  // ==========================================
  let standaloneCanvasInited = false;
  let standaloneCtx = null;
  let standaloneDrawing = false;
  let standaloneColor = '#0f172a';

  function initStandalonePad() {
    if (standaloneCanvasInited) return;
    const canvas = document.getElementById('standalone-sig-canvas');
    if (!canvas) return;

    standaloneCanvasInited = true;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width > 50 ? rect.width : 750;
    const h = rect.height > 50 ? rect.height : 320;
    canvas.width = w * (window.devicePixelRatio || 1);
    canvas.height = h * (window.devicePixelRatio || 1);
    standaloneCtx = canvas.getContext('2d');
    standaloneCtx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    standaloneCtx.lineCap = 'round';
    standaloneCtx.lineJoin = 'round';

    function getCoords(e) {
      const r = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: clientX - r.left, y: clientY - r.top };
    }

    function startDraw(e) {
      standaloneDrawing = true;
      const pt = getCoords(e);
      standaloneCtx.beginPath();
      standaloneCtx.moveTo(pt.x, pt.y);
      standaloneCtx.strokeStyle = standaloneColor;
      standaloneCtx.lineWidth = 3.5;
    }

    function moveDraw(e) {
      if (!standaloneDrawing) return;
      const pt = getCoords(e);
      standaloneCtx.lineTo(pt.x, pt.y);
      standaloneCtx.stroke();
    }

    function endDraw() {
      standaloneDrawing = false;
    }

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', moveDraw);
    window.addEventListener('mouseup', endDraw);

    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startDraw(e); }, { passive: false });
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); moveDraw(e); }, { passive: false });
    canvas.addEventListener('touchend', endDraw);

    document.querySelectorAll('.ink-btn-opt').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.ink-btn-opt').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        standaloneColor = btn.dataset.color || '#0f172a';
      };
    });

    const clearBtn = document.getElementById('btn-clear-standalone-pad');
    if (clearBtn) {
      clearBtn.onclick = () => {
        standaloneCtx.clearRect(0, 0, canvas.width, canvas.height);
      };
    }

    const downloadBtn = document.getElementById('btn-download-standalone-sign');
    if (downloadBtn) {
      downloadBtn.onclick = () => {
        const link = document.createElement('a');
        link.download = 'firma_docutouch.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast('Firma esportata in PNG trasparente!', '💾');
      };
    }
  }

  // Avvio iniziale sulla Dashboard
  initWebSocket();
  loadNetworkInfo();
  switchView('dashboard');

  // Salva Progetto Corrente nel Server locale
  btnSaveProject.addEventListener('click', async () => {
    if (!currentPdfBytes) return;

    try {
      showToast('Salvataggio progetto nell\'archivio...', '💾');

      // Genera il PDF firmato finale se ci sono elementi
      let finalPdfBase64 = null;
      if (appliedSignatures.length > 0 || appliedDateStamps.length > 0) {
        const finalBytes = await generateFinalPdfBytes();
        finalPdfBase64 = uint8ArrayToBase64(finalBytes);
      }

      // Converti PDF originale in base64
      const originalPdfBase64 = uint8ArrayToBase64(currentPdfBytes);

      // Crea miniatura ad alta risoluzione del canvas corrente
      const thumbnailBase64 = pdfCanvas.toDataURL('image/png');

      const payload = {
        id: currentProjectId || ('proj_' + Date.now()),
        name: originalFilename,
        originalPdfBase64: `data:application/pdf;base64,${originalPdfBase64}`,
        finalPdfBase64: finalPdfBase64 ? `data:application/pdf;base64,${finalPdfBase64}` : null,
        thumbnailBase64: thumbnailBase64,
        appliedSignatures: appliedSignatures,
        appliedDateStamps: appliedDateStamps
      };

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (result.success) {
        currentProjectId = result.project.id;
        updateProjectsBadgeCount();
        showToast('Progetto salvato con successo nella tua Dashboard!', '🎉', 4000);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Errore salvataggio:', err);
      showToast('Errore durante il salvataggio del progetto', '❌');
    }
  });

  function uint8ArrayToBase64(bytes) {
    if (!bytes || bytes.byteLength === 0) return '';
    let binary = '';
    const chunkSize = 8192;
    const len = bytes.byteLength;
    for (let i = 0; i < len; i += chunkSize) {
      const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
      binary += String.fromCharCode.apply(null, chunk);
    }
    return btoa(binary);
  }

  // ==========================================
  // SALVATAGGIO & STAMPA PDF DEFINITIVO (pdf-lib)
  // ==========================================
  function sanitizePdfText(str) {
    if (!str) return '';
    return str
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2013\u2014]/g, '-')
      .replace(/\u2026/g, '...')
      .replace(/\u00A0/g, ' ')
      .replace(/[^\x20-\x7E\xA0-\xFF]/g, '');
  }

  async function generateFinalPdfBytes() {
    if (!currentPdfBytes || currentPdfBytes.byteLength === 0) {
      throw new Error('I dati del PDF originale non sono presenti in memoria. Ricarica il file.');
    }

    const { PDFDocument, rgb, StandardFonts } = PDFLib;
    const pdfDoc = await PDFDocument.load(currentPdfBytes.slice(0), { ignoreEncryption: true });
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    pdfDoc.setTitle(`${(originalFilename || 'Documento').replace(/\.pdf$/i, '')} - Firmato`);
    pdfDoc.setProducer('DocuTouchPDF');
    pdfDoc.setModificationDate(new Date());

    // Applica tutte le firme
    for (const sig of appliedSignatures) {
      if (!sig.dataUrl) continue;
      try {
        const pngImage = await pdfDoc.embedPng(sig.dataUrl);
        const page = pdfDoc.getPage(sig.pageIndex);
        const x = Number(sig.x) || 0;
        const y = Number(sig.y) || 0;
        const width = Math.max(10, Number(sig.width) || 150);
        const height = Math.max(10, Number(sig.height) || 60);

        page.drawImage(pngImage, { x, y, width, height });
      } catch (sigErr) {
        console.warn('Avviso inserimento firma:', sigErr);
      }
    }

    // Applica tutti i campi data / testo digitati
    for (const dt of appliedDateStamps) {
      if (!dt.text || !dt.text.trim()) continue;
      try {
        const page = pdfDoc.getPage(dt.pageIndex);
        const safeText = sanitizePdfText(dt.text);
        const x = Number(dt.x) || 0;
        const y = Number(dt.y) || 0;

        page.drawText(safeText, {
          x: x + 3,
          y: y + 2,
          size: 11,
          font: font,
          color: rgb(0.1, 0.12, 0.18)
        });
      } catch (dtErr) {
        console.warn('Avviso inserimento data:', dtErr);
      }
    }

    return await pdfDoc.save();
  }

  btnDownloadPdf.addEventListener('click', async () => {
    if (!currentPdfBytes || currentPdfBytes.byteLength === 0) {
      showToast('Documento non trovato in memoria. Ricarica il file.', '⚠️');
      return;
    }
    if (appliedSignatures.length === 0 && appliedDateStamps.length === 0) {
      alert('Non hai ancora applicato alcuna firma o data al documento!');
      return;
    }

    try {
      showToast('Generazione PDF definitivo ad alta fedeltà...', '⏳');
      const modifiedPdfBytes = await generateFinalPdfBytes();

      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      const baseName = (originalFilename || 'documento').replace(/\.pdf$/i, '');
      link.download = `${baseName}_firmato.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      showToast('PDF firmato scaricato con successo!', '🎉');
    } catch (err) {
      console.error('Errore generazione PDF:', err);
      showToast(`Errore creazione PDF: ${err.message || 'Verifica il file'}`, '❌', 5000);
    }
  });

  // Stampa Diretta
  btnPrintDoc.addEventListener('click', async () => {
    if (!currentPdfBytes) return;
    try {
      showToast('Apertura anteprima di stampa...', '🖨️');
      const modifiedPdfBytes = await generateFinalPdfBytes();
      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);

      const printIframe = document.createElement('iframe');
      printIframe.style.position = 'fixed';
      printIframe.style.right = '0';
      printIframe.style.bottom = '0';
      printIframe.style.width = '0';
      printIframe.style.height = '0';
      printIframe.style.border = '0';
      printIframe.src = blobUrl;
      document.body.appendChild(printIframe);

      printIframe.onload = () => {
        setTimeout(() => {
          printIframe.contentWindow.focus();
          printIframe.contentWindow.print();
        }, 300);
      };
    } catch (err) {
      showToast('Errore durante la stampa', '❌');
    }
  });

  // ==========================================
  // CONTROLLI MODAL QR & PAGINAZIONE
  // ==========================================
  function openQrModal() {
    modalQr.classList.add('active');
    setTimeout(resizeLiveCanvases, 100);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'desktop-new-target', sessionId }));
    }
  }

  function closeQrModal() {
    modalQr.classList.remove('active');
  }

  btnCloseQr.addEventListener('click', closeQrModal);

  btnPrevPage.addEventListener('click', () => {
    if (currentPageIndex > 0) {
      currentPageIndex--;
      renderCurrentPage();
    }
  });

  btnNextPage.addEventListener('click', () => {
    if (currentPdfDoc && currentPageIndex < currentPdfDoc.numPages - 1) {
      currentPageIndex++;
      renderCurrentPage();
    }
  });

  btnZoomIn.addEventListener('click', () => {
    if (currentScale < 2.5) {
      currentScale += 0.25;
      renderCurrentPage();
    }
  });

  btnZoomOut.addEventListener('click', () => {
    if (currentScale > 0.6) {
      currentScale -= 0.25;
      renderCurrentPage();
    }
  });

})();
