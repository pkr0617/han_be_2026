/* =====================================================
   notices.js — 공지사항 데이터 및 렌더링
   ===================================================== */

const NOTICE_DATA = {
  rules: {
    title: "한찌.com 서버 종료 안내",
    date: "2026-08-01",
    body: `그동안 감사했습니다.`,
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
  const n = NOTICE_DATA[key] || NOTICE_DATA.rules;

  document.getElementById("page-post").innerHTML = `
    <div class="page-top">
      <h1>공지사항</h1>
      <p>한썰 운영 안내</p>
    </div>

    <article class="post-card">
      <div class="post-head">
        <h2>${esc(n.title)}</h2>

        <div class="post-meta">
          <span>작성자 <b>관리자</b></span>
          <span>${esc(n.date)}</span>
          <span>공지</span>
        </div>
      </div>

      <div
        class="post-body"
        style="font-size:24px; color:#d00000; font-weight:700"
      >
        ${esc(n.body)}
      </div>
    </article>
  `;

  // 먼저 공지 본문으로 이동
  showPage("page-post");

  // dark.html에서는 본문이 열린 뒤 3초 후 편지 표시
  if (window.__DARK_SITE__ === true) {
    setTimeout(() => {
      showUnknownEnding();
    }, 3000);
  }
}
