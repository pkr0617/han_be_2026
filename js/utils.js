/* =====================================================
   utils.js — 공용 유틸리티 함수
   ===================================================== */

/** HTML 특수문자 이스케이프 */
function esc(s = "") {
  return String(s).replace(
    /[&<>"']/g,
    (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[m],
  );
}

/** 숫자를 한국어 형식 콤마로 포맷 */
function formatViews(v) {
  return Number(v).toLocaleString("ko-KR");
}

/** 지정 페이지를 활성화하고 맨 위로 스크롤 */
function showPage(id) {
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/** 헤더 우측 계정 영역 업데이트 */
function updateAccount() {
  const el = document.getElementById("accountNav");
  if (currentUser) {
    el.innerHTML = `<button id="userHello"><b>${esc(currentUser.nickname)}</b>님</button><span class="divider">|</span><button id="logoutBtn">로그아웃</button><span class="divider optional">|</span><button class="optional" data-go="inquiry">✉ 문의사항</button>`;
  } else {
    el.innerHTML = `<button data-go="login">로그인</button><span class="divider">|</span><button data-go="signup">회원가입</button><span class="divider optional">|</span><button class="optional" data-go="inquiry">✉ 문의사항</button>`;
  }
}

/**
 * 게시글 목록 → HTML 테이블 문자열 생성
 * @param {Array}  list  게시글 배열
 * @param {number} limit 표시할 최대 개수 (undefined = 전체)
 */
function boardRows(list, limit = null) {
  const arr = limit ? list.slice(0, limit) : list;

  let html = `<div class="board-head">
    <div>번호</div><div>제목</div><div>작성자</div>
    <div>작성시간</div><div>조회</div><div>댓글</div>
  </div>`;

  // 상단 고정 공지
  html += `<div class="board-row">
    <div class="center" style="color:#d40000;font-weight:700">공지</div>
    <div class="board-title-cell" data-notice="rules">
      <span class="notice-badge">공지</span>한찌.com 이용 규칙 및 운영 정책 안내 (필독)
    </div>
    <div class="center">관리자</div>
    <div class="center">2026-08-01 12:00</div>
    <div class="center">2,345</div>
    <div class="center">0</div>
  </div>`;

  arr.forEach((p, i) => {
    const commentCount = comments.filter((c) => c.postId === p.id).length || p.comments || 0;
    html += `<div class="board-row">
      <div class="center">${i + 1}</div>
      <div class="board-title-cell" data-post="${p.id}">
        ${p.hot ? '<span class="flame">🔥</span>' : ""}${esc(p.title)}${i < 3 ? '<span class="new">N</span>' : ""}
      </div>
      <div class="center">${esc(p.author)}</div>
      <div class="center">${esc(p.date)}</div>
      <div class="center">${formatViews(p.views)}</div>
      <div class="center">${commentCount}</div>
    </div>`;
  });

  return html;
}
