@echo off
title DocuTouchPDF PRO - Firma & Gestione PDF
cd /d "%~dp0"

:: 1. Verifica ambiente di esecuzione Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ================================================================
    echo [ERRORE] Node.js non e' installato o non e' presente nel PATH.
    echo Per favore installa Node.js da https://nodejs.org
    echo ================================================================
    pause
    exit /b 1
)

:: 2. Avvia tramite il launcher pulito e invisibile
start "" wscript.exe "%~dp0DocuTouchPDF.vbs"
exit /b 0
