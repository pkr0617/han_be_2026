/* =====================================================
   game-data.js — 미니게임 콘텐츠 데이터
   blueport-horror 의 BP_DATA 를 한찌.com 맥락으로 이식
   ===================================================== */
"use strict";

const GM_DATA = (() => {
  /* ── 유틸 ───────────────────────────────────────── */
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  /* ── 트리거 단어 ─────────────────────────────────
     검색창/게시글 입력에서 감지하면 게임 시작 또는 단계 상승
  ─────────────────────────────────────────────────── */
  const triggerWords = [
    "살려줘", "help", "나가고싶어", "그만해", "나가게해줘",
    "이상해", "무섭다", "무서워", "여기서나가고싶어",
    "비밀", "비밀번호", "관리자", "admin", "숨겨진",
    "unknown", "모르는사람", "귀신", "여기뭔가있어"
  ];

  /* ── 카카오 첫 메시지 ────────────────────────────
     사용자가 게시글을 읽기 시작하면 튀어나오는 오프너
  ─────────────────────────────────────────────────── */
  const kakaoOpeners = [
    "야, 너 지금 거기 보고 있는 거 알고 있어.",
    "오늘 몇 번째로 들어온 거야? 다 기록돼.",
    "그거 읽지 마. 진심으로.",
    "지금 열어보면 안 되는 거 열었어.",
    "거기 오래 있으면 안 좋은 거 알지?",
  ];

  /* ── 카카오 폭주 메시지 ──────────────────────────
     채팅이 폭주할 때 사용 — {POST} 를 열람한 게시글 제목으로 교체
  ─────────────────────────────────────────────────── */
  const kakaoFloodTemplates = [
    "{POST} — 그거 왜 읽은 거야?",
    "방금 {POST} 열었잖아. 다 보고 있었어.",
    "{POST}에 댓글 달 생각이었어?",
    "너 {POST} 검색한 거 기억해?",
    "학교 서버 로그에 다 남아. {POST}도 포함해서.",
    "야. {POST}. 클릭. 기록. 전송 완료.",
    "알림 도착: {POST} 열람 감지",
    "이미 늦었어. {POST} 본 순간부터.",
    "그거 진짜 읽으면 안 됐는데. ({POST})",
    "한찌.com 시스템: {POST} 접근 기록됨.",
    "삭제해도 남아. {POST}.",
    "나와. 지금 당장. {POST} 같은 거 보지 말고.",
    "한민고 서버에서 이상 접속이 감지됨: {POST}",
    "관리자에게 알림이 전송됐어. {POST} 때문에.",
    "...",
    "거기 있는 거 알고 있어.",
    "왜 아직도 있어?",
    "나가.",
    "지금 바로 나가.",
    "무시해봤자야.",
    "한찌.com 세션이 기록되고 있습니다.",
    "이 대화도 저장됩니다.",
  ];

  /* ── 에러 팝업 메시지 ────────────────────────────
     Windows XP 스타일 오류 대화상자 내용
  ─────────────────────────────────────────────────── */
  const errorMessages = [
    { title:"한찌.com 오류", body:"예기치 않은 오류가 발생했습니다.\n오류 코드: 0x0000한000" },
    { title:"시스템 경고", body:"비정상적인 접속이 감지되었습니다.\n네트워크 연결을 확인하세요." },
    { title:"hanmin.edu.kr", body:"학교 서버와의 연결이 끊어졌습니다.\n담당자에게 문의하세요." },
    { title:"한찌.com - 세션 오류", body:"세션이 만료되었습니다.\n다시 로그인해주세요." },
    { title:"메모리 부족", body:"사용 가능한 메모리가 부족합니다.\n프로그램을 종료하세요." },
    { title:"한찌.com 오류", body:"파일을 찾을 수 없습니다.\nposts/unknown/draft_01.html" },
    { title:"경고", body:"귀하의 접속 기록이 저장되고 있습니다.\n잠시 후 로그아웃됩니다." },
    { title:"한찌.com", body:"서버 응답 없음 (TIMEOUT 408)\n게시글을 불러올 수 없습니다." },
    { title:"시스템", body:"디스크 공간이 부족합니다.\n불필요한 파일을 삭제하세요." },
    { title:"오류 보고", body:"오류를 Microsoft에 보고하시겠습니까?\n[보내기] [보내지 않기]" },
    { title:"hanmin.edu.kr 보안 경고", body:"이 사이트의 보안 인증서에 문제가 있습니다.\n계속하시겠습니까?" },
    { title:"한찌.com", body:"알 수 없는 사용자가 게시물을 열람 중입니다.\n세션을 종료하세요." },
    { title:"접근 불가", body:"이 게시물에 접근할 권한이 없습니다.\n오류 코드: 403-FORBIDDEN" },
    { title:"네트워크 오류", body:"연결이 강제로 종료되었습니다.\nERR_CONNECTION_RESET" },
    { title:"한찌.com 시스템", body:"비정상 데이터가 감지되었습니다.\n보안팀에 신고되었습니다." },
  ];

  /* ── 블랙아웃 시스템 로그 ────────────────────────
     3단계 블랙아웃 때 화면에 쏟아지는 로그 텍스트
  ─────────────────────────────────────────────────── */
  const systemLogLines = [
    "SYSTEM LOG - HANMIN.EDU.KR",
    "────────────────────────────",
    "[INFO]  SESSION_INIT: user=GUEST_0x4F91",
    "[INFO]  DB_CONNECT: posts.db @ 127.0.0.1:5432",
    "[INFO]  CACHE_HIT: /board/hot  (220ms)",
    "[WARN]  IRREGULAR ACCESS: post_id=9001 flagged",
    "[INFO]  SERVING: /board/free/3 -> 200 OK",
    "[WARN]  RATE_LIMIT: 47 requests / 10s",
    "[INFO]  USER_LOG: viewed post_id=3 (observer)",
    "[ERROR] MEMORY_OVERFLOW: heap exceeded 512MB",
    "[WARN]  UNKNOWN_SOCKET: 10.0.0.???:63741 connected",
    "[INFO]  THUMBNAIL_GEN: 0 files processed",
    "[ERROR] SEGFAULT at 0x00007ffd3c4a1220",
    "[INFO]  SESSION: GUEST_0x4F91 idle 00:08:34",
    "[WARN]  ACCOUNT_ANOMALY: login attempt unknown/0917",
    "[INFO]  AUDIO_STREAM: horror_ambience.mp3 playing",
    "[ERROR] WATCHDOG: process not responding",
    "[WARN]  KEYWORD_DETECTED: '살려줘' in search_query",
    "[INFO]  RECORD_START: session capture initiated",
    "[ERROR] KERNEL_PANIC: 비정상적 접속 감지됨",
    "[FATAL] SHUTDOWN INITIATED",
    "────────────────────────────",
    "한찌.com 서버가 응답하지 않습니다.",
    "────────────────────────────",
    "[FATAL] CONNECTION TERMINATED",
    "[INFO]  PROCESS ENDED",
    "",
  ];

  /* ── 엔딩 정의 ───────────────────────────────────
     A: 조용히 로그아웃 (scoreA 높음)
     B: 강제 종료    (scoreB 높음)
     C: 알 수 없음  (균등)
  ─────────────────────────────────────────────────── */
  const endings = {
    A: {
      stamp: "assets/ending_a_stamp.svg",
      title: "무사히 로그아웃",
      desc:
        "당신은 한찌.com에서 조용히 자리를 떠났습니다.\n" +
        "기록은 남겠지만, 적어도 당신은 무사합니다.\n\n" +
        "다음에 다시 돌아오지 않기를 바랍니다.",
    },
    B: {
      stamp: "assets/ending_b_stamp.svg",
      title: "연결 강제 종료",
      desc:
        "한찌.com 서버가 귀하의 연결을 강제 종료했습니다.\n" +
        "귀하의 접속 기록은 학교 측에 전달되었습니다.\n\n" +
        "오류 코드: 0x5452 — SESSION_FORCE_CLOSED",
    },
    C: {
      stamp: "assets/ending_c_stamp.svg",
      title: "알 수 없음",
      desc:
        "당신이 무엇을 선택했는지\n" +
        "시스템이 판단하지 못했습니다.\n\n" +
        "기록만 남아있습니다.\n" +
        "...",
    },
  };

  /* ── 팬텀 댓글 (사용자가 쓰지 않은 댓글이 보이는 효과) ── */
  const phantomReplies = [
    "너 지금 이거 읽고 있지",
    "여기 오래 있으면 안 돼",
    "이 게시글은 삭제됐어야 했는데",
    "왜 아직 로그아웃 안 해?",
    "...",
    "보고 있어",
  ];

  return { pick, triggerWords, kakaoOpeners, kakaoFloodTemplates, errorMessages, systemLogLines, endings, phantomReplies };
})();
