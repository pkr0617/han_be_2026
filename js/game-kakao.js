/* =====================================================
   game-kakao.js — 카카오톡 스타일 채팅 팝업
   blueport-horror 의 BP_KAKAO 이식
   사용자가 열람한 게시글 제목을 click history 에서 가져와
   메시지에 삽입함
   ===================================================== */
"use strict";

const GM_KAKAO = (() => {
  /* ── 상태 ────────────────────────────────────── */
  let _active    = false;
  let _panelOpen = false;
  let _msgCount  = 0;
  let _floodTimer = null;

  /* ── 요소 참조 ───────────────────────────────── */
  const _el = id => document.getElementById(id);

  /* ── 클릭 기록에서 최근 게시글 제목 가져오기 ── */
  function _lastPostTitle() {
    // GM_MINIGAME.clickHistory 배열에서 가져옴
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
    preview._hideTimer = setTimeout(() => preview.classList.add("mg-hidden"), 4000);
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
     게임 1단계 진입 시 호출
  ─────────────────────────────────────────────── */
  function trigger() {
    if (_active) return;
    _active = true;
    _msgCount = 0;

    const widget = _el("mg-kakaoWidget");
    if (widget) widget.classList.remove("mg-hidden");

    // 첫 메시지 (opener)
    setTimeout(() => {
      addMessage(GM_DATA.pick(GM_DATA.kakaoOpeners));
    }, 1200);
  }

  /* ── 채팅 패널 열기 ──────────────────────────── */
  function openChat() {
    const panel = _el("mg-kakaoChatPanel");
    if (!panel) return;
    _panelOpen = true;
    panel.classList.remove("mg-hidden");
    _msgCount = 0;
    _updateBadge();

    // 패널 열면 쌓인 내용 채우기
    const body = _el("mg-kakaoChatBody");
    if (body) body.scrollTop = body.scrollHeight;
  }

  /* ── 채팅 패널 닫기 ──────────────────────────── */
  function closeChat() {
    const panel = _el("mg-kakaoChatPanel");
    if (panel) panel.classList.add("mg-hidden");
    _panelOpen = false;
  }

  /* ── 메시지 폭주 ─────────────────────────────
     게임 2단계 이후 — 빠르게 연속 메시지 전송
  ─────────────────────────────────────────────── */
  function floodMessages(count = 18, intervalMs = 220) {
    if (_floodTimer) return; // 이미 폭주 중
    let sent = 0;
    _floodTimer = setInterval(() => {
      const tmpl = GM_DATA.pick(GM_DATA.kakaoFloodTemplates);
      addMessage(_makeMsg(tmpl));
      if (++sent >= count) {
        clearInterval(_floodTimer);
        _floodTimer = null;
      }
    }, intervalMs);
  }

  /* ── 리셋 ────────────────────────────────────── */
  function reset() {
    _active = false;
    _panelOpen = false;
    _msgCount = 0;
    if (_floodTimer) { clearInterval(_floodTimer); _floodTimer = null; }

    const widget = _el("mg-kakaoWidget");
    if (widget) widget.classList.add("mg-hidden");

    const panel = _el("mg-kakaoChatPanel");
    if (panel) { panel.classList.add("mg-hidden"); }

    const body = _el("mg-kakaoChatBody");
    if (body) body.innerHTML = "";

    const badge = _el("mg-kakaoBadge");
    if (badge) { badge.textContent = "0"; badge.classList.add("mg-hidden"); }

    const preview = _el("mg-kakaoPreview");
    if (preview) preview.classList.add("mg-hidden");
  }

  /* ── 초기화 ──────────────────────────────────── */
  function init() {
    // 카카오 버블 클릭 → 패널 열기
    const bubble = _el("mg-kakaoBubble");
    if (bubble) bubble.addEventListener("click", openChat);

    // 닫기 버튼
    const closeBtn = _el("mg-kakaoChatClose");
    if (closeBtn) closeBtn.addEventListener("click", closeChat);

    // 기존 홈 화면 "채팅창 열기" 버튼 덮어쓰기
    // (app.js 의 openChat 모달 대신 게임 채팅 열기)
    document.addEventListener("click", e => {
      const btn = e.target.closest("#openChat");
      if (!btn) return;
      if (_active) {
        e.stopImmediatePropagation();
        openChat();
      }
      // _active 아닐 땐 app.js 의 기존 모달이 열린다
    }, true);
  }

  return { trigger, openChat, closeChat, addMessage, floodMessages, reset, init, get active() { return _active; } };
})();
