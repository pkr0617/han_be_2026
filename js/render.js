/* =====================================================
   render.js — 페이지별 렌더링 함수
   ===================================================== */

/* ── 홈 ──────────────────────────────────────────────── */
function renderHome() {
  const hot = posts.filter((p) => !p.hiddenUntilSearch);

  document.getElementById("homeHotBoard").innerHTML = boardRows(hot, 10);

  document.getElementById("popularList").innerHTML = hot
    .slice(0, 5)
    .map(
      (p, i) => `
      <div class="rank-item">
        <span class="rank-num">${i + 1}</span>
        <span class="rank-text" data-post="${p.id}">${esc(p.title)}</span>
      </div>`,
    )
    .join("");

  document.getElementById("recentComments").innerHTML = publicChat
    .map(
      (c) => `
      <div class="recent-comment">
        <span class="comment-text">${esc(c.author)} : ${esc(c.text)}</span>
        <span class="time">${esc(c.time || "방금 전")}</span>
      </div>`,
    )
    .join("");
}

/* ── 게시판 목록 ─────────────────────────────────────── */
function goBoard(key) {
  currentBoard = key;
  document.querySelectorAll(".nav-btn").forEach((b) =>
    b.classList.toggle("active", b.dataset.board === key),
  );

  if (key === "home") {
    showPage("page-home");
    renderHome();
    return;
  }

  const meta = BOARD_META[key] || BOARD_META.free;
  const list = (
    key === "hot" ? [...posts] : posts.filter((p) => p.board === key)
  ).filter((p) => !p.hiddenUntilSearch);

  document.getElementById("page-board").innerHTML = `
    <div class="page-top"><h1>${meta.name}</h1><p>${meta.desc}</p></div>
    <div class="board-tools">
      <div class="board-tools-left">
        <select class="small-select">
          <option>전체</option><option>공지</option><option>일반글</option>
        </select>
        <span>총 ${list.length}개의 글</span>
      </div>
      <div class="board-tools-right">
        <input class="small-input" id="boardSearch" placeholder="이 게시판에서 검색">
        <button class="secondary-btn" id="boardSearchBtn">검색</button>
        <button class="primary-btn" data-go="write">글쓰기</button>
      </div>
    </div>
    <div class="board-table-wrap" id="boardTable">${boardRows(list)}</div>
    <div class="pagination">
      <button class="page-no">‹</button>
      <button class="page-no active">1</button>
      <button class="page-no">2</button>
      <button class="page-no">3</button>
      <button class="page-no">›</button>
    </div>`;

  showPage("page-board");

  document.getElementById("boardSearchBtn").onclick = () => {
    const q = document.getElementById("boardSearch").value.trim().toLowerCase();
    const searchable = q.includes("observer") ? list : list.filter((p) => !p.hiddenUntilSearch);
    const filtered = searchable.filter(
      (p) => p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q),
    );
    document.getElementById("boardTable").innerHTML = boardRows(filtered);
  };
}

/* ── 게시글 상세 ─────────────────────────────────────── */
function openPost(id) {
  const p = posts.find((x) => x.id === Number(id));
  if (!p) return;

  // 공포 트리거 체크
  if (p.horror === "observer") { triggerHorrorEvent("observer"); return; }
  if (p.horror === "rainbow")  { triggerHorrorEvent("rainbow");  return; }
  if (p.horror === "blank")    { registerViolation("빈 게시글 접근"); return; }
  if (p.horror === "author")   { registerViolation("작성자 게시글 접근"); }
  // "audio" 트리거는 세 번째 녹음 재생 시 적립됩니다 (아래 audio 이벤트 참조).

  p.views++;
  save();

  const pcs = comments.filter((c) => c.postId === p.id);

  // 첨부 녹음 HTML
  const audioHtml = p.audioFiles
    ? `<div style="margin-top:18px;padding:14px;border:1px solid #999;background:#f8f8f8">
        <b>첨부 녹음</b>
        <div style="margin-top:12px;display:grid;gap:10px">
          ${p.audioFiles
            .map(
              (src, i) => `
            <label>녹음 ${i + 1}
              <audio controls preload="none" data-audio-index="${i}" style="width:100%;margin-top:5px">
                <source src="${src}" type="audio/mpeg">
              </audio>
            </label>`,
            )
            .join("")}
        </div>
      </div>`
    : "";

  document.getElementById("page-post").innerHTML = `
    <div class="page-top">
      <h1>${BOARD_META[p.board]?.name || "게시글"}</h1>
      <p>게시글 상세보기</p>
    </div>
    <article class="post-card">
      <div class="post-head">
        <h2>${p.title ? esc(p.title) : ""}</h2>
        <div class="post-meta">
          <span>작성자 <b>${esc(p.author)}</b></span>
          <span>${esc(p.date)}</span>
          <span>조회 ${formatViews(p.views)}</span>
          <span>공감 ${p.likes}</span>
        </div>
      </div>
      <div class="post-body">${esc(p.body)}${audioHtml}</div>
      <div class="post-actions">
        <button class="recommend" id="likeBtn">♡ 공감 ${p.likes}</button>
        <button class="recommend" data-board="${p.board}">목록으로</button>
      </div>
    </article>
    <section class="comment-zone">
      <div class="box-title">
        <div class="title-left"><span class="square"></span>댓글 ${pcs.length}</div>
      </div>
      <div id="commentItems">
        ${
          pcs.length
            ? pcs
                .map(
                  (c) => `
              <div class="comment-row">
                <div class="comment-row-top">
                  <b>${esc(c.author)}</b><span>${esc(c.time || "방금 전")}</span>
                </div>
                <div>${esc(c.text)}</div>
              </div>`,
                )
                .join("")
            : '<div class="comment-row">아직 댓글이 없습니다.</div>'
        }
      </div>
      ${
        currentUser
          ? `<form class="comment-form" id="commentForm">
              <textarea id="commentText" placeholder="댓글을 입력하세요. 서로를 존중하는 표현을 사용해주세요."></textarea>
              <button type="submit">등록</button>
             </form>`
          : `<div class="comment-form" style="display:flex;align-items:center;justify-content:space-between">
              <span>댓글을 작성하려면 로그인해주세요.</span>
              <button type="button" id="commentLoginBtn" style="height:40px;padding:0 18px">로그인</button>
             </div>`
      }
    </section>`;

  showPage("page-post");

  // 공감 버튼
  document.getElementById("likeBtn").onclick = () => {
    p.likes++;
    save();
    openPost(p.id);
  };

  // 세 번째 녹음 재생 감지
  document.querySelectorAll("audio[data-audio-index]").forEach((audio) => {
    audio.addEventListener(
      "play",
      () => {
        if (p.audioFiles && Number(audio.dataset.audioIndex) === 2) {
          registerViolation("세 번째 녹음 재생");
        }
      },
      { once: true },
    );
  });

  // 댓글 폼
  const cf = document.getElementById("commentForm");
  if (cf) {
    cf.onsubmit = (e) => {
      e.preventDefault();
      if (!currentUser) { renderLogin(); return; }
      const text = document.getElementById("commentText").value.trim();
      if (!text) return;
      comments.push({ postId: p.id, author: currentUser.nickname, text, time: "방금 전" });
      save();
      openPost(p.id);
    };
  }
  const cl = document.getElementById("commentLoginBtn");
  if (cl) cl.onclick = () => renderLogin();
}

/* ── 글쓰기 ──────────────────────────────────────────── */
function renderWrite() {
  const selected = currentBoard === "home" || currentBoard === "hot" ? "free" : currentBoard;

  document.getElementById("page-write").innerHTML = `
    <div class="form-card" style="width:min(900px,100%)">
      <div class="form-head"><h2>글 게시하기</h2><div>게시판 성격에 맞게 작성해주세요.</div></div>
      <form class="form-body" id="writeForm">
        <div class="notice-panel">
          개인정보, 연락처, 타인을 식별할 수 있는 민감한 정보는 게시하지 않는 것을 권장합니다.
          익명게시판을 선택하면 작성자명이 '익명'으로 표시됩니다.
        </div>
        <div class="form-row">
          <label>게시판</label>
          <select id="writeBoard">
            ${Object.entries(BOARD_META)
              .filter(([k]) => k !== "hot")
              .map(([k, v]) => `<option value="${k}" ${k === selected ? "selected" : ""}>${v.name}</option>`)
              .join("")}
          </select>
        </div>
        <div class="form-row">
          <label>제목</label>
          <input id="writeTitle" maxlength="80" required placeholder="제목을 입력하세요">
        </div>
        <div class="form-row">
          <label>내용</label>
          <textarea id="writeBody" required placeholder="내용을 입력하세요"></textarea>
        </div>
        <div class="form-actions">
          <button type="button" class="secondary-btn" data-board="${selected}">취소</button>
          <button type="submit" class="primary-btn">게시하기</button>
        </div>
      </form>
    </div>`;

  showPage("page-write");

  document.getElementById("writeForm").onsubmit = (e) => {
    e.preventDefault();
    if (!currentUser) {
      showModal("로그인이 필요합니다", "게시글 작성은 로그인 후 사용할 수 있도록 구성했습니다.", () => go("login"));
      return;
    }
    const board = document.getElementById("writeBoard").value;
    const title = document.getElementById("writeTitle").value.trim();
    const body  = document.getElementById("writeBody").value.trim();
    if (!title || !body) return;

    const newPost = {
      id:       Date.now(),
      board,
      title,
      body,
      author:   board === "anon" ? "익명" : currentUser.nickname,
      date:     new Date().toLocaleString("ko-KR"),
      views:    0,
      comments: 0,
      likes:    0,
      hot:      false,
    };
    posts.unshift(newPost);
    save();
    openPost(newPost.id);
  };
}

/* ── 로그인 ──────────────────────────────────────────── */
// ★ 제작자 비밀번호 (로그아웃 시 모든 상태 초기화)
const CREATOR_LOGOUT_PASSWORD = "3141";
// ★ UNKNOWN 계정 (숨겨진 엔딩 트리거)
const UNKNOWN_ID       = "unknown";
const UNKNOWN_PASSWORD = "0917";

function renderLogin() {
  document.getElementById("page-login").innerHTML = `
    <div class="form-card">
      <div class="form-head"><h2>로그인</h2><div>한찌.com 계정으로 로그인합니다.</div></div>
      <form class="form-body" id="loginForm">
        <div class="notice-panel">
          <b>주의:</b> 본명을 입력하지 마세요.
          이 사이트의 로그인은 실제 서버와 연결되지 않은 가짜 로그인입니다.
        </div>
        <div class="form-row">
          <label>아이디</label>
          <input id="loginId" required autocomplete="off" placeholder="아이디">
        </div>
        <div class="form-row">
          <label>비밀번호</label>
          <input id="loginPw" type="password" required autocomplete="off" placeholder="비밀번호">
        </div>
        <div class="form-actions">
          <button class="primary-btn" type="submit">로그인</button>
        </div>
        <div class="auth-links">입력한 계정 정보는 이 브라우저에서만 사용됩니다.</div>
      </form>
    </div>`;

  showPage("page-login");

  document.getElementById("loginForm").onsubmit = (e) => {
    e.preventDefault();
    const id = document.getElementById("loginId").value.trim();
    const pw = document.getElementById("loginPw").value;
    if (!id || !pw) return;

    currentUser = {
      id,
      nickname:  id,
      isUnknown: id === UNKNOWN_ID && pw === UNKNOWN_PASSWORD,
    };
    save();
    updateAccount();
    goBoard("home");

    if (currentUser.isUnknown) {
      showUnknownEnding();
    } else {
      playNormalEnding();
      showModal("로그인 완료", `${esc(id)} 계정으로 데모 로그인되었습니다.`);
    }
  };
}

/* ── 게스트 입장 (회원가입) ──────────────────────────── */
function renderSignup() {
  document.getElementById("page-signup").innerHTML = `
    <div class="form-card">
      <div class="form-head"><h2>게스트 이름 입력</h2><div>실명은 작성하지 마세요.</div></div>
      <form class="form-body" id="signupForm">
        <div class="notice-panel">
          본명, 전화번호, 학교 이메일 등 실제 개인정보를 입력하지 마세요.
          아무 가명이나 사용해도 됩니다.
        </div>
        <div class="form-row">
          <label>사용할 이름</label>
          <input id="signupNick" required maxlength="16" placeholder="가명 또는 닉네임">
        </div>
        <div class="form-actions">
          <button type="submit" class="primary-btn">입장</button>
        </div>
      </form>
    </div>`;

  showPage("page-signup");

  document.getElementById("signupForm").onsubmit = (e) => {
    e.preventDefault();
    const nickname = document.getElementById("signupNick").value.trim();
    if (!nickname) return;
    currentUser = { id: "guest_" + Date.now(), nickname, guest: true };
    save();
    updateAccount();
    goBoard("home");
    playNormalEnding();
    showModal("입장 완료", `${esc(nickname)}님, 게스트로 입장했습니다.`);
  };
}

/* ── 통합 검색 ───────────────────────────────────────── */
function renderSearch(q) {
  const query     = q.trim().toLowerCase();
  const searchable = query.includes("observer") ? posts : posts.filter((p) => !p.hiddenUntilSearch);
  const result     = searchable.filter(
    (p) =>
      p.title.toLowerCase().includes(query) ||
      p.body.toLowerCase().includes(query)  ||
      p.author.toLowerCase().includes(query),
  );

  document.getElementById("page-search").innerHTML = `
    <div class="page-top">
      <h1>통합검색</h1>
      <p>게시글 제목, 내용, 작성자를 검색합니다.</p>
    </div>
    <div class="search-summary"><b>"${esc(q)}"</b> 검색 결과 ${result.length}건</div>
    <div class="board-table-wrap">${boardRows(result)}</div>`;

  showPage("page-search");
}
