/* =====================================================
   store.js — localStorage 키 · 전역 상태 · save()
   ★ 버전을 올리면 localStorage가 초기화됩니다.
   ===================================================== */

const STORAGE_VERSION = "v11"; // v11: 게시글 66~71 추가 + 기존 게시글 다수 본문/댓글 갱신
const POSTS_KEY    = `hansseolPosts_${STORAGE_VERSION}`;
const COMMENTS_KEY = `hansseolComments_${STORAGE_VERSION}`;
const USER_KEY     = "hansseolUser";

/* ── 초기 데이터 로드 ────────────────────────────────── */
// dark.html 에서 로드되면 window.__DARK_SITE__ = true 로 설정되어
// localStorage 를 건드리지 않고 seedPosts(=darkSeedPosts)를 바로 사용합니다.
const _dark = !!window.__DARK_SITE__;

// ★ 게시글 순서는 seedPosts 배열 순서 그대로 고정됩니다.
let posts = _dark ? null : JSON.parse(localStorage.getItem(POSTS_KEY) || "null");
if (!posts) {
  posts = [...seedPosts];
  if (!_dark) localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
}

let comments = _dark
  ? [...seedComments]
  : (JSON.parse(localStorage.getItem(COMMENTS_KEY) || "null") || seedComments);

// 대댓글 기능: id 없는 기존 댓글에 순서 기반 id 부여 (하위 호환)
{ let _mid = Math.max(0, ...comments.map(c => c.id || 0));
  comments = comments.map(c => c.id ? c : { ...c, id: ++_mid }); }

let currentUser  = JSON.parse(localStorage.getItem(USER_KEY) || "null");
let currentBoard = "home";

/* ── 개발자 콘솔 트리거 맵 ──────────────────────────── */
// 브라우저 콘솔에서 showTriggerMap() 실행 시 공포 트리거 위치를 확인할 수 있습니다.
const TRIGGER_MAP = posts
  .map((p, index) => ({ position: index + 1, id: p.id, trigger: p.horror || "", title: p.title || "(빈 제목)" }))
  .filter(x => x.trigger);
console.table(TRIGGER_MAP);
window.showTriggerMap = () => console.table(TRIGGER_MAP);

/* ── 저장 ────────────────────────────────────────────── */
function save() {
  if (!_dark) {
    localStorage.setItem(POSTS_KEY,    JSON.stringify(posts));
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
  }
  if (currentUser) localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
  else             localStorage.removeItem(USER_KEY);
}
