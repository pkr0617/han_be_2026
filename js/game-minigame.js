/* =====================================================
   game-minigame.js — 미니게임 상태 머신
   blueport-horror 의 BP_MINIGAME 이식

   STAGE 0  : 대기 (게임 비활성)
   STAGE 1  : 관찰 — 카카오 팝업 등장, 클릭 기록 시작
   STAGE 2  : 팝업 폭탄 — Windows XP 에러 대화상자 폭주
   STAGE 3  : 블랙아웃 로그 — 전화면 검정 + 시스템 로그 폭주
   STAGE 4  : 불가능 캡챠 — 풀 수 없는 보안 문자
   STAGE END: 엔딩 A / B / C

   점수:
     scoreA  — 침착하게 행동 (팝업 조용히 닫기, 기다리기 등)
     scoreB  — 패닉 행동    (트리거 단어, 빠른 연타 클릭 등)
   ===================================================== */
"use strict";

const GM_MINIGAME = (() => {
  /* ── 상태 ────────────────────────────────────── */
  let stage          = 0;
  let scoreA         = 0;
  let scoreB         = 0;
  let captchaAttempts = 0;
  let rescueUsed     = false;
  let sessionStart   = 0;
  let countdownTimer = null;
  let stuckTimer     = null;
  let rescueTimer    = null;
  const SESSION_LIMIT_MS = 13 * 60 * 1000; // 13분
  const RESCUE_DELAY_MS  = 90 * 1000;       // 90초 무행동 → 구제 배너
  const clickHistory     = [];             // 열람한 게시글 제목

  /* ── 요소 참조 ───────────────────────────────── */
  const _el = id => document.getElementById(id);

  /* ── 유틸 ────────────────────────────────────── */
  function _show(id) { const e = _el(id); if (e) e.classList.remove("mg-hidden"); }
  function _hide(id) { const e = _el(id); if (e) e.classList.add("mg-hidden"); }
  function _rand(lo, hi) { return lo + Math.random() * (hi - lo); }

  /* ── STAGE 1: 관찰 모드 진입 ────────────────── */
  function _enterStage1() {
    stage = 1;
    sessionStart = Date.now();
    console.info("[GM] Stage 1 — 관찰 모드 진입");

    // 카카오 팝업 활성화
    GM_KAKAO.trigger();

    // 세션 카운트다운 시작
    _startCountdown();

    // 90초 후 구제 배너 (처음 한 번만)
    _scheduleRescue();
  }

  /* ── STAGE 2: 팝업 폭탄 ──────────────────────── */
  function _enterStage2() {
    stage = 2;
    console.info("[GM] Stage 2 — 팝업 폭탄");

    GM_TRIGGER.beep(660, 0.12);
    GM_KAKAO.floodMessages(10, 180);

    // 초기 팝업 12개 + 이후 닫을 때마다 추가됨 (game-trigger.js)
    GM_TRIGGER.spawnPopupBurst(12, 90);
  }

  /* ── STAGE 3: 블랙아웃 로그 폭주 ─────────────── */
  function _enterStage3() {
    stage = 3;
    console.info("[GM] Stage 3 — 블랙아웃 로그");

    GM_TRIGGER.clearPopups();
    GM_TRIGGER.beep(220, 0.25);
    GM_KAKAO.floodMessages(8, 120);

    GM_TRIGGER.floodLog(() => {
      // 로그 끝 → 캡챠로
      GM_TRIGGER.stopLog();
      _enterStage4();
    });
  }

  /* ── STAGE 4: 불가능 캡챠 ─────────────────────
     풀 수록 blur 가 강해지고 절대 맞출 수 없게 됨
  ─────────────────────────────────────────────── */
  function _enterStage4() {
    stage = 4;
    captchaAttempts = 0;
    console.info("[GM] Stage 4 — 불가능 캡챠");

    _show("mg-captchaOverlay");
    _renderCaptcha();
  }

  /* ── 캡챠 렌더링 ─────────────────────────────── */
  const CAPTCHA_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  function _genCaptchaText(len) {
    let s = "";
    for (let i = 0; i < len; i++) s += CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)];
    return s;
  }

  let _currentCaptcha = "";
  function _renderCaptcha() {
    const len = 5 + Math.min(captchaAttempts, 5); // 시도할수록 길어짐
    _currentCaptcha = _genCaptchaText(len);

    const textEl  = document.querySelector(".mg-captcha-text");
    const imageEl = document.querySelector(".mg-captcha-image");
    const inputEl = document.querySelector(".mg-captcha-input");
    const msgEl   = document.querySelector(".mg-captcha-msg");
    if (textEl)  textEl.textContent = _currentCaptcha;
    if (inputEl) { inputEl.value = ""; inputEl.focus(); }
    if (msgEl)   msgEl.textContent = "";

    // 시도 횟수에 따라 blur 증가 (처음부터 약간 흐림)
    const blurPx = Math.min(2 + captchaAttempts * 1.8, 14);
    if (imageEl) imageEl.style.filter = `blur(${blurPx}px)`;
    if (textEl)  textEl.style.filter  = `blur(${blurPx}px)`;

    // 3회 이상 시도 시 텍스트도 오염
    if (captchaAttempts >= 3 && typeof GM_CORRUPT !== "undefined") {
      const intensity = Math.min(0.1 * captchaAttempts, 0.7);
      if (textEl) textEl.textContent = GM_CORRUPT.mutate(_currentCaptcha, intensity);
    }
  }

  function _submitCaptcha(answer) {
    captchaAttempts++;
    const msgEl = document.querySelector(".mg-captcha-msg");

    // 정답을 넣어도 항상 틀린 것으로 처리 (조작된 캡챠)
    const wrongMsgs = [
      "보안 문자가 일치하지 않습니다. 다시 시도해 주세요.",
      "잘못된 입력입니다. 문자를 다시 확인하세요.",
      "오류: 입력값이 서버에서 거부되었습니다.",
      "세션 만료로 캡챠가 갱신되었습니다.",
      "비정상적인 입력이 감지되었습니다.",
    ];

    if (msgEl) msgEl.textContent = wrongMsgs[Math.min(captchaAttempts - 1, wrongMsgs.length - 1)];
    GM_TRIGGER.beep(330, 0.08);

    // 5회 시도 시 scoreB 올리고 다시 렌더
    if (captchaAttempts >= 5) scoreB++;

    // 10회 시도 시 → 엔딩으로
    if (captchaAttempts >= 10) {
      _hide("mg-captchaOverlay");
      _triggerEnding();
      return;
    }

    // 계속 렌더 (점점 흐려짐)
    setTimeout(_renderCaptcha, 400);
  }

  /* ── 엔딩 결정 ───────────────────────────────── */
  function _triggerEnding() {
    _stopCountdown();
    _clearTimers();
    GM_KAKAO.reset();
    GM_TRIGGER.clearPopups();
    GM_TRIGGER.stopLog();
    _hide("mg-countdownWidget");
    _hide("mg-rescueBanner");

    let endKey;
    if (scoreA > scoreB + 2)      endKey = "A";
    else if (scoreB > scoreA + 2) endKey = "B";
    else                          endKey = "C";

    _showEnding(endKey);
  }

  /* ── 엔딩 화면 표시 ──────────────────────────── */
  function _showEnding(key) {
    const data   = GM_DATA.endings[key];
    const overlay = _el("mg-endingOverlay");
    if (!overlay) return;

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

  /* ── 세션 카운트다운 ─────────────────────────── */
  function _startCountdown() {
    _show("mg-countdownWidget");
    const textEl = _el("mg-countdownText");
    countdownTimer = setInterval(() => {
      const elapsed = Date.now() - sessionStart;
      const remain  = Math.max(0, SESSION_LIMIT_MS - elapsed);
      const m = Math.floor(remain / 60000);
      const s = Math.floor((remain % 60000) / 1000);
      if (textEl) textEl.textContent = `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;

      if (remain <= 0) {
        _stopCountdown();
        // 시간 초과 → scoreB 올리고 다음 단계
        scoreB += 2;
        escalate("timeout");
      }
    }, 1000);
  }

  function _stopCountdown() {
    if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
  }

  /* ── 구제 배너 (90초 무행동) ─────────────────── */
  function _scheduleRescue() {
    if (rescueUsed) return;
    rescueTimer = setTimeout(() => {
      if (stage >= 2) return; // 이미 다음 단계면 불필요
      _show("mg-rescueBanner");
      // 클릭 처리는 init() 의 이벤트 위임으로 통합됨
    }, RESCUE_DELAY_MS);
  }

  function _clearTimers() {
    if (stuckTimer)  { clearTimeout(stuckTimer);  stuckTimer  = null; }
    if (rescueTimer) { clearTimeout(rescueTimer);  rescueTimer = null; }
  }

  /* ── 공개 API ────────────────────────────────── */

  /**
   * 게임 시작 (stage 0 → 1)
   * 첫 게시글 열람 시 render.js 에서 호출
   */
  function start() {
    if (stage !== 0) return;
    _enterStage1();
  }

  /**
   * 단계 상승
   * reason: "trigger_word" | "timeout" | "post_count" | "manual"
   */
  function escalate(reason) {
    console.info("[GM] escalate:", reason, "| stage:", stage);
    if (reason === "trigger_word" || reason === "post_count") scoreB++;
    if (reason === "timeout") scoreB += 2;

    if      (stage === 0) _enterStage1();
    else if (stage === 1) _enterStage2();
    else if (stage === 2) _enterStage3();
    else if (stage === 3) _enterStage4();
    else if (stage === 4) _triggerEnding();
  }

  /** 게시글 열람 기록 */
  function recordPost(title) {
    if (!title || stage === 0) return;
    clickHistory.push(title);

    // 5개 이상 읽으면 단계 상승
    if (clickHistory.length === 5) {
      escalate("post_count");
    }
    // 카카오에 알림
    if (GM_KAKAO.active) {
      setTimeout(() => {
        const tmpl = GM_DATA.pick(GM_DATA.kakaoFloodTemplates);
        GM_KAKAO.addMessage(tmpl.replace(/\{POST\}/g, title));
      }, _rand(800, 2200));
    }
  }

  /** 침착한 행동 점수 */
  function scoreGood() { scoreA++; }

  /** 현재 스테이지 반환 (game-trigger.js 에서 참조) */
  function getStage() { return stage; }

  /** 전체 리셋 */
  function reset() {
    stage = 0; scoreA = 0; scoreB = 0;
    captchaAttempts = 0; rescueUsed = false;
    sessionStart = 0; clickHistory.length = 0;
    _stopCountdown(); _clearTimers();
    GM_KAKAO.reset();
    GM_TRIGGER.clearPopups();
    GM_TRIGGER.stopLog();
    _hide("mg-countdownWidget");
    _hide("mg-rescueBanner");
    _hide("mg-captchaOverlay");
    _hide("mg-endingOverlay");
    _hide("mg-crashOverlay");
  }

  /* ── 초기화 ──────────────────────────────────── */
  function init() {
    // ── 게시글 클릭 → 게임 시작 / 열람 기록 ──────
    document.addEventListener("click", e => {
      const btn = e.target.closest("[data-post]");
      if (!btn) return;
      const id = parseInt(btn.dataset.post, 10);
      if (!id) return;

      // 첫 게시글 클릭 시 게임 시작
      if (stage === 0) start();

      // 제목 lookup (store.js 의 posts 변수)
      if (typeof posts !== "undefined" && Array.isArray(posts)) {
        const p = posts.find(x => x.id === id);
        if (p && p.title) recordPost(p.title || "(제목 없음)");
      }
    }, true); // capture 단계 — app.js 이전에 실행됨

    // ── 캡챠 제출 버튼 ───────────────────────────
    document.addEventListener("click", e => {
      if (!e.target.matches(".mg-captcha-submit")) return;
      const inp = document.querySelector(".mg-captcha-input");
      _submitCaptcha(inp ? inp.value.trim() : "");
    });
    // 캡챠 Enter 키
    document.addEventListener("keydown", e => {
      if (e.key !== "Enter" || stage !== 4) return;
      const inp = document.querySelector(".mg-captcha-input");
      if (inp && document.activeElement === inp) {
        _submitCaptcha(inp.value.trim());
      }
    });

    // ── Ctrl+Shift+R → 관리자 패널 ──────────────
    document.addEventListener("keydown", e => {
      if (e.ctrlKey && e.shiftKey && e.key === "R") {
        e.preventDefault();
        _toggleAdmin();
      }
    });

    // ── 구제 배너 클릭 (동적 삽입이므로 위임) ────
    document.addEventListener("click", e => {
      if (!e.target.closest("#mg-rescueBanner")) return;
      rescueUsed = true;
      _hide("mg-rescueBanner");
      scoreA++;
      if (typeof showModal === "function") {
        showModal("고객센터", "죄송합니다. 현재 담당자가 자리를 비웠습니다.\n잠시 후 다시 시도해 주세요.", null);
      }
    });
  }

  /* ── 관리자 패널 ─────────────────────────────── */
  function _toggleAdmin() {
    const panel = _el("mg-adminPanel");
    if (!panel) return;
    panel.classList.toggle("mg-hidden");
    // 내용 채우기
    panel.innerHTML = `
      <div class="mg-admin-title">★ 게임 관리자 패널</div>
      <div class="mg-admin-row">스테이지: <b>${stage}</b></div>
      <div class="mg-admin-row">점수 A: ${scoreA} / B: ${scoreB}</div>
      <div class="mg-admin-row">열람 게시글: ${clickHistory.length}개</div>
      <div class="mg-admin-row">캡챠 시도: ${captchaAttempts}</div>
      <button class="mg-admin-btn" id="mg-adminNext">다음 단계로 ▶</button>
      <button class="mg-admin-btn" id="mg-adminEndA">엔딩 A 보기</button>
      <button class="mg-admin-btn" id="mg-adminEndB">엔딩 B 보기</button>
      <button class="mg-admin-btn" id="mg-adminEndC">엔딩 C 보기</button>
      <button class="mg-admin-btn reset" id="mg-adminReset">전체 리셋</button>
      <button class="mg-admin-btn" id="mg-adminClose">닫기</button>`;

    _el("mg-adminNext")?.addEventListener("click",  () => { panel.classList.add("mg-hidden"); escalate("manual"); });
    _el("mg-adminEndA")?.addEventListener("click",  () => { panel.classList.add("mg-hidden"); _showEnding("A"); });
    _el("mg-adminEndB")?.addEventListener("click",  () => { panel.classList.add("mg-hidden"); _showEnding("B"); });
    _el("mg-adminEndC")?.addEventListener("click",  () => { panel.classList.add("mg-hidden"); _showEnding("C"); });
    _el("mg-adminReset")?.addEventListener("click", () => { panel.classList.add("mg-hidden"); reset(); });
    _el("mg-adminClose")?.addEventListener("click", () => panel.classList.add("mg-hidden"));
  }

  return { start, escalate, recordPost, scoreGood, getStage, reset, init, clickHistory };
})();
