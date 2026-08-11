/* =====================================================
   store.js — localStorage 키 · 전역 상태 · save()
   ★ 버전을 올리면 localStorage가 초기화됩니다.
   ===================================================== */

const STORAGE_VERSION = "v7";
const POSTS_KEY    = `hansseolPosts_${STORAGE_VERSION}`;
const COMMENTS_KEY = `hansseolComments_${STORAGE_VERSION}`;
const USER_KEY     = "hansseolUser";

/* ── 초기 데이터 로드 ────────────────────────────────── */
// ★ 게시글 순서는 seedPosts 배열 순서 그대로 고정됩니다.
let posts = JSON.parse(localStorage.getItem(POSTS_KEY) || "null");
if (!posts) {
  posts = [...seedPosts];
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
}

let comments = JSON.parse(localStorage.getItem(COMMENTS_KEY) || "null") || seedComments;
let currentUser  = JSON.parse(localStorage.getItem(USER_KEY) || "null");
let currentBoard = "home";

/* ── 다크 사이트 상태 ────────────────────────────────── */
let _isDarkSite = false;

// UNKNOWN 계정으로 로그인하면 게시글/댓글을 다크 버전으로 교체
function switchToDarkSite() {
  _isDarkSite = true;
  posts    = [...darkSeedPosts];
  comments = [...darkSeedComments];
  document.body.classList.add("dark-site");
}

// 새로고침 후 UNKNOWN 유저로 복귀 시 자동 복원
if (currentUser?.isUnknown) switchToDarkSite();

/* ── 개발자 콘솔 트리거 맵 ──────────────────────────── */
// 브라우저 콘솔에서 showTriggerMap() 실행 시 공포 트리거 위치를 확인할 수 있습니다.
const TRIGGER_MAP = posts
  .map((p, index) => ({ position: index + 1, id: p.id, trigger: p.horror || "", title: p.title || "(빈 제목)" }))
  .filter(x => x.trigger);
console.table(TRIGGER_MAP);
window.showTriggerMap = () => console.table(TRIGGER_MAP);

/* ── 저장 ────────────────────────────────────────────── */
function save() {
  // 다크 사이트 중에는 게시글/댓글을 localStorage에 덮어쓰지 않음
  if (!_isDarkSite) {
    localStorage.setItem(POSTS_KEY,    JSON.stringify(posts));
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
  }
  if (currentUser) localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
  else             localStorage.removeItem(USER_KEY);
}
