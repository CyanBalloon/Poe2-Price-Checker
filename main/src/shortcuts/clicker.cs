using System;
using System.Runtime.InteropServices;
using System.Threading;
using System.Text;

class Clicker {
    [DllImport("user32.dll")]
    private static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint cButtons, uint dwExtraInfo);

    [DllImport("user32.dll")]
    private static extern short GetAsyncKeyState(int vKey);

    [DllImport("user32.dll")]
    private static extern IntPtr GetForegroundWindow();

    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    private static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);

    [StructLayout(LayoutKind.Sequential)]
    public struct RECT {
        public int Left;
        public int Top;
        public int Right;
        public int Bottom;
    }

    [DllImport("user32.dll", SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);

    private const uint MOUSEEVENTF_LEFTDOWN = 0x02;
    private const uint MOUSEEVENTF_LEFTUP = 0x04;

    private static bool active = false;

    static void Main() {
        // Start clicking thread
        Thread thread = new Thread(ClickLoop);
        thread.IsBackground = true;
        thread.Start();

        string line;
        while ((line = Console.ReadLine()) != null) {
            line = line.Trim();
            if (line == "active 1") {
                active = true;
            } else if (line == "active 0") {
                active = false;
            } else if (line == "focus-overlay") {
                FocusOverlayWindow();
            } else if (line == "exit") {
                break;
            }
        }
    }

    [DllImport("user32.dll")]
    private static extern uint GetWindowThreadProcessId(IntPtr hWnd, IntPtr ProcessId);

    [DllImport("kernel32.dll")]
    private static extern uint GetCurrentThreadId();

    [DllImport("user32.dll")]
    private static extern bool AttachThreadInput(uint idAttach, uint idAttachTo, bool fAttach);

    [DllImport("user32.dll")]
    private static extern bool SetForegroundWindow(IntPtr hWnd);

    [DllImport("user32.dll")]
    private static extern bool BringWindowToTop(IntPtr hWnd);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern IntPtr FindWindow(string lpClassName, string lpWindowName);

    [DllImport("user32.dll")]
    private static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

    private const int SW_SHOW = 5;

    static void FocusOverlayWindow() {
        IntPtr targetWindow = FindWindow(null, "Poe2 Price Checker");
        if (targetWindow == IntPtr.Zero) return;

        IntPtr foregroundWindow = GetForegroundWindow();
        if (foregroundWindow == targetWindow) return;

        uint foregroundThreadId = GetWindowThreadProcessId(foregroundWindow, IntPtr.Zero);
        uint currentThreadId = GetCurrentThreadId();

        if (foregroundThreadId != currentThreadId && foregroundThreadId != 0) {
            AttachThreadInput(currentThreadId, foregroundThreadId, true);
            BringWindowToTop(targetWindow);
            ShowWindow(targetWindow, SW_SHOW);
            SetForegroundWindow(targetWindow);
            AttachThreadInput(currentThreadId, foregroundThreadId, false);
        } else {
            BringWindowToTop(targetWindow);
            ShowWindow(targetWindow, SW_SHOW);
            SetForegroundWindow(targetWindow);
        }
    }

    static bool IsTargetWindowActive(ref RECT rect) {
        IntPtr handle = GetForegroundWindow();
        if (handle == IntPtr.Zero) return false;
        
        StringBuilder sb = new StringBuilder(256);
        if (GetWindowText(handle, sb, 256) > 0) {
            string title = sb.ToString();
            if (title.Contains("Path of Exile") || title.Contains("Poe2 Price Checker")) {
                GetWindowRect(handle, out rect);
                return true;
            }
        }
        return false;
    }

    static void ClickLoop() {
        bool lastForegroundState = false;
        RECT lastRect;
        lastRect.Left = 0; lastRect.Top = 0; lastRect.Right = 0; lastRect.Bottom = 0;
        while (true) {
            bool isCtrlPressed = (GetAsyncKeyState(0x11) & 0x8000) != 0; // VK_CONTROL
            bool isShiftPressed = (GetAsyncKeyState(0x10) & 0x8000) != 0; // VK_SHIFT
            bool isRButtonPressed = (GetAsyncKeyState(0x02) & 0x8000) != 0; // VK_RBUTTON
            bool isAltPressed = (GetAsyncKeyState(0x12) & 0x8000) != 0; // VK_MENU (Alt)

            RECT currentRect;
            currentRect.Left = 0; currentRect.Top = 0; currentRect.Right = 0; currentRect.Bottom = 0;
            bool isGameActive = IsTargetWindowActive(ref currentRect);
            bool isTargetActive = active || isGameActive;

            if (isTargetActive != lastForegroundState || (isTargetActive && (currentRect.Left != lastRect.Left || currentRect.Top != lastRect.Top || currentRect.Right != lastRect.Right || currentRect.Bottom != lastRect.Bottom))) {
                lastForegroundState = isTargetActive;
                lastRect = currentRect;
                if (isTargetActive) {
                    int width = currentRect.Right - currentRect.Left;
                    int height = currentRect.Bottom - currentRect.Top;
                    Console.WriteLine("focus 1 " + currentRect.Left + " " + currentRect.Top + " " + width + " " + height);
                } else {
                    Console.WriteLine("focus 0");
                }
                Console.Out.Flush();
            }

            if (isTargetActive && (isCtrlPressed || isShiftPressed) && isRButtonPressed && !isAltPressed) {
                mouse_event(MOUSEEVENTF_LEFTDOWN | MOUSEEVENTF_LEFTUP, 0, 0, 0, 0);
                Thread.Sleep(66); // 15 CPS -> 1000 / 15 = 66.6ms
            } else {
                Thread.Sleep(10);
            }
        }
    }
}
