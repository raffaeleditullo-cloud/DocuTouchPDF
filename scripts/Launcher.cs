using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Net;
using System.Threading;
using System.Windows.Forms;

namespace DocuTouchPDF
{
    static class Program
    {
        private static Process serverProcess = null;
        private static NotifyIcon trayIcon = null;
        private static Mutex singleInstanceMutex = null;
        private const string AppUrl = "http://localhost:3000";

        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            bool createdNew;
            singleInstanceMutex = new Mutex(true, "DocuTouchPDF_SingleInstance_Mutex", out createdNew);
            if (!createdNew)
            {
                // Se è già in esecuzione, apri semplicemente il browser
                OpenBrowser(AppUrl);
                return;
            }

            string baseDir = AppDomain.CurrentDomain.BaseDirectory;

            // Avvia il server Node.js se non è già attivo
            if (!IsServerRunning())
            {
                StartNodeServer(baseDir);
            }

            // Attendi che il server sia pronto (max 10 secondi)
            int attempts = 0;
            while (!IsServerRunning() && attempts < 20)
            {
                Thread.Sleep(500);
                attempts++;
            }

            // Apri il browser predefinito sulla Dashboard
            OpenBrowser(AppUrl);

            // Inizializza icona nella System Tray
            InitializeTray(baseDir);

            // Mantieni attiva l'applicazione
            Application.Run();
        }

        private static bool IsServerRunning()
        {
            try
            {
                HttpWebRequest request = (HttpWebRequest)WebRequest.Create(AppUrl + "/api/info");
                request.Timeout = 1500;
                request.Method = "GET";
                using (HttpWebResponse response = (HttpWebResponse)request.GetResponse())
                {
                    return response.StatusCode == HttpStatusCode.OK;
                }
            }
            catch
            {
                return false;
            }
        }

        private static void StartNodeServer(string baseDir)
        {
            try
            {
                string nodeExe = "node";
                string serverScript = Path.Combine(baseDir, "server.js");

                if (!File.Exists(serverScript))
                {
                    // Fallback se in sviluppo o sottocartella
                    string parentScript = Path.Combine(Directory.GetParent(baseDir).FullName, "server.js");
                    if (File.Exists(parentScript))
                    {
                        serverScript = parentScript;
                        baseDir = Directory.GetParent(baseDir).FullName;
                    }
                }

                ProcessStartInfo psi = new ProcessStartInfo();
                psi.FileName = nodeExe;
                psi.Arguments = "\"" + serverScript + "\"";
                psi.WorkingDirectory = baseDir;
                psi.CreateNoWindow = true;
                psi.UseShellExecute = false;
                psi.WindowStyle = ProcessWindowStyle.Hidden;

                serverProcess = Process.Start(psi);

                AppDomain.CurrentDomain.ProcessExit += (s, e) => StopNodeServer();
            }
            catch (Exception ex)
            {
                MessageBox.Show("Impossibile avviare il server DocuTouchPDF:\n" + ex.Message, "DocuTouchPDF Errore", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private static void StopNodeServer()
        {
            try
            {
                if (serverProcess != null && !serverProcess.HasExited)
                {
                    serverProcess.Kill();
                    serverProcess.Dispose();
                    serverProcess = null;
                }
            }
            catch { }
        }

        private static void OpenBrowser(string url)
        {
            try
            {
                Process.Start(new ProcessStartInfo
                {
                    FileName = url,
                    UseShellExecute = true
                });
            }
            catch { }
        }

        private static void InitializeTray(string baseDir)
        {
            trayIcon = new NotifyIcon();
            trayIcon.Text = "DocuTouchPDF PRO - Attivo in background";

            string icoPath = Path.Combine(baseDir, "public", "assets", "app.ico");
            if (!File.Exists(icoPath))
            {
                icoPath = Path.Combine(baseDir, "app.ico");
            }

            if (File.Exists(icoPath))
            {
                trayIcon.Icon = new Icon(icoPath);
            }
            else
            {
                trayIcon.Icon = SystemIcons.Application;
            }

            ContextMenuStrip menu = new ContextMenuStrip();
            
            ToolStripMenuItem titleItem = new ToolStripMenuItem("DocuTouchPDF PRO v1.0");
            titleItem.Enabled = false;
            titleItem.Font = new Font(titleItem.Font, FontStyle.Bold);
            menu.Items.Add(titleItem);

            menu.Items.Add(new ToolStripSeparator());

            ToolStripMenuItem openBrowserItem = new ToolStripMenuItem("🌐 Apri Dashboard nel Browser", null, (s, e) => OpenBrowser(AppUrl));
            openBrowserItem.Font = new Font(openBrowserItem.Font, FontStyle.Bold);
            menu.Items.Add(openBrowserItem);

            ToolStripMenuItem openProjectsItem = new ToolStripMenuItem("📁 Apri Cartella Progetti Salvati", null, (s, e) =>
            {
                string projectsDir = Path.Combine(baseDir, "saved_projects");
                if (!Directory.Exists(projectsDir)) Directory.CreateDirectory(projectsDir);
                Process.Start("explorer.exe", "\"" + projectsDir + "\"");
            });
            menu.Items.Add(openProjectsItem);

            menu.Items.Add(new ToolStripSeparator());

            ToolStripMenuItem exitItem = new ToolStripMenuItem("❌ Chiudi ed Esci", null, (s, e) =>
            {
                trayIcon.Visible = false;
                StopNodeServer();
                Application.Exit();
            });
            menu.Items.Add(exitItem);

            trayIcon.ContextMenuStrip = menu;
            trayIcon.DoubleClick += (s, e) => OpenBrowser(AppUrl);
            trayIcon.Visible = true;
        }
    }
}
