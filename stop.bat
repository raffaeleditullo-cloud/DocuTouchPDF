@echo off
title Arresto DocuTouchPDF
powershell -NoProfile -Command "try { Invoke-RestMethod -Uri 'http://localhost:3000/api/shutdown' -Method POST -TimeoutSec 2 | Out-Null } catch {}"
echo DocuTouchPDF e' stato arrestato correttamente.
timeout /t 2 >nul
