using System;
using System.Runtime.InteropServices;
using System.Threading;
using System.Text;
using System.Diagnostics;

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

    // Mouse hook P/Invoke
    private delegate IntPtr LowLevelMouseProc(int nCode, IntPtr wParam, IntPtr lParam);

    [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    private static extern IntPtr SetWindowsHookEx(int idHook, LowLevelMouseProc lpfn, IntPtr hMod, uint dwThreadId);

    [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool UnhookWindowsHookEx(IntPtr hhk);

    [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    private static extern IntPtr CallNextHookEx(IntPtr hhk, int nCode, IntPtr wParam, IntPtr lParam);

    [DllImport("kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    private static extern IntPtr GetModuleHandle(string lpModuleName);

    // Message loop P/Invoke
    [StructLayout(LayoutKind.Sequential)]
    private struct MSG {
        public IntPtr hwnd;
        public uint message;
        public IntPtr wParam;
        public IntPtr lParam;
        public uint time;
        public int ptX;
        public int ptY;
    }

    [DllImport("user32.dll")]
    private static extern int GetMessage(out MSG lpMsg, IntPtr hWnd, uint wMsgFilterMin, uint wMsgFilterMax);

    [DllImport("user32.dll")]
    private static extern bool TranslateMessage(ref MSG lpMsg);

    [DllImport("user32.dll")]
    private static extern IntPtr DispatchMessage(ref MSG lpMsg);

    [DllImport("user32.dll")]
    private static extern bool PostThreadMessage(uint idThread, uint Msg, IntPtr wParam, IntPtr lParam);

    private const int WH_MOUSE_LL = 14;
    private const int WM_RBUTTONDOWN = 0x0204;
    private const int WM_RBUTTONUP = 0x0205;
    private const int WM_RBUTTONDBLCLK = 0x0206;

    private const uint WM_QUIT = 0x0012;

    private const uint MOUSEEVENTF_LEFTDOWN = 0x02;
    private const uint MOUSEEVENTF_LEFTUP = 0x04;
    private const int SW_SHOW = 5;

    private static bool active = false;
    private static IntPtr _hookID = IntPtr.Zero;
    private static LowLevelMouseProc _proc = HookCallback;
    private static uint mainThreadId;
    private static bool shouldExit = false;

    // Track the physical state of Right Mouse Button since we block its events from the OS key/mouse state cache
    private static bool isRButtonHeld = false;

    static void Main() {
        mainThreadId = GetCurrentThreadId();

        // Start clicking thread
        Thread thread = new Thread(ClickLoop);
        thread.IsBackground = true;
        thread.Start();

        // Start input reader thread
        Thread inputThread = new Thread(InputLoop);
        inputThread.IsBackground = true;
        inputThread.Start();

        // Set global low-level mouse hook to intercept right clicks
        _hookID = SetHook(_proc);

        // Run message loop to process hook events
        MSG msg;
        while (GetMessage(out msg, IntPtr.Zero, 0, 0) > 0) {
            TranslateMessage(ref msg);
            DispatchMessage(ref msg);
        }

        // Clean up hook on exit
        if (_hookID != IntPtr.Zero) {
            UnhookWindowsHookEx(_hookID);
        }
    }

    private static IntPtr SetHook(LowLevelMouseProc proc) {
        using (Process curProcess = Process.GetCurrentProcess())
        using (ProcessModule curModule = curProcess.MainModule) {
            return SetWindowsHookEx(WH_MOUSE_LL, proc, GetModuleHandle(curModule.ModuleName), 0);
        }
    }

    private static IntPtr HookCallback(int nCode, IntPtr wParam, IntPtr lParam) {
        if (nCode >= 0) {
            int msg = (int)wParam;
            
            // Track state first
            if (msg == WM_RBUTTONDOWN) {
                isRButtonHeld = true;
            } else if (msg == WM_RBUTTONUP) {
                isRButtonHeld = false;
            }

            if (msg == WM_RBUTTONDOWN || msg == WM_RBUTTONUP || msg == WM_RBUTTONDBLCLK) {
                bool isCtrlPressed = (GetAsyncKeyState(0x11) & 0x8000) != 0; // VK_CONTROL
                bool isShiftPressed = (GetAsyncKeyState(0x10) & 0x8000) != 0; // VK_SHIFT
                bool isAltPressed = (GetAsyncKeyState(0x12) & 0x8000) != 0; // VK_MENU (Alt)

                RECT rect;
                rect.Left = 0; rect.Top = 0; rect.Right = 0; rect.Bottom = 0;
                bool isGameActive = IsTargetWindowActive(ref rect);
                bool isTargetActive = active || isGameActive;

                if (isTargetActive && (isCtrlPressed || isShiftPressed) && !isAltPressed) {
                    // Block the right click message from passing to the target window
                    return new IntPtr(1);
                }
            }
        }
        return CallNextHookEx(_hookID, nCode, wParam, lParam);
    }

    static void InputLoop() {
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
                shouldExit = true;
                PostThreadMessage(mainThreadId, WM_QUIT, IntPtr.Zero, IntPtr.Zero);
                break;
            }
        }
    }

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
        while (!shouldExit) {
            bool isCtrlPressed = (GetAsyncKeyState(0x11) & 0x8000) != 0; // VK_CONTROL
            bool isShiftPressed = (GetAsyncKeyState(0x10) & 0x8000) != 0; // VK_SHIFT
            bool isAltPressed = (GetAsyncKeyState(0x12) & 0x8000) != 0; // VK_MENU (Alt)

            // Since right clicks are blocked in our user32 hook, GetAsyncKeyState(0x02) returns 0.
            // We use our custom state variable isRButtonHeld instead.
            bool isRButtonPressed = isRButtonHeld || ((GetAsyncKeyState(0x02) & 0x8000) != 0);

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
                // Send distinct Left Down and Left Up events with a short hold delay to ensure the game registers the click sequence
                mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0);
                Thread.Sleep(20); // Hold for 20ms
                mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0);
                Thread.Sleep(46); // Sleep remaining time to maintain ~15 CPS (66ms total)
            } else {
                Thread.Sleep(10);
            }
        }
    }
}
