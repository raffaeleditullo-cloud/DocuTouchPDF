; Script Inno Setup per DocuTouchPDF PRO v1.0
; Configurato per installazione nativa Windows 100% sicura e compatibile con Antivirus

#define MyAppName "DocuTouchPDF PRO"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "DocuTouchPDF"
#define MyAppURL "https://github.com/raffaeleditullo-cloud/DocuTouchPDF"

[Setup]
AppId={{D0C0700C-4DF7-4B21-82A9-D0C0700CD1F0}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
OutputDir=installer_output
OutputBaseFilename=DocuTouchPDF_Setup_v1.0.0
SetupIconFile=public\assets\app.ico
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog
UninstallDisplayIcon={app}\public\assets\app.ico
VersionInfoVersion=1.0.0.0
VersionInfoCompany=DocuTouchPDF
VersionInfoDescription=DocuTouchPDF PRO Suite di Firma & Gestione PDF
VersionInfoProductName=DocuTouchPDF PRO

[Languages]
Name: "italian"; MessagesFile: "compiler:Languages\Italian.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"

[Files]
Source: "DocuTouchPDF.vbs"; DestDir: "{app}"; Flags: ignoreversion
Source: "server.js"; DestDir: "{app}"; Flags: ignoreversion
Source: "package.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "package-lock.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "README.md"; DestDir: "{app}"; Flags: ignoreversion
Source: "start.bat"; DestDir: "{app}"; Flags: ignoreversion
Source: "stop.bat"; DestDir: "{app}"; Flags: ignoreversion
Source: "public\*"; DestDir: "{app}\public"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "node_modules\*"; DestDir: "{app}\node_modules"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "scripts\*"; DestDir: "{app}\scripts"; Flags: ignoreversion recursesubdirs createallsubdirs

[Dirs]
Name: "{app}\saved_projects"; Permissions: users-full

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{win}\System32\wscript.exe"; Parameters: """{app}\DocuTouchPDF.vbs"""; WorkingDir: "{app}"; IconFilename: "{app}\public\assets\app.ico"
Name: "{group}\Cartella Progetti Salvati"; Filename: "{app}\saved_projects"
Name: "{group}\Arresta {#MyAppName}"; Filename: "{app}\stop.bat"; IconFilename: "{app}\public\assets\app.ico"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{win}\System32\wscript.exe"; Parameters: """{app}\DocuTouchPDF.vbs"""; WorkingDir: "{app}"; IconFilename: "{app}\public\assets\app.ico"; Tasks: desktopicon

[Run]
Filename: "{win}\System32\wscript.exe"; Parameters: """{app}\DocuTouchPDF.vbs"""; WorkingDir: "{app}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent
