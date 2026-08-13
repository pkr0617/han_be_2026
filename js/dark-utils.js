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
 * @param {Array}  list        게시글 배열 (이미 해당 페이지 분량으로 잘라서 전달)
 * @param {number}  limit       표시할 최대 개수 (undefined = 전체) — 홈 화면 등 페이지네이션 없는 곳에서 사용
 * @param {number}  startIndex  전체 목록 기준 시작 인덱스 (페이지네이션 시 번호·N뱃지를 절대 위치로 계산하기 위함)
 */
function boardRows(list, limit = null, startIndex = 0) {
  const arr = limit ? list.slice(0, limit) : list;

  let html = `<div class="board-head">
    <div>번호</div><div>제목</div><div>작성자</div>
    <div>작성시간</div><div>조회</div><div>댓글</div>
  </div>`;

  // 상단 고정 공지 (첫 페이지에서만 노출)
  if (startIndex === 0) {
    html += `<div class="board-row">
      <div class="center" style="color:#d40000;font-weight:700">공지</div>
      <div class="board-title-cell" data-notice="rules">
        <span class="notice-badge">공지</span>한찌.com 서버 종료 안내
      </div>
      <div class="center">관리자</div>
      <div class="center">2026-08-01 12:00</div>
      <div class="center">2,345</div>
      <div class="center">0</div>
    </div>`;
  }

  arr.forEach((p, i) => {
    const commentCount = comments.filter((c) => c.postId === p.id).length;
    const absIndex = startIndex + i;
    html += `<div class="board-row">
      <div class="center">${absIndex + 1}</div>
      <div class="board-title-cell" data-post="${p.id}">
        ${p.hot ? '<span class="flame">🔥</span>' : ""}${esc(p.title)}${absIndex < 3 ? '<span class="new">N</span>' : ""}
      </div>
      <div class="center">${esc(p.author)}</div>
      <div class="center">${esc(p.date)}</div>
      <div class="center">${formatViews(p.views)}</div>
      <div class="center">${commentCount}</div>
    </div>`;
  });

  return html;
}

/**
 * 페이지네이션 버튼 HTML 생성
 * @param {number} current 현재 페이지 (1-based)
 * @param {number} total   전체 페이지 수
 */
function paginationHtml(current, total) {
  if (total <= 1) return "";

  // 현재 페이지 주변 최대 5개 번호만 노출 (게시글이 많아져도 버튼이 무한정 늘어나지 않도록)
  let start = Math.max(1, current - 2);
  let end   = Math.min(total, start + 4);
  start     = Math.max(1, end - 4);

  let html = `<button class="page-no" data-page="${Math.max(1, current - 1)}" ${current === 1 ? "disabled" : ""}>‹</button>`;
  for (let p = start; p <= end; p++) {
    html += `<button class="page-no ${p === current ? "active" : ""}" data-page="${p}">${p}</button>`;
  }
  html += `<button class="page-no" data-page="${Math.min(total, current + 1)}" ${current === total ? "disabled" : ""}>›</button>`;
  return html;
}
