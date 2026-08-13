/* =====================================================
   game-trigger.js — 팝업 폭탄 / 블랙아웃 로그 / 트리거 감지
   blueport-horror 의 BP_TRIGGER 를 원본 흐름 그대로 이식

   ★ v2 변경점: 팝업을 닫을 때마다 2개씩 더 튀어나오던 "함정" 방식을
     제거하고, 원본처럼 정해진 개수(45~75개)가 시간차를 두고
     자동으로(점점 빨라지며) 쏟아지다가 끝나는 방식으로 변경.
   ===================================================== */
"use strict";

const GM_TRIGGER = (() => {
  /* ── 내부 상태 ───────────────────────────────────── */
  let _logTimerId = null;

  /* ── 요소 참조 ───────────────────────────────────── */
  function _el(id) { return document.getElementById(id); }

  /* ── 짧은 삐 소리 (Web Audio, 파일 없이) ────────── */
  function beep(freq = 880, dur = 0.08) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "square"; osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + dur);
    } catch (_) {}
  }

  /* ── 단일 에러 팝업 생성 ─────────────────────────
     onClose(kind): 사용자가 닫은 방식 — "ok"(확인) | "x"(닫기)
  ─────────────────────────────────────────────────── */
  let _popupSeq = 0;
  function spawnPopup(onClose) {
    const layer = _el("mg-popupLayer");
    if (!layer) return;

    const data = GM_DATA.pick(GM_DATA.errorMessages);
    const id   = "ep-" + (++_popupSeq);

    // 랜덤 위치 (화면 안에)
    const maxX = Math.max(50, window.innerWidth  - 320);
    const maxY = Math.max(50, window.innerHeight - 160);
    const left = Math.floor(Math.random() * maxX);
    const top  = Math.floor(Math.random() * maxY);

    const div = document.createElement("div");
    div.className = "mg-err-popup";
    div.id = id;
    div.style.left = left + "px";
    div.style.top  = top  + "px";
    div.innerHTML = `
      <div class="ep-title">
        <span>${data.title}</span>
        <button class="ep-close" data-close="x">✕</button>
      </div>
      <div class="ep-body">
        <span class="ep-icon">⚠️</span>
        <span>${data.body.replace(/\n/g, "<br>")}</span>
      </div>
      <div class="ep-btn-row">
        <button class="ep-btn" data-close="ok">확인</button>
      </div>`;

    layer.appendChild(div);
    beep(880 + Math.random() * 400, 0.06);

    // 드래그 이동
    _makeDraggable(div);

    // 닫기 버튼 ("확인" / "✕" 둘 다 닫히지만 어느 쪽인지는 콜백으로 구분)
    div.querySelectorAll("[data-close]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const kind = btn.dataset.close;
        div.remove();
        if (onClose) onClose(kind);
      });
    });
  }

  /* ── 팝업 폭발: 정해진 개수(45~75개)가 시간차를 두고
     점점 빨라지며 자동으로 쏟아짐. 사용자가 닫는 속도와 무관하게
     정해진 물량이 끝나면 onDone 이 호출됨. ────────────────── */
  function spawnPopupBurst(onDone, onPopupClose) {
    const count = 45 + Math.floor(Math.random() * 30); // 45~75개
    let delay = 220;
    let i = 0;
    function next() {
      if (i >= count) {
        if (onDone) setTimeout(onDone, 150);
        return;
      }
      spawnPopup(onPopupClose);
      i += 1;
      delay = Math.max(8, delay * 0.88);
      setTimeout(next, delay);
    }
    next();
  }

  /* ── 팝업 전체 제거 ──────────────────────────── */
  function clearPopups() {
    const layer = _el("mg-popupLayer");
    if (layer) layer.innerHTML = "";
  }

  /* ── 블랙아웃 로그 폭주 ─────────────────────────
     시스템 로그 기반 문구 + 잡음 라인을 섞어 100~160줄을 만들고,
     끝에 "돌아와줘" 를 세 번 반복해 붙인 뒤 한 줄씩 흘려보낸다.
  ─────────────────────────────────────────────────── */
  const FLOOD_NOISE_LINES = [
    () => "WARNING: exit handler not found",
    () => "ERROR 0x" + Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, "0"),
    () => "memory block " + Math.floor(Math.random() * 9999) + " corrupted",
    () => "scanning... " + Math.floor(Math.random() * 100) + "%",
    () => "user session is still here",
    () => "...",
  ];

  function buildFloodLines() {
    const base  = GM_DATA.systemLogLines;
    const total = 100 + Math.floor(Math.random() * 60); // 100~160줄
    const lines = [];
    for (let i = 0; i < total; i++) {
      if (i < base.length && Math.random() < 0.35) {
        lines.push(base[i]);
      } else {
        lines.push(FLOOD_NOISE_LINES[Math.floor(Math.random() * FLOOD_NOISE_LINES.length)]());
      }
    }
    lines.push("돌아와줘", "돌아와줘", "돌아와줘");
    return lines;
  }

  function floodLog(onDone) {
    const overlay = _el("mg-crashOverlay");
    const logEl   = _el("mg-logText");
    if (!overlay || !logEl) { if (onDone) onDone(); return; }

    overlay.classList.remove("mg-hidden");
    logEl.textContent = "";

    const lines = buildFloodLines();
    let idx = 0;
    let delay = 45;
    function next() {
      if (idx >= lines.length) {
        if (onDone) setTimeout(onDone, 300);
        return;
      }
      logEl.textContent += lines[idx] + "\n";
      overlay.scrollTop = overlay.scrollHeight;
      idx += 1;
      delay = Math.max(4, delay * 0.94);
      _logTimerId = setTimeout(next, delay);
    }
    next();
  }

  function stopLog() {
    if (_logTimerId) { clearTimeout(_logTimerId); _logTimerId = null; }
    const overlay = _el("mg-crashOverlay");
    if (overlay) overlay.classList.add("mg-hidden");
  }

  /* ── 드래그 헬퍼 ─────────────────────────────── */
  function _makeDraggable(el) {
    const title = el.querySelector(".ep-title");
    if (!title) return;
    let dx = 0, dy = 0, mx = 0, my = 0;
    title.style.cursor = "move";
    title.addEventListener("mousedown", (e) => {
      mx = e.clientX; my = e.clientY;
      dx = el.offsetLeft; dy = el.offsetTop;
      const move = (ev) => {
        el.style.left = (dx + ev.clientX - mx) + "px";
        el.style.top  = (dy + ev.clientY - my) + "px";
      };
      const up = () => {
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
      };
      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    });
  }

  /* ── 트리거 단어 감지 ────────────────────────── */
  function isTriggerText(text) {
    const t = text.replace(/\s/g, "").toLowerCase();
    return GM_DATA.triggerWords.some((w) => t.includes(w.replace(/\s/g, "").toLowerCase()));
  }

  /**
   * 사용자 텍스트 입력 검사
   * — 트리거 단어가 포함되면 게임을 시작시킨다 (이미 시작됐으면 효과 없음)
   */
  function checkText(text) {
    if (!text || !isTriggerText(text)) return false;
    if (typeof GM_MINIGAME !== "undefined") {
      GM_MINIGAME.escalate("trigger_word");
    }
    return true;
  }

  /* ── 초기화: 검색창 훅 ───────────────────────── */
  function init() {
    const form = document.getElementById("globalSearchForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        const q = (document.getElementById("globalSearchInput") || {}).value || "";
        checkText(q);
        // 기존 hiddenResetCheck / renderSearch 는 app.js 에서 처리
      });
    }
  }

  return { beep, spawnPopup, spawnPopupBurst, clearPopups, buildFloodLines, floodLog, stopLog, isTriggerText, checkText, init };
})();
