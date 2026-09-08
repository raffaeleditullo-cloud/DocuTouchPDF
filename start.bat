@echo off
title DocuTouchPDF - Firma & Gestione PDF
color 0B
cls
echo ================================================================
echo                     DOCUTOUCHPDF v1.0                           
echo         Firma Digitale con Smartphone & Gestione Progetti       
echo ================================================================
echo.
echo [1/2] Verifica ambiente di esecuzione Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRORE] Node.js non e' installato o non e' presente nel PATH.
    echo Per favore installa Node.js da https://nodejs.org
    pause
    exit /b
)

echo [2/2] Avvio del server e apertura del browser...
echo.
echo   -> PC Desktop:     http://localhost:3000
echo   -> Smartphone:     Inquadra il QR Code a schermo
echo.
echo Per chiudere l'applicazione premi Ctrl+C o chiudi questa finestra.
echo ================================================================
echo.

start http://localhost:3000
node server.js
pause
