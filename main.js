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
    fullscreen: true, // ★ blueport-horror처럼 전체화면으로 몰입감 있게 시작
    autoHideMenuBar: true,
    // icon: path.join(__dirname, "assets/icon.ico"), // ★ 아이콘 준비되면 주석 해제 + package.json build.win.icon도 설정
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadFile("index.html");

  // 메뉴바 숨기기 (일반 웹사이트처럼 보이게)
  win.setMenuBarVisibility(false);

  // ★ 프로그램(exe) 종료 시 localStorage 전체 초기화
  //   → 다음에 실행하면 게시글/댓글/로그인 상태가 전부 처음(seed) 상태로 돌아감.
  //   로그아웃은 자유롭게 하되(이어쓰기 유지), 초기화는 "하루 세션이 끝날 때"에만
  //   일어나도록 초기화 기준을 로그아웃이 아닌 프로그램 종료로 옮긴 것.
  win.on("close", (e) => {
    win.webContents.session.clearStorageData().catch(() => {});
  });

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
