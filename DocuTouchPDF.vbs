' =========================================================================
' DocuTouchPDF PRO Launcher (100% Antivirus & McAfee Safe)
' Avvia l'applicazione nativamente in modalita App senza finestre nere
' =========================================================================

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
strDir = fso.GetParentFolderName(WScript.ScriptFullName)

' 1. Verifica se il server e' gia' attivo su localhost:3000
Dim serverActive
serverActive = False

On Error Resume Next
Set http = CreateObject("MSXML2.ServerXMLHTTP.6.0")
http.Open "GET", "http://localhost:3000/api/info", False
http.setTimeouts 600, 600, 600, 600
http.Send
If http.Status = 200 Then
    serverActive = True
End If
On Error GoTo 0

' 2. Se non e' attivo, avvialo in background
If Not serverActive Then
    WshShell.CurrentDirectory = strDir
    WshShell.Run "cmd.exe /c cd /d """ & strDir & """ && node server.js", 0, False
    
    ' Attesa attiva di risposta dal server (fino a 6 secondi)
    Dim i
    For i = 1 To 12
        WScript.Sleep 500
        On Error Resume Next
        Set http = CreateObject("MSXML2.ServerXMLHTTP.6.0")
        http.Open "GET", "http://localhost:3000/api/info", False
        http.setTimeouts 400, 400, 400, 400
        http.Send
        If http.Status = 200 Then
            serverActive = True
            Exit For
        End If
        On Error GoTo 0
    Next
End If

' 3. Apri la finestra dell'applicazione come App Desktop (Microsoft Edge / Chrome / Browser predefinito)
Dim edgePathX86, edgePathX64, chromePathX64, chromePathX86
edgePathX86 = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
edgePathX64 = "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
chromePathX64 = "C:\Program Files\Google\Chrome\Application\chrome.exe"
chromePathX86 = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"

If fso.FileExists(edgePathX86) Then
    WshShell.Run """" & edgePathX86 & """ --app=http://localhost:3000", 1, False
ElseIf fso.FileExists(edgePathX64) Then
    WshShell.Run """" & edgePathX64 & """ --app=http://localhost:3000", 1, False
ElseIf fso.FileExists(chromePathX64) Then
    WshShell.Run """" & chromePathX64 & """ --app=http://localhost:3000", 1, False
ElseIf fso.FileExists(chromePathX86) Then
    WshShell.Run """" & chromePathX86 & """ --app=http://localhost:3000", 1, False
Else
    WshShell.Run "http://localhost:3000", 1, False
End If
