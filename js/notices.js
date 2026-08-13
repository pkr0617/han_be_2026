/* =====================================================
   notices.js — 공지사항 데이터 및 렌더링
   ===================================================== */

const NOTICE_DATA = {
  rules: {
    title: "한찌.com 이용 규칙 및 운영 정책 안내 (필독)",
    date: "2026-08-01",
    body: `한찌.com은 학생들이 학교생활과 정보를 자유롭게 나누기 위한 커뮤니티입니다.

1. 다른 이용자를 비방하거나 괴롭히는 글은 금지됩니다.
2. 실명, 연락처 등 개인정보를 허락 없이 게시하지 마세요.
3. 사실처럼 보이는 패러디 글은 오해가 없도록 맥락을 분명히 해주세요.
4. 신고가 누적되거나 운영 규칙을 위반한 글은 관리자 판단에 따라 제한될 수 있습니다.
5. 학교 공식 공지와 커뮤니티 게시글은 구분해서 확인해주세요.`,
  },
  nickname: {
    title: "가입 시 닉네임 규칙 안내 (필독)",
    date: "2026-08-03",
    body: `닉네임은 다른 이용자가 쉽게 식별할 수 있는 표시입니다.

욕설, 사칭, 개인정보가 포함된 닉네임은 사용할 수 없습니다. 익명게시판에서는 계정 닉네임과 관계없이 '익명'으로 표시됩니다.`,
  },
  privacy: {
    title: "개인정보 작성 주의 안내",
    date: "2026-08-05",
    body: `게시글과 댓글에 실명, 전화번호, 계정 비밀번호, 개인 연락처 등 민감한 개인정보를 올리지 마세요.

타인의 개인정보 역시 동의 없이 게시하지 않는 것을 원칙으로 합니다.`,
  },
  inquiry: {
    title: "문의사항 이용 안내",
    date: "2026-08-06",
    body: `사이트 오류, 게시글 신고, 계정 관련 문의는 문의사항 게시판을 이용해주세요.

운영 관련 공지는 이 공지사항 영역에서 확인할 수 있습니다.`,
  },
};

/** 공지사항 게시글 렌더링 */
function openNotice(key) {
  if (window.__DARK_SITE__ === true) {
    showUnknownEnding();
    return;
  }

  const n = NOTICE_DATA[key] || NOTICE_DATA.rules;
  document.getElementById("page-post").innerHTML = `
    <div class="page-top"><h1>공지사항</h1><p>한찌.com 운영 안내</p></div>
    <article class="post-card">
      <div class="post-head">
        <h2>${esc(n.title)}</h2>
        <div class="post-meta">
          <span>작성자 <b>관리자</b></span>
          <span>${esc(n.date)}</span>
          <span>공지</span>
        </div>
      </div>
      <div class="post-body">${esc(n.body)}</div>
      <div class="post-actions">
        <button class="recommend" data-board="home">홈으로</button>
      </div>
    </article>`;
  showPage("page-post");
}
