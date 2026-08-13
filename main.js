/* =====================================================
   main.js — Electron 메인 프로세스
   EXE 배포 진입점
   ===================================================== */

const { app, BrowserWindow, desktopCapturer, screen } = require("electron");
const path = require("path");

/**
 * blueport-horror의 capture_screen_uri()와 동일한 역할.
 * 창을 보여주기 전에 실제 화면을 캡처해서 데이터URL로 반환한다.
 * (창을 띄운 뒤 캡처하면 우리 창 자신이 스크린샷에 찍히므로, 반드시
 *  show:false 로 만든 뒤 캡처 → 주입 → show() 순서를 지킨다.)
 */
async function captureScreenDataUrl() {
  try {
    const primary = screen.getPrimaryDisplay();
    const { width, height } = primary.size;
    const sources = await desktopCapturer.getSources({
      types: ["screen"],
      thumbnailSize: { width, height },
    });
    if (!sources.length || sources[0].thumbnail.isEmpty()) return null;
    return sources[0].thumbnail.toDataURL();
  } catch (e) {
    return null; // 캡처 실패 시 기본 배경색 유지 (정상 동작)
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    title: "한찌.com — 한민고 커뮤니티",
    fullscreen: true, // ★ blueport-horror처럼 전체화면으로 몰입감 있게 시작
    autoHideMenuBar: true,
    show: false, // ★ 화면 캡처 + 배경 주입이 끝난 뒤에만 보여줌
    // icon: path.join(__dirname, "assets/icon.ico"), // ★ 아이콘 준비되면 주석 해제 + package.json build.win.icon도 설정
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadFile("index.html");

  // 메뉴바 숨기기 (일반 웹사이트처럼 보이게)
  win.setMenuBarVisibility(false);

  // ★ 가짜 바탕화면(#desktopScreen)에 실제 화면 캡처를 배경으로 주입
  //   → "아이콘 하나만 새로 생긴 내 진짜 바탕화면"처럼 보이게 함
  win.webContents.once("did-finish-load", async () => {
    const dataUrl = await captureScreenDataUrl();
    if (dataUrl) {
      await win.webContents.executeJavaScript(`
        (function () {
          var el = document.getElementById('desktopScreen');
          if (el) el.style.backgroundImage = 'url(' + ${JSON.stringify(dataUrl)} + ')';
        })();
      `).catch(() => {});
    }
    win.show();
  });

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
