/* =====================================================
   app.js — 라우팅 · 이벤트 바인딩 · 초기화 · 개발 도구
   ※ 이 파일은 다른 모든 JS 파일이 로드된 후 실행됩니다.
   ===================================================== */

/* ── 라우팅 ──────────────────────────────────────────── */
function go(type) {
  if (type === "home")    goBoard("home");
  else if (type === "write") {
    if (!currentUser) renderLogin();
    else              renderWrite();
  }
  else if (type === "login")   renderLogin();
  else if (type === "signup")  renderSignup();
  else if (type === "inquiry") goBoard("inquiry");
}

/* ── 모달 ────────────────────────────────────────────── */
function showModal(title, text, onOk) {
  const root = document.getElementById("modalRoot");
  root.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal">
        <h3>${esc(title)}</h3>
        <div class="modal-body">${esc(text)}</div>
        <div class="modal-actions">
          <button class="primary-btn" id="modalOk">확인</button>
        </div>
      </div>
    </div>`;
  document.getElementById("modalOk").onclick = () => {
    root.innerHTML = "";
    if (onOk) onOk();
  };
}

/* ── 전역 클릭 이벤트 위임 ───────────────────────────── */
document.addEventListener("click", (e) => {

  // 공지사항 클릭
  const notice = e.target.closest("[data-notice]");
  if (notice) { openNotice(notice.dataset.notice); return; }

  // 게시글 클릭
  const post = e.target.closest("[data-post]");
  if (post) { openPost(post.dataset.post); return; }

  // 게시판 이동
  const board = e.target.closest("[data-board]");
  if (board) { goBoard(board.dataset.board); return; }

  // 페이지 이동
  const goEl = e.target.closest("[data-go]");
  if (goEl) { go(goEl.dataset.go); return; }

  // 로그아웃 (자유롭게 가능 — UNKNOWN 계정 로그인을 시도하려면
  // 먼저 로그아웃할 수 있어야 하므로 비밀번호로 막지 않음)
  // ★ 게시글/댓글은 그대로 남겨서 다음 사용자가 이어볼 수 있게 하되,
  //   수칙 위반 경고(violationCount)는 사용자별로 초기화됩니다.
  if (e.target.id === "logoutBtn") {
    currentUser = null;
    violationCount = 0;
    document.body.classList.remove("horror-distort", "horror-severe");
    document.getElementById("horrorWarning")?.classList.remove("show");
    save();
    updateAccount();
    renderLogin();
    showModal("로그아웃", "로그아웃되었습니다.");
  }
});

/* ── 전체 검색 ───────────────────────────────────────── */
document.getElementById("globalSearchForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const q = document.getElementById("globalSearchInput").value;
  if (hiddenResetCheck(q)) return;
  renderSearch(q);
});

/* ── 채팅 버튼 ───────────────────────────────────────── */
document.getElementById("openChat").onclick = () =>
  showModal(
    "개인 채팅",
    "현재는 인터페이스용 버튼입니다. 실제 서비스에서는 별도의 채팅 데이터 구조와 신고·차단 기능을 함께 설계하는 것이 좋습니다.",
  );

/* ── 초기화 ──────────────────────────────────────────── */
// ★ 파일을 열면(=새 사용자가 앉으면) 로그인 화면이 먼저 뜹니다.
//   로그인 없이 둘러보고 싶으면 상단 네비게이션의 "홈"을 누르면 됩니다.
updateAccount();
renderLogin();

/* ── dark.html: UNKNOWN 계정 → 마지막 편지 엔딩 ────────
   unknown 계정으로 로그인하면 dark.html 로 리다이렉트되고,
   2초 뒤 showUnknownEnding() 오버레이가 자동으로 뜹니다.
─────────────────────────────────────────────────────── */
if (_dark && currentUser?.isUnknown) {
  setTimeout(() => showUnknownEnding(), 2000);
}

/* =====================================================
   개발 도구 (배포 후에도 유지 — 제작자 전용)
   ===================================================== */

/**
 * 모든 진행 상태를 초기화하는 내부 함수
 * @param {boolean} reload 페이지 새로고침 여부
 */
function _fullReset(reload = true) {
  stopHorrorAmbience();
  localStorage.clear();
  sessionStorage.clear();
  currentUser        = null;
  posts              = [...seedPosts];
  comments           = [...seedComments];
  violationCount     = 0;
  normalEndingPlayed = false;
  document.body.classList.remove("horror-distort", "horror-severe");
  document.getElementById("horrorWarning")?.classList.remove("show");
  document.getElementById("endingScreen")?.classList.remove("show");
  hideHorrorLayer();
  localStorage.setItem(POSTS_KEY,    JSON.stringify(posts));
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
  updateAccount();
  if (reload) {
    location.reload();
  } else {
    goBoard("home");
    console.table(
      posts
        .map((p, i) => ({ position: i + 1, id: p.id, trigger: p.horror || "", title: p.title || "(빈 제목)" }))
        .filter((x) => x.trigger),
    );
  }
}

/**
 * 콘솔에서 resetHansseolDemo() 실행 시 전체 초기화 + 새로고침
 * ★ 개발 중 데이터 초기화용: 제작자만 사용
 */
window.resetHansseolDemo = function () {
  _fullReset(true);
};

/**
 * 검색창에 "RESET-3141" 입력 시 초기화 확인 팝업
 * @returns {boolean} true면 일반 검색을 건너뜁니다.
 */
function hiddenResetCheck(value) {
  if (value.trim() === "RESET-3141") {
    if (confirm("사이트 데이터를 초기화하시겠습니까?")) {
      _fullReset(true);
    }
    return true;
  }
  return false;
}
