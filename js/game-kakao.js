/* =====================================================
   game-kakao.js — 카카오톡 스타일 채팅 팝업
   blueport-horror 의 BP_KAKAO 를 원본 흐름 그대로 이식

   ★ v2 변경점: 위젯이 뜬 뒤 12초 안에 열지 않으면 "무시함" 으로
     처리되어 조용히 사라지고(침착 대응 점수 +2), 채팅을 열면
     그때부터 메시지가 폭주(scoreB +3)하도록 원본과 동일하게 맞춤.
   ===================================================== */
"use strict";

const GM_KAKAO = (() => {
  /* ── 상태 ────────────────────────────────────── */
  let _active     = false;
  let _panelOpen  = false;
  let _msgCount   = 0;
  let _ignoreTimer = null;
  let _floodTimer  = null;

  /* ── 요소 참조 ───────────────────────────────── */
  const _el = id => document.getElementById(id);
  function _show(id) { const e = _el(id); if (e) e.classList.remove("mg-hidden"); }
  function _hide(id) { const e = _el(id); if (e) e.classList.add("mg-hidden"); }

  /* ── 클릭 기록에서 최근 게시글 제목 가져오기 ── */
  function _lastPostTitle() {
    if (typeof GM_MINIGAME !== "undefined" && GM_MINIGAME.clickHistory && GM_MINIGAME.clickHistory.length > 0) {
      return GM_MINIGAME.clickHistory[GM_MINIGAME.clickHistory.length - 1];
    }
    return "게시글";
  }

  /* ── 메시지 텍스트 생성 ──────────────────────── */
  function _makeMsg(template) {
    const title = _lastPostTitle();
    return (template || GM_DATA.pick(GM_DATA.kakaoFloodTemplates))
      .replace(/\{POST\}/g, title);
  }

  /* ── 뱃지 업데이트 ───────────────────────────── */
  function _updateBadge() {
    const badge = _el("mg-kakaoBadge");
    if (!badge) return;
    const n = _msgCount;
    badge.textContent = n > 99 ? "99+" : String(n);
    badge.classList.toggle("mg-hidden", n === 0);
  }

  /* ── 미리보기 말풍선 표시 ────────────────────── */
  function _showPreview(text) {
    const preview = _el("mg-kakaoPreview");
    if (!preview) return;
    preview.querySelector(".mg-kakao-preview-text").textContent = text;
    preview.classList.remove("mg-hidden");
    clearTimeout(preview._hideTimer);
    preview._hideTimer = setTimeout(() => preview.classList.add("mg-hidden"), 5000);
  }

  /* ── 채팅창에 메시지 추가 ────────────────────── */
  function addMessage(text) {
    _msgCount++;
    _updateBadge();
    _showPreview(text);

    const body = _el("mg-kakaoChatBody");
    if (body && _panelOpen) {
      const div = document.createElement("div");
      div.className = "mg-kakao-msg";
      div.textContent = text;
      body.appendChild(div);
      body.scrollTop = body.scrollHeight;
    }
  }

  /* ── 팝업 위젯 활성화 ─────────────────────────
     캡챠 / 블랙아웃 단계 진입 시 호출. 클릭하지 않아도
     게임 진행에는 지장 없음 — 12초 뒤 자동으로 "무시" 처리됨.
  ─────────────────────────────────────────────── */
  function trigger() {
    if (_active) return;
    _active = true;
    _msgCount = 0;

    _show("mg-kakaoWidget");
    addMessage(GM_DATA.pick(GM_DATA.kakaoOpeners));

    _ignoreTimer = setTimeout(() => {
      if (!_active) return;
      _active = false;
      _hide("mg-kakaoWidget");
      if (typeof GM_MINIGAME !== "undefined") GM_MINIGAME.onKakaoIgnored();
    }, 12000);
  }

  /* ── 채팅 패널 열기 ──────────────────────────── */
  function openChat() {
    if (!_active) return;
    clearTimeout(_ignoreTimer);

    if (typeof GM_MINIGAME !== "undefined") GM_MINIGAME.onKakaoClicked();

    const panel = _el("mg-kakaoChatPanel");
    if (!panel) return;
    _panelOpen = true;
    panel.classList.remove("mg-hidden");

    const body = _el("mg-kakaoChatBody");
    if (body) body.innerHTML = "";
    _msgCount = 0;
    _updateBadge();

    addMessage(GM_DATA.pick(GM_DATA.kakaoOpeners));
    floodMessages();
  }

  /* ── 채팅 패널 닫기 ──────────────────────────── */
  function closeChat() {
    _hide("mg-kakaoChatPanel");
    _hide("mg-kakaoWidget");
    _panelOpen = false;
    _active = false;
  }

  /* ── 메시지 폭주 (채팅을 열면 자동 시작) ───────
     8~13개, 260ms → 90ms 로 점점 빨라짐
  ─────────────────────────────────────────────── */
  function floodMessages() {
    if (_floodTimer) return; // 이미 폭주 중
    const count = 8 + Math.floor(Math.random() * 6);
    let sent = 0;
    let delay = 260;
    function next() {
      if (sent >= count) { _floodTimer = null; return; }
      const tmpl = GM_DATA.pick(GM_DATA.kakaoFloodTemplates);
      addMessage(_makeMsg(tmpl));
      sent += 1;
      delay = Math.max(90, delay * 0.9);
      _floodTimer = setTimeout(next, delay);
    }
    next();
  }

  /* ── 리셋 ────────────────────────────────────── */
  function reset() {
    _active = false;
    _panelOpen = false;
    _msgCount = 0;
    if (_ignoreTimer) { clearTimeout(_ignoreTimer); _ignoreTimer = null; }
    if (_floodTimer)  { clearTimeout(_floodTimer);  _floodTimer  = null; }

    _hide("mg-kakaoWidget");
    _hide("mg-kakaoChatPanel");
    _hide("mg-kakaoBadge");
    _hide("mg-kakaoPreview");

    const body = _el("mg-kakaoChatBody");
    if (body) body.innerHTML = "";
    const badge = _el("mg-kakaoBadge");
    if (badge) badge.textContent = "0";
  }

  /* ── 초기화 ──────────────────────────────────── */
  function init() {
    const bubble = _el("mg-kakaoBubble");
    if (bubble) bubble.addEventListener("click", openChat);

    const closeBtn = _el("mg-kakaoChatClose");
    if (closeBtn) closeBtn.addEventListener("click", closeChat);

    // 기존 홈 화면 "채팅창 열기" 버튼 덮어쓰기
    // (게임이 활성 상태일 때만 게임 채팅을 열고, 아니면 app.js 의 기존 모달)
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("#openChat");
      if (!btn) return;
      if (_active) {
        e.stopImmediatePropagation();
        openChat();
      }
    }, true);
  }

  return { trigger, openChat, closeChat, addMessage, reset, init, get active() { return _active; } };
})();
