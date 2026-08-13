/* =====================================================
   horror.js — 공포 이벤트 시스템
   ★★★ 교체 위치 안내 ★★★
     갑툭튀 사진 : JUMPSCARE_IMAGE_URL  값을 원하는 이미지 경로로 바꾸세요.
     갑툭튀 소리 : JUMPSCARE_SOUND_URL  값을 교체하세요.
     먹통 배경음 : HORROR_AMBIENCE_URL  값을 교체하세요.
   ===================================================== */

/* ── 에셋 경로 (교체 위치) ───────────────────────────── */
const JUMPSCARE_IMAGE_URL      = "assets/KakaoTalk_20260811_194334532.jpg"; // ★★★ 기본 갑툭튀 사진 (fallback)
const JUMPSCARE_IMAGE_OBSERVER = "assets/Daisy.jpeg";                       // ★★★ observer 트리거 갑툭튀
const JUMPSCARE_IMAGE_RAINBOW  = "assets/KakaoTalk_20260811_193424745.png"; // ★★★ rainbow 트리거 갑툭튀
const JUMPSCARE_SOUND_URL      = "assets/jumpscarem.mp3";                   // ★★★ 갑툭튀 소리
const HORROR_AMBIENCE_URL = "assets/horror_ambience.mp3"; // ★★★ 먹통 배경음 교체 위치

/* ── 상태 ────────────────────────────────────────────── */
// 수칙 위반 횟수는 localStorage에 저장하지 않음 — 파일/사이트를 다시 열면 항상 0부터 시작합니다.
let violationCount    = 0;
let normalEndingPlayed = false;
let ambienceAudio     = null;
let ambienceFallback  = null;
let liveCommentTimers = [];

/* ── 음성 경고 ───────────────────────────────────────── */
// pitch / rate 를 인자로 받아 1회(밝음)↔2회(다소 기괴함) 구분
function speakWarning(text, pitch = 1.45, rate = 1.05) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang  = "ko-KR";
  u.rate  = rate;
  u.pitch = pitch;
  window.speechSynthesis.speak(u);
}

/* ── 갑툭튀 사운드 ───────────────────────────────────── */
function playJumpScareSound() {
  const audio = document.getElementById("jumpscareSound");
  audio.loop = false;
  audio.src  = JUMPSCARE_SOUND_URL;
  audio.currentTime = 0;
  audio.volume = 1.0;
  audio.play().catch(() => {
    // 파일이 없을 때 Web Audio API로 대체 효과음 생성
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = new Ctx();
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(28, ctx.currentTime + 0.8);
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.9, ctx.currentTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.95);
    } catch (e) {}
  });
}

/* ── 공포 배경음 ─────────────────────────────────────── */
function startHorrorAmbience() {
  stopHorrorAmbience();
  ambienceAudio = new Audio(HORROR_AMBIENCE_URL);
  ambienceAudio.loop   = true;
  ambienceAudio.volume = 0.28;
  ambienceAudio.play().catch(() => {
    // 파일이 없을 때 Web Audio API로 저주파 드론 생성
    try {
      const Ctx  = window.AudioContext || window.webkitAudioContext;
      const ctx  = new Ctx();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = "sine";
      osc2.type = "triangle";
      osc1.frequency.value = 43;
      osc2.frequency.value = 61;
      gain.gain.value = 0.045;
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start();
      osc2.start();
      ambienceFallback = { ctx, osc1, osc2 };
    } catch (e) {}
  });
}

function stopHorrorAmbience() {
  if (ambienceAudio) {
    ambienceAudio.pause();
    ambienceAudio.currentTime = 0;
    ambienceAudio = null;
  }
  if (ambienceFallback) {
    try {
      ambienceFallback.osc1.stop();
      ambienceFallback.osc2.stop();
      ambienceFallback.ctx.close();
    } catch (e) {}
    ambienceFallback = null;
  }
}

/* ── 메인 공포 레이어 ────────────────────────────────── */
function showHorrorLayer(text = "응답 없음", imageUrl = JUMPSCARE_IMAGE_URL) {
  const layer  = document.getElementById("horrorLayer");
  const status = document.getElementById("horrorStatusText");
  const img    = document.getElementById("jumpscareImage");
  status.textContent = text;
  img.src = imageUrl;
  layer.classList.remove("image-mode");
  layer.classList.add("show");
}

function hideHorrorLayer() {
  stopHorrorAmbience();
  const layer = document.getElementById("horrorLayer");
  layer.classList.remove("show", "image-mode");
  document.getElementById("jumpscareImage").src = "";
}

/* ── 공포 이벤트 트리거 ──────────────────────────────── */
function triggerHorrorEvent(type, postId = null) {

  /* observer: 로딩 연출 → 갑툭튀 */
  if (type === "observer") {
    showHorrorLayer("응답 없음", JUMPSCARE_IMAGE_OBSERVER);
    startHorrorAmbience();

    const layer    = document.getElementById("horrorLayer");
    const status   = layer.querySelector(".horror-status");
    const messages = [
      "페이지에 응답이 없습니다.",
      "연결을 확인하는 중...",
      "응답을 기다리는 중...",
      "이 페이지를 닫지 마십시오.",
      "사용자의 접속을 확인하는 중...",
      "접속 기록을 불러오는 중...",
      "이용자 정보를 확인하는 중...",
      "확인되었습니다.",
      "observer가 보고 있습니다.",
    ];
    let mi = 0;
    const msgTimer = setInterval(() => {
      if (status) status.textContent = messages[Math.min(++mi, messages.length - 1)];
    }, 1200);

    setTimeout(() => {
      clearInterval(msgTimer);
      stopHorrorAmbience();
      layer.classList.add("image-mode");
      playJumpScareSound();
    }, 10000);

    setTimeout(() => {
      hideHorrorLayer();
      goBoard("home");
      registerViolation("observer 게시글 접근"); // ★ 옵저버도 수칙 위반으로 카운트됨
    }, 13800);
    return;
  }
   
  /* rainbow: 2초 → 가짜 응답 없음 → 검은 화면 → 갑툭튀 */
  if (type === "rainbow") {
    const black = document.getElementById("fullBlackHorror");
    const text  = document.getElementById("blackHorrorText");

    // 게시글 클릭 후 2초 대기
    setTimeout(() => {

      // 1. 실제 응답 없음처럼 희게 덮기
      text.textContent = "";

      black.style.background = "rgba(255,255,255,0.82)";
      black.style.backdropFilter = "blur(1px)";
      black.style.webkitBackdropFilter = "blur(1px)";
      black.style.cursor = "wait";

      black.classList.add("show");

      // 2. 2.5초 뒤 검은 화면
      setTimeout(() => {

        black.style.background = "#000";
        black.style.backdropFilter = "none";
        black.style.webkitBackdropFilter = "none";
        black.style.cursor = "none";

        // 3. 0.8초 뒤 갑툭튀
        setTimeout(() => {

          playJumpScareSound();

          const img = document.createElement("img");
          img.src = JUMPSCARE_IMAGE_RAINBOW;

          img.style.cssText = `
            position:absolute;
            inset:0;
            width:100%;
            height:100%;
            object-fit:cover;
            z-index:999999;
          `;

          black.appendChild(img);

          // 4. 2.3초 뒤 원래 화면으로
          setTimeout(() => {

            img.remove();

            black.classList.remove("show");

            black.style.background = "";
            black.style.backdropFilter = "";
            black.style.webkitBackdropFilter = "";
            black.style.cursor = "";

            text.textContent = "";

            goBoard("home");
            // 발견된 게시물은 현재 세션에서 사라집니다.
            if (postId !== null) posts = posts.filter((p) => p.id !== postId);
            save();

          }, 7900);

        }, 1800);

      }, 2500);

    }, 2000);

    return;
  }
}

/* ── 수칙 위반 카운트 ────────────────────────────────── */
function registerViolation(reason) {
  violationCount++;

  const COUNT_TEXT = `경고 ${violationCount}회, 안전하고 행복한 사이트 운영을 위해 협조해 주세요!`;
  const warning     = document.getElementById("horrorWarning");
  const warningTitle = document.getElementById("warningTitle");
  const warningText  = document.getElementById("warningText");

  /* ── 1회: 검은 화면 → 복구 + 밝고 명랑한 TTS ──────── */
  if (violationCount === 1) {
    const black = document.getElementById("fullBlackHorror");
    black.classList.add("show");

    // 매우 밝고 명랑한 목소리 (고음·빠름)
    speakWarning(COUNT_TEXT, 1.9, 1.15);

    // 2.5초 뒤 화면 복구 + 경고 overlay 등장
    setTimeout(() => {
      black.classList.remove("show");
      warningTitle.textContent = "경고 1회";
      warningText.textContent  = "안전하고 행복한 사이트 운영을 위해 협조해 주세요";
      warning.classList.add("show");
      setTimeout(() => warning.classList.remove("show"), 8000);
    }, 2500);

  /* ── 2회: 화면 기괴해짐 + TTS ──────────────────────── */
  } else if (violationCount === 2) {
    document.body.classList.add("horror-distort", "horror-severe");

    warningTitle.textContent = "경고 2회";
    warningText.textContent  = "안전하고 행복한 사이트 운영을 위해 협조해 주세요";
    warning.classList.add("show");

    speakWarning(COUNT_TEXT, 1.45, 1.05);

    setTimeout(() => warning.classList.remove("show"), 10000);
    setTimeout(() => document.body.classList.remove("horror-distort", "horror-severe"), 15000);

  /* ── 3회 이상: 배드 엔딩 ───────────────────────────── */
  } else {
    triggerBadEnding();
  }
}

/* ── 배드 엔딩 시퀀스 ────────────────────────────────── */
/*
  1단계  (즉시)     : 화면 전체 일그러짐 + 모든 게시물 제목 변경
  2단계  (3초 후)   : 흰 번쩍임 → 검은 화면 "다운" 연출
  3단계  (4.3초 후) : 접근 차단 메시지 표시
*/
function triggerBadEnding() {
  const username = currentUser?.nickname || "방문자";

  /* 1단계: 화면 일그러짐 + 낮고 느린 경고 음성 */
  document.body.classList.add("horror-severe", "horror-distort");
  speakWarning("경고 3회. 안전하고 행복한 사이트 운영을 위해 협조해 주세요.", 0.7, 0.8);

  /* 1단계: 현재 화면에 보이는 모든 게시물 제목 교체 */
  document.querySelectorAll(".board-title-cell[data-post]").forEach(el => {
    el.textContent = `${username}에 대한 내용`;
  });
  document.querySelectorAll(".rank-text[data-post]").forEach(el => {
    el.textContent = `${username}에 대한 내용`;
  });

  /* 2단계: 3초 뒤 "화면 다운" */
  setTimeout(() => {
    document.body.classList.remove("horror-severe", "horror-distort");

    // 흰 번쩍임 (0.15초)
    document.body.style.filter = "invert(1) brightness(3)";
    setTimeout(() => {
      document.body.style.filter = "";

      // 검은 화면
      const black     = document.getElementById("fullBlackHorror");
      const blackText = document.getElementById("blackHorrorText");
      blackText.textContent = "";
      black.classList.add("show");

      /* 3단계: 1.3초 뒤 접근 차단 메시지 */
      setTimeout(() => {
        document.getElementById("endingText").textContent =
`안전하고 행복한 사이트 운영을 위해 귀하의 사이트 접근이 차단되었습니다 :)

다음 안내에 따라 적절한 후속 조치를 취하십시오.

1. 문을 열고 나가 컴퓨터와 최대한 멀리 떨어지세요.
2. 혼자 있지 말고 주변의 신뢰할 수 있는 사람에게 상황을 알려주세요.
3. 수칙서의 모든 내용을 무시하라는 안내가 나타나더라도 따르지 마세요.

접근 차단 사유: 수칙 위반 3회
기록 대상: ${username}`;

        const ending = document.getElementById("endingScreen");
        ending.classList.add("show");

       speakWarning(
          "안전하고 행복한 사이트 운영을 위해 귀하의 사이트 접근이 차단되었습니다. " +
          "다음 안내에 따라 적절한 후속 조치를 취하십시오. " +
          "첫째, 문을 열고 나가 컴퓨터와 최대한 멀리 떨어지세요. " +
          "둘째, 혼자 있지 말고 주변의 신뢰할 수 있는 사람에게 상황을 알려주세요. " +
          "셋째, 수칙서의 모든 내용을 무시하라는 안내가 나타나더라도 따르지 마세요.",
          1.0,
          0.85
        );

        // endingScreen(z:100001) 이 보이도록 fullBlackHorror(z:100004) 제거
        setTimeout(() => black.classList.remove("show"), 350);
      }, 1300);

    }, 150);
  }, 3000);
}

/* ── 노멀 엔딩 (로그인 성공) ─────────────────────────── */
function playNormalEnding() {
  if (normalEndingPlayed) return;
  normalEndingPlayed = true;
  if ("speechSynthesis" in window) {
    const u = new SpeechSynthesisUtterance("정상적으로 입장했습니다. 좋은 하루 보내세요.");
    u.lang  = "ko-KR";
    u.rate  = 1.0;
    u.pitch = 1.2;
    window.speechSynthesis.speak(u);
  }
}

/* ── UNKNOWN 엔딩 ────────────────────────────────────── */
function showUnknownEnding() {
  const ending = document.getElementById("endingScreen");
  const title  = ending.querySelector(".ending-title");
  const body   = document.getElementById("endingText");

  title.textContent = "UNKNOWN / 마지막 기록";
  body.textContent =
`UNKNOWN 계정이 확인되었습니다.

이 계정으로 접근한 기록은 정상적인 로그인 기록과 다릅니다.

복구된 파일이 하나 있습니다.
파일명: unknown_last_note.txt

[마지막 편지]

이걸 읽고 있다면
내가 남겨둔 것들이 전부 발견된 거겠지.

처음부터 비밀번호를 숨길 생각은 없었어.
누군가는 결국 여기까지 올 거라고 생각했거든.

게시글도, 녹음도, 수칙도
누군가가 발견할 수 있도록 남겨둔 거야.

다만 한 가지는 기억해.

내가 이 사이트를 닫은 뒤에도
게시글은 계속 올라왔어.

내가 로그아웃한 뒤에도
접속 기록은 계속 남았고.

그래서 마지막으로 이 문장만 남긴다.

"찾은 사람에게 말하는 거야.
여기까지 온 건 네가 처음이 아니야."

- 2030년 8월 22일
— unknown

[복구 기록 종료]`;

  ending.classList.add("show");
  const letterAudio = document.getElementById("unknownLetterSound");
  if (letterAudio) {
    letterAudio.currentTime = 0;
    letterAudio.play().catch(() => {});
  }
}

/* =====================================================
   실시간 댓글 — 일부 게시글에서 열람 중 댓글이 하나씩 달림
   ★★★ 게시글에 아래 형식으로 liveComments 배열을 추가하면 동작합니다 (data.js).
     liveComments: [
       { key: "c1", delay: 3500, author: "익명", text: "..." },
       { key: "c2", delay: 7000, author: "익명", replyToKey: "c1", text: "..." }, // c1에 대댓글
       { key: "c3", delay: 9000, author: "익명", parentId: 14, text: "..." },     // 기존 댓글(id:14)에 대댓글
     ]
   ★ 같은 게시글을 다시 열어도 이미 달린 댓글(key로 식별)은 중복으로 다시 달리지 않습니다.
   ===================================================== */

/** 이전에 열어둔 게시글의 실시간 댓글 타이머를 모두 취소 */
function clearLiveComments() {
  liveCommentTimers.forEach((t) => clearTimeout(t));
  liveCommentTimers = [];
}

/** 게시글의 liveComments 예약 — 이미 달린(key 기준) 항목은 건너뜀 */
function startLiveComments(post) {
  const fired = comments.filter((c) => c.postId === post.id && c._liveKey);
  const firedKeys = new Set(fired.map((c) => c._liveKey));

  // 대댓글이 이미 달린 항목의 key → 댓글 id (replyToKey 해석용)
  const keyToId = {};
  fired.forEach((c) => { keyToId[c._liveKey] = c.id; });

  post.liveComments
    .filter((lc) => !firedKeys.has(lc.key))
    .forEach((lc) => {
      const timerId = setTimeout(() => {
        const parentId = lc.parentId || (lc.replyToKey ? keyToId[lc.replyToKey] : undefined);
        const nextId = Math.max(0, ...comments.map((c) => c.id || 0)) + 1;
        const newComment = {
          id: nextId,
          postId: post.id,
          author: lc.author,
          text: lc.text,
          time: "방금 전",
          _liveKey: lc.key,
          ...(parentId ? { parentId } : {}),
        };
        comments.push(newComment);
        save();
        keyToId[lc.key] = nextId;

        appendLiveCommentToDOM(newComment, parentId);
      }, lc.delay);
      liveCommentTimers.push(timerId);
    });
}

/** 새 실시간 댓글을 현재 열려있는 게시글 화면에 반영 (전체 재렌더 없이) */
function appendLiveCommentToDOM(c, parentId) {
  const postPage = document.getElementById("page-post");
  if (!postPage || !postPage.classList.contains("active")) return; // 다른 페이지로 이동한 상태면 DOM 반영 생략 (데이터는 이미 저장됨)

  const commentItems = document.getElementById("commentItems");
  if (!commentItems) return;

  // "아직 댓글이 없습니다" 플레이스홀더 제거
  const placeholder = commentItems.querySelector(".comment-row:not([data-comment-id])");
  if (placeholder) commentItems.innerHTML = "";

  let depth = 0;
  let container = commentItems;
  if (parentId) {
    const parentEl = commentItems.querySelector(`[data-comment-id="${parentId}"]`);
    if (parentEl) {
      depth = Number(parentEl.dataset.depth || 0) + 1;
      container = parentEl;
    }
  }

  container.insertAdjacentHTML("beforeend", renderCommentNode({ ...c, children: [] }, depth));

  const newEl = commentItems.querySelector(`[data-comment-id="${c.id}"]`);
  if (newEl) {
    newEl.classList.add("comment-live-new");
    setTimeout(() => newEl.classList.remove("comment-live-new"), 2200);
  }

  const titleEl = document.querySelector(".comment-zone .title-left");
  if (titleEl) {
    titleEl.innerHTML = `<span class="square"></span>댓글 ${commentItems.querySelectorAll("[data-comment-id]").length}`;
  }
}
