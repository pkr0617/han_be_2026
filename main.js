/* =====================================================
   main.js — Electron 메인 프로세스
   EXE 배포 진입점
   ===================================================== */

const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    title: "한찌.com — 한민고 커뮤니티",
    // icon: path.join(__dirname, "assets/icon.ico"), // ★ 아이콘 교체 시 주석 해제
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadFile("index.html");

  // 메뉴바 숨기기 (일반 웹사이트처럼 보이게)
  win.setMenuBarVisibility(false);

  // 개발 시에만 DevTools 열기
  // win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
