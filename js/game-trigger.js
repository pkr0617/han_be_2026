/* =====================================================
   game-trigger.js — 팝업 폭탄 / 블랙아웃 로그 / 트리거 감지
   blueport-horror 의 BP_TRIGGER 이식
   ===================================================== */
"use strict";

const GM_TRIGGER = (() => {
  /* ── 내부 상태 ───────────────────────────────────── */
  let _popupCount = 0;
  let _logInterval = null;

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
     layer: #mg-popupLayer
  ─────────────────────────────────────────────────── */
  function spawnPopup(msgObj) {
    const layer = _el("mg-popupLayer");
    if (!layer) return;

    const data = msgObj || GM_DATA.pick(GM_DATA.errorMessages);
    const id   = "ep-" + (++_popupCount);

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
        <button class="ep-close" data-close="${id}">✕</button>
      </div>
      <div class="ep-body">
        <span class="ep-icon">⚠️</span>
        <span>${data.body.replace(/\n/g, "<br>")}</span>
      </div>
      <div class="ep-btn-row">
        <button class="ep-btn" data-close="${id}">확인</button>
      </div>`;

    layer.appendChild(div);
    beep(880 + Math.random() * 400, 0.06);

    // 드래그 이동
    _makeDraggable(div);

    // 닫기 버튼
    div.querySelectorAll("[data-close]").forEach(btn => {
      btn.addEventListener("click", () => {
        div.remove();
        // 닫을 때마다 새로 하나 더 열리는 함정 (팝업 폭탄 구간에만)
        if (GM_MINIGAME && GM_MINIGAME.getStage() === 2) {
          setTimeout(() => spawnPopup(), 80 + Math.random() * 120);
          setTimeout(() => spawnPopup(), 200 + Math.random() * 200);
        }
      });
    });
  }

  /* ── 팝업 폭발 (한꺼번에 N개) ─────────────────── */
  function spawnPopupBurst(count = 12, intervalMs = 80) {
    let spawned = 0;
    const timer = setInterval(() => {
      spawnPopup();
      if (++spawned >= count) clearInterval(timer);
    }, intervalMs);
  }

  /* ── 팝업 전체 제거 ──────────────────────────── */
  function clearPopups() {
    const layer = _el("mg-popupLayer");
    if (layer) layer.innerHTML = "";
  }

  /* ── 블랙아웃 로그 폭주 ─────────────────────────
     #mg-crashOverlay 를 보여주고 로그를 계속 추가
  ─────────────────────────────────────────────────── */
  function floodLog(onDone) {
    const overlay = _el("mg-crashOverlay");
    const logEl   = _el("mg-logText");
    if (!overlay || !logEl) { if (onDone) onDone(); return; }

    overlay.classList.remove("mg-hidden");
    logEl.textContent = "";

    const lines = [...GM_DATA.systemLogLines];
    // 뒤에 계속 쌓이는 무한 반복 라인
    const loopLines = [
      "[ERROR] KERNEL_PANIC 반복 감지",
      "[FATAL] 강제 종료 시도 중...",
      "[WARN]  세션 복구 불가",
      "[ERROR] 사용자 추적 실패",
      "[FATAL] 데이터 손실 발생",
      "[INFO]  ...",
      "",
    ];

    let lineIdx = 0;
    let loops   = 0;
    const MAX_LOOPS = 5; // 충분히 쌓이면 onDone 호출

    _logInterval = setInterval(() => {
      const src = lineIdx < lines.length ? lines : loopLines;
      const idx = lineIdx < lines.length ? lineIdx : (lineIdx - lines.length) % loopLines.length;
      logEl.textContent += src[idx] + "\n";

      // 자동 스크롤
      overlay.scrollTop = overlay.scrollHeight;

      lineIdx++;
      if (lineIdx >= lines.length) {
        loops++;
        if (loops >= MAX_LOOPS) {
          clearInterval(_logInterval);
          _logInterval = null;
          if (onDone) setTimeout(onDone, 600);
        }
      }
    }, 55);
  }

  function stopLog() {
    if (_logInterval) { clearInterval(_logInterval); _logInterval = null; }
    const overlay = _el("mg-crashOverlay");
    if (overlay) overlay.classList.add("mg-hidden");
  }

  /* ── 드래그 헬퍼 ─────────────────────────────── */
  function _makeDraggable(el) {
    const title = el.querySelector(".ep-title");
    if (!title) return;
    let dx = 0, dy = 0, mx = 0, my = 0;
    title.style.cursor = "move";
    title.addEventListener("mousedown", e => {
      mx = e.clientX; my = e.clientY;
      dx = el.offsetLeft; dy = el.offsetTop;
      const move = ev => {
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
    return GM_DATA.triggerWords.some(w => t.includes(w.replace(/\s/g, "").toLowerCase()));
  }

  /**
   * 사용자 텍스트 입력 검사
   * — 트리거 단어가 포함되면 게임 단계를 올린다
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
    // globalSearchForm 에 트리거 감지 연동
    const form = document.getElementById("globalSearchForm");
    if (form) {
      form.addEventListener("submit", e => {
        const q = (document.getElementById("globalSearchInput") || {}).value || "";
        checkText(q);
        // 기존 hiddenResetCheck / renderSearch 는 app.js 에서 처리
      });
    }
  }

  return { beep, spawnPopup, spawnPopupBurst, clearPopups, floodLog, stopLog, isTriggerText, checkText, init };
})();
