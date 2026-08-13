/* =====================================================
   game-minigame.js — 미니게임 상태 머신
   blueport-horror 의 BP_MINIGAME 을 원본 흐름 그대로 이식

   ★ v2 변경점 (2026-08): 원본과 다르게 흘러가던 부분을 원본에 맞춤
     - "관찰" 단계(카카오 위젯 + 90초 무행동 시 배너) 를 별도 단계로
       두지 않음. 게시글을 클릭하면 곧장 캡챠 단계로 들어감.
     - 고객센터 90초 구제 배너는 "일정 시간 지나면 뜨는 경고"가 아니라,
       캡챠/팝업폭탄/블랙아웃 각 단계에서 사용자가 멈춰있을 때
       "그 단계를 강제로 통과시켜주는" 구제 수단으로만 동작함
       (클릭해야 통과되고, 안 누르면 그냥 계속 멈춰있음).
     - 팝업폭탄은 사용자가 닫을 때마다 더 늘어나는 함정이 아니라,
       정해진 개수(45~75개)가 자동으로 점점 빠르게 쏟아지다 끝남.
     - 캡챠는 10회가 아니라 4회 실패하면 "시스템 오류"로 자동 통과.
     - 엔딩 분기에 구제 배너 사용 횟수가 반영됨(2회 이상 쓰면 엔딩 C).

   STAGE 0 : 대기 (게임 비활성)
   STAGE 1 : 조작된 캡챠 — 뭘 넣어도 항상 실패, 4회째엔 강제로 다음 단계로
   STAGE 2 : 팝업 폭탄 — Windows XP 스타일 에러창이 자동으로 폭주
   STAGE 3 : 블랙아웃 로그 — 전화면 검정 + 시스템 로그 폭주
   STAGE 4 : 종료 (엔딩 A / B / C)

   점수:
     scoreA — 침착/순응 (캡챠를 계속 순순히 다시 시도, 팝업 X로 무시, 카톡 무시)
     scoreB — 패닉/개입 (팝업 확인 클릭, 카톡 클릭, 구제 배너 사용)
   엔딩 분기:
     - 구제 배너 2회 이상 사용 또는 |A-B| <= 5(근접) → 엔딩 C
     - 그 외 A > B → 엔딩 A, 그 외 → 엔딩 B
     - 세션 시간(12~15분) 초과 시 무조건 엔딩 C
   ===================================================== */
"use strict";

const GM_MINIGAME = (() => {
  const NEAR_TIE_THRESHOLD = 5;
  const RESCUE_HEAVY_USE   = 2;

  /* ── 상태 ────────────────────────────────────── */
  let scoreA          = 0;
  let scoreB          = 0;
  let rescueUsedCount = 0;
  let stage           = 0; // 0=대기, 1=캡챠, 2=팝업폭탄, 3=블랙아웃, 4=종료
  let started         = false;
  let ended           = false;
  let captchaAttempts = 0;
  let kakaoShownCaptcha  = false;
  let kakaoShownBlackout = false;

  let sessionTimerId = null;
  let sessionEndsAt  = null;
  let stuckTimerId   = null;

  const clickHistory = []; // 열람한 게시글 제목 (카카오 메시지 치환용)

  /* ── 요소 참조 ───────────────────────────────── */
  const _el = id => document.getElementById(id);
  function _show(id) { const e = _el(id); if (e) e.classList.remove("mg-hidden"); }
  function _hide(id) { const e = _el(id); if (e) e.classList.add("mg-hidden"); }

  function addA(n) { scoreA += n; }
  function addB(n) { scoreB += n; }

  /* ── 고객센터 90초 구제 (모든 단계에서 재사용) ─── */
  function armStuckTimer(onRescue) {
    clearStuckTimer();
    stuckTimerId = setTimeout(() => showRescueBanner(onRescue), 90000);
  }
  function clearStuckTimer() {
    if (stuckTimerId) { clearTimeout(stuckTimerId); stuckTimerId = null; }
    hideRescueBanner();
  }
  function showRescueBanner(onRescue) {
    const el = _el("mg-rescueBanner");
    if (!el) return;
    _show("mg-rescueBanner");
    el.onclick = () => {
      rescueUsedCount++;
      addB(5);
      hideRescueBanner();
      onRescue();
    };
  }
  function hideRescueBanner() {
    const el = _el("mg-rescueBanner");
    if (!el) return;
    el.classList.add("mg-hidden");
    el.onclick = null;
  }

  /* ── 세션 타이머 (캡챠 진입 시점부터 12~15분) ───── */
  function startSessionTimer() {
    const minutes = 12 + Math.random() * 3;
    sessionEndsAt = Date.now() + minutes * 60000;
    _show("mg-countdownWidget");
    tickSessionTimer();
  }
  function tickSessionTimer() {
    if (ended) return;
    const remain = sessionEndsAt - Date.now();
    if (remain <= 0) {
      addB(5);
      finishGame("C");
      return;
    }
    const textEl = _el("mg-countdownText");
    const m = Math.floor(remain / 60000);
    const s = Math.floor((remain % 60000) / 1000);
    if (textEl) textEl.textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    sessionTimerId = setTimeout(tickSessionTimer, 500);
  }
  function stopSessionTimer() {
    if (sessionTimerId) { clearTimeout(sessionTimerId); sessionTimerId = null; }
    _hide("mg-countdownWidget");
  }

  /* ── 시작 (게시글 클릭 / 트리거 단어) ──────────── */
  function start() {
    if (started || ended) return;
    started = true;
    enterCaptcha();
  }

  /* ── STAGE 1: 조작된 캡챠 ─────────────────────── */
  function enterCaptcha() {
    stage = 1;
    captchaAttempts = 0;
    startSessionTimer();
    _show("mg-captchaOverlay");
    renderCaptcha();
    armStuckTimer(forceCaptchaPass);

    if (!kakaoShownCaptcha) {
      kakaoShownCaptcha = true;
      setTimeout(() => GM_KAKAO.trigger(), 4000 + Math.random() * 4000);
    }
  }

  const CAPTCHA_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  function renderCaptcha() {
    const distortion = Math.min(1, captchaAttempts * 0.28);
    let raw = "";
    for (let i = 0; i < 5; i++) raw += CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)];

    const textEl = document.querySelector(".mg-captcha-text");
    if (textEl) {
      textEl.innerHTML = raw.split("").map((c) => {
        const rot  = (Math.random() * 2 - 1) * (8 + distortion * 38);
        const dy   = (Math.random() * 2 - 1) * (2 + distortion * 14);
        const blur = (distortion * 2.2).toFixed(1);
        return `<span style="display:inline-block;transform:rotate(${rot.toFixed(1)}deg) translateY(${dy.toFixed(1)}px);filter:blur(${blur}px);">${c}</span>`;
      }).join("");
    }

    const msgEl = document.querySelector(".mg-captcha-msg");
    if (msgEl) msgEl.textContent = captchaAttempts === 0 ? "" : "인증에 실패했습니다. 다시 시도해주세요.";

    const inputEl = document.querySelector(".mg-captcha-input");
    if (inputEl) { inputEl.value = ""; inputEl.focus(); }
  }

  function submitCaptcha() {
    if (stage !== 1) return;
    captchaAttempts++;
    addA(1); // 틀려도 순순히 다시 시도 = 침착/순응 쪽 점수
    GM_TRIGGER.beep(480, 0.07);

    if (captchaAttempts >= 4) {
      const msgEl = document.querySelector(".mg-captcha-msg");
      if (msgEl) msgEl.textContent = "시스템 오류가 발생했습니다...";
      setTimeout(leaveCaptcha, 900);
      return;
    }
    renderCaptcha();
  }

  function forceCaptchaPass() {
    if (stage !== 1) return;
    const msgEl = document.querySelector(".mg-captcha-msg");
    if (msgEl) msgEl.textContent = "고객센터가 인증을 대신 처리했습니다.";
    setTimeout(leaveCaptcha, 700);
  }

  function leaveCaptcha() {
    clearStuckTimer();
    _hide("mg-captchaOverlay");
    enterPopupBomb();
  }

  /* ── STAGE 2: 팝업 폭탄 (정해진 개수가 자동으로 쏟아짐) ── */
  function enterPopupBomb() {
    stage = 2;
    armStuckTimer(() => { GM_TRIGGER.clearPopups(); enterBlackout(); });
    GM_TRIGGER.spawnPopupBurst(
      () => { clearStuckTimer(); enterBlackout(); },
      (kind) => { if (kind === "ok") addB(1); else addA(1); },
    );
  }

  /* ── STAGE 3: 블랙아웃 로그 폭주 ───────────────── */
  function enterBlackout() {
    stage = 3;
    armStuckTimer(finishAndResolve);

    if (!kakaoShownBlackout) {
      kakaoShownBlackout = true;
      setTimeout(() => GM_KAKAO.trigger(), 1500 + Math.random() * 2500);
    }

    GM_TRIGGER.beep(220, 0.2);
    GM_TRIGGER.floodLog(() => {
      clearStuckTimer();
      finishAndResolve();
    });
  }

  /* ── 카카오 상호작용 콜백 ──────────────────────── */
  function onKakaoClicked() { addB(3); }
  function onKakaoIgnored() { addA(2); }

  /* ── 종료 / 엔딩 분기 ──────────────────────────── */
  function finishAndResolve() {
    const diff = scoreA - scoreB;
    let ending;
    if (rescueUsedCount >= RESCUE_HEAVY_USE || Math.abs(diff) <= NEAR_TIE_THRESHOLD) ending = "C";
    else if (diff > 0) ending = "A";
    else ending = "B";
    finishGame(ending);
  }

  function finishGame(ending) {
    if (ended) return;
    ended = true;
    stage = 4;
    stopSessionTimer();
    clearStuckTimer();
    GM_TRIGGER.clearPopups();
    GM_TRIGGER.stopLog();
    _hide("mg-captchaOverlay");
    _hide("mg-crashOverlay");
    showEnding(ending);
  }

  /* ── 엔딩 화면 표시 ────────────────────────────── */
  function showEnding(key) {
    const data    = GM_DATA.endings[key];
    const overlay = _el("mg-endingOverlay");
    if (!overlay || !data) return;

    overlay.innerHTML = `
      <div class="mg-ending-box">
        <img class="mg-ending-stamp" src="${data.stamp}" alt="엔딩 ${key}">
        <div class="mg-ending-title">${data.title}</div>
        <div class="mg-ending-desc">${data.desc.replace(/\n/g, "<br>")}</div>
        <button class="mg-ending-close" id="mg-endingCloseBtn">확인</button>
      </div>`;

    overlay.classList.remove("mg-hidden");

    const closeBtn = _el("mg-endingCloseBtn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        overlay.classList.add("mg-hidden");
        reset();
      });
    }
  }

  /* ── 트리거(검색어 등) 감지 시 호출 ─────────────
     원본과 동일하게, 이미 시작됐으면 아무 효과 없음(단계 스킵 X) —
     오직 "게임을 시작시키는" 용도로만 사용됨.
  ─────────────────────────────────────────────── */
  function escalate(reason) {
    console.info("[GM] trigger:", reason, "| stage:", stage);
    if (stage === 0) start();
  }

  /** 게시글 열람 기록 (카카오 메시지에 제목 치환용) */
  function recordPost(title) {
    if (!title || stage === 0) return;
    clickHistory.push(title);
  }

  /** 현재 스테이지 반환 */
  function getStage() { return stage; }

  /** 전체 리셋 */
  function reset() {
    scoreA = 0; scoreB = 0; rescueUsedCount = 0;
    stage = 0; started = false; ended = false;
    captchaAttempts = 0;
    kakaoShownCaptcha = false; kakaoShownBlackout = false;
    clickHistory.length = 0;

    stopSessionTimer();
    clearStuckTimer();
    GM_KAKAO.reset();
    GM_TRIGGER.clearPopups();
    GM_TRIGGER.stopLog();
    _hide("mg-countdownWidget");
    _hide("mg-rescueBanner");
    _hide("mg-captchaOverlay");
    _hide("mg-endingOverlay");
    _hide("mg-crashOverlay");
  }

  /* ── 관리자 디버그용: 현재 단계를 강제로 넘김 ──── */
  function _adminForceNext() {
    clearStuckTimer();
    if      (stage === 0) start();
    else if (stage === 1) leaveCaptcha();
    else if (stage === 2) { GM_TRIGGER.clearPopups(); enterBlackout(); }
    else if (stage === 3) finishAndResolve();
  }

  /* ── 초기화 ────────────────────────────────────── */
  function init() {
    // ── 게시글 클릭 → 게임 시작 / 열람 기록 ──────
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-post]");
      if (!btn) return;
      const id = parseInt(btn.dataset.post, 10);
      if (!id) return;

      if (stage === 0) start();

      if (typeof posts !== "undefined" && Array.isArray(posts)) {
        const p = posts.find((x) => x.id === id);
        if (p && p.title) recordPost(p.title || "(제목 없음)");
      }
    }, true); // capture 단계 — app.js 이전에 실행됨

    // ── 캡챠 제출 버튼 / Enter ────────────────────
    document.addEventListener("click", (e) => {
      if (!e.target.matches(".mg-captcha-submit")) return;
      submitCaptcha();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" || stage !== 1) return;
      const inp = document.querySelector(".mg-captcha-input");
      if (inp && document.activeElement === inp) submitCaptcha();
    });

    // ── Ctrl+Shift+R → 관리자 패널 ────────────────
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === "R") {
        e.preventDefault();
        _toggleAdmin();
      }
    });
  }

  /* ── 관리자 패널 ───────────────────────────────── */
  function _toggleAdmin() {
    const panel = _el("mg-adminPanel");
    if (!panel) return;
    panel.classList.toggle("mg-hidden");
    if (panel.classList.contains("mg-hidden")) return;

    panel.innerHTML = `
      <div class="mg-admin-title">★ 게임 관리자 패널</div>
      <div class="mg-admin-row">스테이지: <b>${stage}</b> (0=대기 1=캡챠 2=팝업폭탄 3=블랙아웃 4=종료)</div>
      <div class="mg-admin-row">점수 A: ${scoreA} / B: ${scoreB}</div>
      <div class="mg-admin-row">구제 배너 사용: ${rescueUsedCount}회</div>
      <div class="mg-admin-row">열람 게시글: ${clickHistory.length}개</div>
      <div class="mg-admin-row">캡챠 시도: ${captchaAttempts}</div>
      <button class="mg-admin-btn" id="mg-adminNext">다음 단계로 ▶</button>
      <button class="mg-admin-btn" id="mg-adminEndA">엔딩 A 보기</button>
      <button class="mg-admin-btn" id="mg-adminEndB">엔딩 B 보기</button>
      <button class="mg-admin-btn" id="mg-adminEndC">엔딩 C 보기</button>
      <button class="mg-admin-btn reset" id="mg-adminReset">전체 리셋</button>
      <button class="mg-admin-btn" id="mg-adminClose">닫기</button>`;

    _el("mg-adminNext")?.addEventListener("click",  () => { panel.classList.add("mg-hidden"); _adminForceNext(); });
    _el("mg-adminEndA")?.addEventListener("click",  () => { panel.classList.add("mg-hidden"); showEnding("A"); });
    _el("mg-adminEndB")?.addEventListener("click",  () => { panel.classList.add("mg-hidden"); showEnding("B"); });
    _el("mg-adminEndC")?.addEventListener("click",  () => { panel.classList.add("mg-hidden"); showEnding("C"); });
    _el("mg-adminReset")?.addEventListener("click", () => { panel.classList.add("mg-hidden"); reset(); });
    _el("mg-adminClose")?.addEventListener("click", () => panel.classList.add("mg-hidden"));
  }

  return { start, escalate, recordPost, getStage, reset, init, onKakaoClicked, onKakaoIgnored, clickHistory };
})();
