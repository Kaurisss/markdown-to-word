#define AppVersion "2.0.0"
#define AppExe "app.exe"
#define Publisher "kauriss"
#define AppId "{{9B9A7D8E-9E90-4B68-A71A-8CFC61D2A6B6}}"
#define OutputName "MarkdownToWord_" + AppVersion + "_x64"

[Setup]
AppId={#AppId}
AppName={cm:AppName}
AppVersion={#AppVersion}
AppPublisher={#Publisher}
DefaultDirName={autopf}\MarkdownToWord
DefaultGroupName={cm:AppName}
DisableProgramGroupPage=yes
OutputDir=..\src-tauri\target\release\bundle\inno
OutputBaseFilename={#OutputName}
SetupIconFile=..\src-tauri\icons\icon.ico
WizardImageFile=..\src-tauri\icons\sidebar.png
Compression=lzma2
SolidCompression=yes
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64
UninstallDisplayIcon={app}\{#AppExe}
DisableWelcomePage=no
DisableFinishedPage=no

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "chinesesimplified"; MessagesFile: "compiler:Languages\ChineseSimplified.isl"

[CustomMessages]
english.AppName=Markdown to Word
chinesesimplified.AppName=简阅转档
english.DesktopTask=Create a desktop shortcut
chinesesimplified.DesktopTask=创建桌面快捷方式
english.AdditionalTasks=Additional tasks
chinesesimplified.AdditionalTasks=附加任务
english.RunApp=Launch %1
chinesesimplified.RunApp=启动 %1

[Files]
Source: "..\src-tauri\target\release\app.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\src-tauri\binaries\md2word-x86_64-pc-windows-msvc.exe"; DestDir: "{app}"; DestName: "md2word.exe"; Flags: ignoreversion

[Icons]
Name: "{group}\{cm:AppName}"; Filename: "{app}\{#AppExe}"
Name: "{commondesktop}\{cm:AppName}"; Filename: "{app}\{#AppExe}"; Tasks: desktopicon

[Tasks]
Name: "desktopicon"; Description: "{cm:DesktopTask}"; GroupDescription: "{cm:AdditionalTasks}"

[Run]
Filename: "{app}\{#AppExe}"; Description: "{cm:RunApp,{cm:AppName}}"; Flags: nowait postinstall skipifsilent
