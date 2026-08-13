/* =====================================================
   data.js — 게시판 메타정보 · 초기 게시글 · 댓글 · 채팅 데이터
   ★ 게시글을 추가/수정/삭제하려면 이 파일만 편집하세요.
   ===================================================== */

/* ── 게시판 목록 ─────────────────────────────────────── */
const BOARD_META = {
  hot:     { name: "핫이슈",    desc: "지금 가장 많이 읽히고 이야기되는 글을 모았습니다." },
  free:    { name: "자유게시판", desc: "학교생활과 일상에 관한 다양한 이야기를 자유롭게 나누는 공간입니다." },
  anon:    { name: "익명게시판", desc: "작성자 표시 없이 의견을 나누는 공간입니다. 기본 이용 규칙은 동일합니다." },
  love:    { name: "연애&썰",   desc: "학교생활 속 인간관계와 경험담을 나누는 게시판입니다." },
  dorm:    { name: "기숙사",    desc: "기숙사 생활, 생활 팁, 시설 관련 정보를 공유합니다." },
  exam:    { name: "시험&성적", desc: "시험 일정, 공부법, 과목별 정보와 학습 경험을 나눕니다." },
  club:    { name: "동아리",    desc: "동아리 소개, 모집, 활동 후기와 정보를 모아봅니다." },
  alumni:  { name: "졸업생",    desc: "졸업생들의 학교 이야기와 진로 경험을 공유합니다." },
  inquiry: { name: "문의사항",  desc: "사이트 이용 중 불편한 점이나 운영 관련 문의를 남겨주세요." },
};

/* ── 초기 게시글 ─────────────────────────────────────── */
// ★ 게시글 순서는 이 배열 순서 그대로 고정됩니다.
// ★ horror 필드 설명:
//    "observer" → 로딩 연출 + 갑툭튀
//    "rainbow"  → 풀스크린 블랙 연출
//    "blank"    → 빈 게시글 (수칙 위반 카운트)
//    "author"   → 수칙 위반 카운트
//    "audio"    → 세 번째 녹음 재생 시 수칙 위반

const seedPosts = [
  {
    id: 66,
    board: "free",
    title: "OO 국회의원, 50억 상당의 현금 한민고에 전달하다 적발…",
    author: "지켜본다",
    date: "2026-08-11 09:14",
    views: 6210,
    comments: 4,
    likes: 389,
    body: `00당 그분 왜 한민고 왔음?`,
    hot: false,
    // ★ 실시간 댓글: 열람 중 새 댓글이 달림 (같은 게시글 재방문 시 중복 재생 안 됨)
    liveComments: [
      { key: "c1", delay: 4000, author: "익명", text: "실화냐 ㄷㄷ" },
      { key: "c2", delay: 8000, author: "익명", text: "이거 기사남?" },
    ],
  },
  {
    id: 67,
    board: "club",
    title: "베타, 알고보니 알파고의 수하들?",
    author: "고양이편",
    date: "2026-08-11 07:52",
    views: 2350,
    comments: 4,
    likes: 88,
    body: `알파고 베타 유착관계 해명해`,
    hot: false,
  },
  {
    id: 68,
    board: "free",
    title: "제발 택배좀 제때 가져가",
    author: "기숙사생",
    date: "2026-08-10 21:30",
    views: 1730,
    comments: 4,
    likes: 64,
    body: `한민고에 택배 엄청 많어`,
    hot: false,
  },
  {
    id: 69,
    board: "free",
    title: "야 걸생 누구 연못에 뛰어듦 ㄸ",
    author: "한찌.com러",
    date: "2026-08-10 18:47",
    views: 940,
    comments: 0,
    likes: 51,
    body: `걸생 리스펙`,
    hot: false,
  },
  {
    id: 70,
    board: "club",
    title: "업로드? 라고 작년에 동아리 있었던거같은데 뭐 없어진거임 뭐임?",
    author: "13기익명",
    date: "2026-08-10 12:03",
    views: 1220,
    comments: 0,
    likes: 37,
    body: `ㅈㄱㄴ`,
    hot: false,
  },
  {
    id: 71,
    board: "free",
    title: "이거 눌러보셈ㅋㅋ",
    author: "익명",
    date: "2026-08-10 08:15",
    views: 512,
    comments: 1,
    likes: 9,
    body: `히히 시간뺏기 야호`,
    hot: false,
  },
  {
    id: 1,
    board: "free",
    title: "14년 전 한민고에서 사라진 학생 기록… 그런데 오늘 다시 올라왔다",
    author: "한찌.com러",
    date: "2026-08-09 03:27",
    views: 3415,
    comments: 78,
    likes: 231,
    body: `14년 전 삭제된 학생 기록을 찾았다는 내용이 올라왔습니다.
그런데 이상한 점이 있습니다.

게시물의 작성 시간이 현재 시간과 똑같습니다.
그리고 작성자는 이미 졸업한 학생으로 표시되어 있습니다.

댓글을 읽어보지 마세요.
특히 마지막 댓글은 열지 않는 것을 권합니다.`,
    hot: true,
  },
  {
    id: 3,
    board: "free",
    title: "observer",
    author: "관리자",
    date: "2026-08-08 02:03",
    views: 6004,
    comments: 79,
    likes: 15,
    body: `observer를 검색한 사람만 볼 수 있는 게시물입니다.

이 게시물은 정상적으로 열리지 않을 수 있습니다.
계속 로딩되더라도 새로고침하지 마세요.`,
    hot: true,
    horror: "observer",
    hiddenUntilSearch: true,
  },
  {
    id: 4,
    board: "free",
    title: "",
    author: "익명",
    date: "2026-08-07 04:11",
    views: 2235,
    comments: 127,
    likes: 457,
    body: " ",
    hot: true,
    horror: "blank",
  },
  {
    id: 9001,
    board: "free",
    title: "절대 삭제하지 마세요 — 녹음 파일 01 / 02 / 03",
    author: "작성자",
    date: "2026-08-06 01:17",
    views: 8912,
    comments: 3,
    likes: 17,
    body: `아래 파일은 사이트 제작자가 남겨둔 테스트 녹음입니다.

※ 녹음 파일은 나중에 직접 교체하세요.
※ 파일 경로는 코드의 audioFiles 배열에서 확인할 수 있습니다.
※ 세 번째 파일은 분위기가 달라야 합니다.`,
    hot: true,
    horror: "audio",
    audioFiles: [
      "assets/horror_ambience.mp3", // ★ 녹음 1 교체 위치
      "assets/unknown_letter.mp3",  // ★ 녹음 2 교체 위치
      "assets/jumpscare.mp3",       // ★ 녹음 3 교체 위치 — 마지막은 이상한 소리/노래
    ],
    liveComments: [
      { key: "c1", delay: 5000, author: "익명", text: "지금 몇명 보고있는거임" },
      { key: "c2", delay: 9500, author: "익명", text: "재생하지 말라니까" },
    ],
  },
  {
    id: 9002,
    board: "free",
    title: "한찌.com 긴급 공지",
    author: "관리자",
    date: "2026-08-05 00:06",
    views: 1917,
    comments: 6,
    likes: 8,
    body: `이 글을 발견했다면 수칙을 이미 한 번 어긴 것입니다.

존재할 수 없는 게시글입니다.`,
    hot: true,
    horror: "author",
    liveComments: [
      { key: "c1", delay: 3500, author: "익명", text: "어 방금 조회수 올라갔는데" },
      { key: "c2", delay: 7500, author: "익명", replyToKey: "c1", text: "나만 그런거아니지?" },
      { key: "c3", delay: 12500, author: "???", text: "나가라" },
    ],
  },
  {
    id: 9101,
    board: "free",
    title: "%@＾$❆한❇민卫학쌩맍을 우1한 만@◌☉쩜ㅎㅐ킹공부법#@ ㅇF ㄴㅓ두 ❶등급 ௗ할 㐃 있ㅇㅓ#♜$❂@!❋",
    author: "익명",
    date: "2026-08-04 02:41",
    views: 9182,
    comments: 31,
    likes: 2,
    body: `제목이 이상하게 보이는 사람은 정상입니다.

내용을 읽으려고 하지 마세요.
페이지가 멈추더라도 창을 닫지 마십시오.`,
    hot: false,
    horror: "rainbow",
  },
  {
    id: 9102,
    board: "free",
    title: "전설의 '그 사람' 패드 비번 뭐냐",
    author: "익명",
    date: "2026-08-03 21:16",
    views: 4831,
    comments: 18,
    likes: 24,
    body: `뭐 없나 하고 패드 뒤지니까 비번 걸려있는데.`,
    hot: false,
  },
  {
    id: 9,
    board: "exam",
    title: "미적분 1 서술형, 성적 조작 의혹 받아…. 만점자 없나?",
    author: "급식러",
    date: "2026-07-27 00:34",
    views: 3675,
    comments: 109,
    likes: 58,
    body: "미 1 서술형 조작이야 조작이여야만 해",
    hot: true,
  },
  {
    id: 10,
    board: "dorm",
    title: "빈번한 기숙사 에어컨 고장으로 고통받는 학생들, 민원 폭주해…",
    author: "수학은어려워",
    date: "2026-07-20 17:39",
    views: 1155,
    comments: 152,
    likes: 190,
    body: "ㅇㄴ 기숙사 에어컨 진짜 뭐 있는거 아니야",
    hot: true,
  },
  {
    id: 11,
    board: "free",
    title: "한민고에 비둘기가 없는 이유… 걸생의 00 때문?",
    author: "기숙사생",
    date: "2026-07-20 16:38",
    views: 5316,
    comments: 150,
    likes: 452,
    body: "생각해보면 한민고에는 비둘기가 없음",
    hot: true,
  },
  {
    id: 12,
    board: "free",
    title: "교장실 앞에 죽어있는 개구리 발견했는데",
    author: "13기익명",
    date: "2026-07-19 08:28",
    views: 2511,
    comments: 197,
    likes: 178,
    body: "님들 나 어제 3타임 이동하다가 교장실 앞에서 개구리 죽어있는거봄 이거 뭐임",
    hot: true,
  },
  {
    id: 13,
    board: "dorm",
    title: "반에서 에어컨 못 틀게 하는 물리쌤… 결국 교장실로 끌려가",
    author: "한찌.com러",
    date: "2026-07-19 07:01",
    views: 1188,
    comments: 55,
    likes: 425,
    body: "그 물리하쟈 하는 에어컨 마스터 쌤 어떻게 됨??",
    hot: false,
  },
  {
    id: 15,
    board: "club",
    title: "왜요 기장 알고보니 여자….?",
    author: "관전자",
    date: "2026-07-14 21:48",
    views: 4709,
    comments: 151,
    likes: 391,
    body: `왜요 기장 여자야?`,
    hot: false,
  },
  {
    id: 64,
    board: "free",
    title: "님들 내가 바로 레전드 책-지피티를 발견해버렸잖아ㅋㅋ",
    author: "익명",
    date: "2026-08-09 16:51",
    views: 1203,
    comments: 2,
    likes: 34,
    body: `챗지피티 아니다 바로 책-지피티라는거다
책은 무엇이든 딱 피면 바로 알려주시잖아
심지어 말이야 어? 면학 3타임때도 당당하게 쓸수있다 이말이야
구라안까고 이게 ㄹㅇ 챗지피티아니냐?`,
    // ★ 힌트: 볼드 처리된 "3" · "이" · "구" 를 순서대로 읽으면 책 금고 비번 329
    bodyHtml: `챗지피티 아니다 바로 책-지피티라는거다
책은 무엇이든 딱 피면 바로 알려주시잖아
심지어 말이야 어? 면학 <b>3</b>타임때도 당당하게 쓸수있다 <b>이</b>말이야
<b>구</b>라안까고 이게 ㄹㅇ 챗지피티아니냐?`,
    hot: false,
  },
  {
    id: 22,
    board: "club",
    title: "왜요에 모집 비리가 있다?",
    author: "수학은어려워",
    date: "2026-07-03 12:04",
    views: 7022,
    comments: 79,
    likes: 359,
    body: "왜요 12기 대부분 다 낙하산인거 알음?",
    hot: false,
  },
  {
    id: 23,
    board: "free",
    title: "급식실 두쫀쿠 실종 사건… 내부자 소행 가능성 높아",
    author: "기숙사생",
    date: "2026-06-28 19:43",
    views: 2808,
    comments: 61,
    likes: 182,
    body: "ㅇㄴ 님들 저 1학년인데 배식시간 되자마자 내려갔는데 두쫀쿠 없대요 말이됨?",
    hot: false,
  },
  {
    id: 33,
    board: "free",
    title: "주차장에 피 묻은 벽돌 있던데",
    author: "급식러",
    date: "2026-05-30 11:53",
    views: 3690,
    comments: 28,
    likes: 367,
    body: "생각해보니까 겁나 무섭네",
    hot: false,
  },
  {
    id: 35,
    board: "free",
    title: "한민고 이야기 <-- 판매수 조작 고트 ㅋㅋㅋㅋㅋㅋ",
    author: "기숙사생",
    date: "2026-05-27 13:17",
    views: 742,
    comments: 108,
    likes: 152,
    body: "방학숙제로 강매 ㄹㅈㄷ",
    hot: false,
  },
  {
    id: 36,
    board: "free",
    title: "친구가 일산화이수소 위험하다는데",
    author: "13기익명",
    date: "2026-05-24 03:11",
    views: 1283,
    comments: 142,
    likes: 468,
    body: "화학 안 듣는데 일산화이수소가 뭐임?",
    hot: false,
  },
  {
    id: 37,
    board: "exam",
    title: "합반 ㄲㅂ",
    author: "한찌.com러",
    date: "2026-05-23 05:17",
    views: 2683,
    comments: 66,
    likes: 107,
    body: "합반가고 싶어서 고화 골랐는데 이제 그냥 고화 고른 인간임;;;",
    hot: false,
  },
  {
    id: 38,
    board: "free",
    title: "운돌했다고 뭐라고 하는 게 맞는 문화냐",
    author: "익명",
    date: "2026-05-20 00:56",
    views: 3441,
    comments: 57,
    likes: 215,
    body: "운돌 좀 하는 게 죄는 아니잖아",
    hot: false,
  },
  {
    id: 39,
    board: "free",
    title: "바다의 생명체들과 한민고의 '운돌' 문화",
    author: "관전자",
    date: "2026-05-19 02:20",
    views: 1492,
    comments: 203,
    likes: 251,
    body: "사실 한민고 커플들은 물고기가 아닐까",
    hot: false,
  },
  {
    id: 40,
    board: "free",
    title: '12기 최 모군, 정보과 선생님을 향해 "샤갈!" 외쳐… 교권 추락의 진실',
    author: "Beta",
    date: "2026-05-19 02:04",
    views: 6441,
    comments: 172,
    likes: 181,
    body: `#공론화
    
    
    
    쌤한테 샤@갈 날린 B 공론화`,
    hot: false,
  },
  {
    id: 41,
    board: "free",
    title: "한민고 1학년, 코끼리..?",
    author: "고양이편",
    date: "2026-05-18 22:09",
    views: 2030,
    comments: 156,
    likes: 361,
    body: "1학년에 코끼리 키우는 애 있다는데",
    hot: false,
  },
  {
    id: 42,
    board: "anon",
    title: "소개팅 부스 몇 번까지 될까?",
    author: "익명",
    date: "2026-05-17 11:27",
    views: 5870,
    comments: 139,
    likes: 300,
    body: "각자 직접 해보고 댓글 ㄱㄱ 일단 난  17범",
    hot: false,
  },
  {
    id: 43,
    board: "free",
    title: "합반 짝꿍",
    author: "왜요단톡방",
    date: "2026-05-16 18:47",
    views: 3436,
    comments: 156,
    likes: 401,
    body: "합반 짝꿍하는 게 맞냐 쫌에반데",
    hot: false,
  },
  {
    id: 44,
    board: "free",
    title: "남자 둘 사이에 여자 앉히는 건 좀;;",
    author: "폴라리스",
    date: "2026-05-13 03:07",
    views: 3481,
    comments: 188,
    likes: 193,
    body: "여잔데 합반인 룸메가 자기 바로 양옆으로 남자자리 됐다고 거의 울던데",
    hot: false,
  },
  {
    id: 45,
    board: "free",
    title: "용철공주, 사실은 남자?",
    author: "급식러",
    date: "2026-05-12 03:56",
    views: 2313,
    comments: 47,
    likes: 332,
    body: "남자도 공주 할 수 있다고",
    hot: false,
  },
  {
    id: 46,
    board: "free",
    title: "교실에 젓가락 한 쌍 돌아다니던데 누가 몰래 빼왔나",
    author: "수학은어려워",
    date: "2026-05-09 10:30",
    views: 6767,
    comments: 88,
    likes: 178,
    body: "지나가다 14반에서 젓가락 보이는데 당황스럽더라",
    hot: false,
  },
  {
    id: 48,
    board: "free",
    title: "매점 가격 인상 - 편의점보다 높은 가격으로 학생들 기만하나",
    author: "13기익명",
    date: "2026-05-05 07:07",
    views: 6811,
    comments: 102,
    likes: 140,
    body: "아니분명어제까지캔제티가850원이였다니까?????????",
    hot: false,
  },
  {
    id: 49,
    board: "club",
    title: "한민고 과학 동아리 9개 아니냐",
    author: "한찌.com러",
    date: "2026-05-05 01:58",
    views: 4093,
    comments: 136,
    likes: 432,
    body: "10개라는 애들은 뭐하는 애들임",
    hot: false,
  },
  {
    id: 51,
    board: "free",
    title: "17반 남자반 아니냐 여자랑 눈마주쳤는데",
    author: "관전자",
    date: "2029-04-01 12:10",
    views: 3507,
    comments: 153,
    likes: 244,
    body: `2학년 17반 지나가다가 교실에서 나오는 여자랑 눈마주침
    심지어 교실에 여자 엄청 많던데 좀 무서워질라 함`,
    hot: false,
  },
  {
    id: 52,
    board: "anon",
    title: '한민고 결국 다 부모 빽 아니냐',
    author: "익명",
    date: "2026-04-30 17:32",
    views: 2083,
    comments: 196,
    likes: 50,
    body: "일단 나부터 ㅋㅋㅋㅋㅋ 나도 아빠 아니었음 입학 못함",
    hot: false,
  },
  {
    id: 55,
    board: "free",
    title: "13기 반 차별 진짜 심하네",
    author: "왜요단톡방",
    date: "2026-04-28 05:40",
    views: 6997,
    comments: 95,
    likes: 252,
    body: "1학년 중에 우리 반만 없는 게 맞냐",
    hot: false,
  },
  {
    id: 57,
    board: "free",
    title: "어제 밤에 운동장에서 누가 소리지르던데",
    author: "급식러",
    date: "2026-04-19 18:44",
    views: 1579,
    comments: 36,
    likes: 97,
    body: "9시쯤에 운동장에서 소리지른 거 뭐냐... 나만 들었음? 주변에 들었다는 애들이 없던데",
    hot: false,
  },
  {
    id: 59,
    board: "free",
    title: "한밤중에 비오면 정문으로 대놓고 나가는 존경의 대상",
    author: "기숙사생",
    date: "2026-04-16 00:18",
    views: 1664,
    comments: 176,
    likes: 250,
    body: `비오는 날마다 한탈하는 그저 GOAT
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    어쩔맹꽁이 ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ`,
    hot: false,
  },
  {
    id: 60,
    board: "club",
    title: "CPS, 사실 000을 찬양하는 집단..?",
    author: "13기익명",
    date: "2026-04-15 18:02",
    views: 6328,
    comments: 39,
    likes: 439,
    body: "ㅇㄴ 내 룸메 CPS인데 좀 무서움",
    hot: false,
  },
  {
    id: 61,
    board: "club",
    title: "요즘 동아리 유령부원 늘어나니까 주변 잘 보고 다녀라",
    author: "한찌.com러",
    date: "2026-04-15 00:10",
    views: 4970,
    comments: 156,
    likes: 251,
    body: "ㅁㅊㅁㅊㅁㅊ나실수로 우리동아리기장남친분한테 인사함ㅁㅊ 아제발진짜아왜그랬지",
    hot: false,
  },
  /* ── 퍼즐 관련 게시글 ─────────────────────────────── */
  {
    id: 62,
    board: "anon",
    title: "2학년 15반 걔 과거 아는 사람",
    author: "익명",
    date: "2026-08-09 11:22",
    views: 2847,
    comments: 8,
    likes: 43,
    body: `아니, 2학년 15반에 레전드 하나 들어왔다는데 이름이 뭐더라 하,,, 잘 모르겠는데

쨌든 개학하자마자 반 애들이랑 싸우고 진짜 끝핑 말도 아니었음 진짜 한민 어케 들어옴??`,
    hot: false,
    // parentId: 14 → 기존 시드 댓글 "쟤 첫룸멘데 공부는 진짜잘함..."에 대댓글로 이어짐
    liveComments: [
      { key: "c1", delay: 4000, author: "익명", parentId: 14, text: "오늘도 자냐 ㅋㅋ" },
      { key: "c2", delay: 8000, author: "익명", replyToKey: "c1", text: "얘 맨날 그러던데 안피곤한가" },
    ],
  },
  {
    id: 63,
    board: "free",
    title: "안ㄴㅇ << 얘 아이패드 비번 뚫었음 정보공유하러옴ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ",
    author: "익명",
    date: "2026-08-09 13:04",
    views: 5912,
    comments: 3,
    likes: 87,
    body: `곧 사라지니까 빨리 보고 가라















142857이다 이것들아 ㅋㅋㅋㅋㅋㅋㅋㅋㅋ`,
    hot: false,
  },
  {
    id: 65,
    board: "club",
    title: "동아리 기장들은 다풀었다는 전설의 문제 지금바로ㄱㄱ",
    author: "익명",
    date: "2026-08-09 20:37",
    views: 3401,
    comments: 2,
    likes: 156,
    body: `(가을이가 만든 퀴즈 이미지)
이거 풀면 님들도 기장먹기 쌉가능
아 나는 풀었음ㅋ`,
    hot: false,
  },
];

/* ── 초기 댓글 ───────────────────────────────────────── */
// id    : 댓글 고유 번호 (대댓글 연결에 필요)
// parentId : 대댓글일 때 부모 댓글의 id (없으면 생략)
const seedComments = [
  /* ── 62: 2학년 15반 ──────────────────────────────── */
  { id: 7,  postId: 62,                   author: "익명", text: "걔 유명하자나 ㅇㄴㅇ(안노운) 아니야",                                                       time: "1시간 전"  },
  { id: 8,  postId: 62, parentId: 7,      author: "익명", text: "어어 맞는 것 같으",                                                                           time: "58분 전"   },
  { id: 9,  postId: 62, parentId: 7,      author: "익명", text: "아니ㅋㅋㅋ 그 사람의 이름을 말해선 안돼",                                                     time: "55분 전"   },
  { id: 10, postId: 62, parentId: 9,      author: "익명", text: "왜 뭐 ㅂㅌㅁㅌ 그런거임? <<<이거 설마 볼드모트? ㅋㅋㅋㅋㅋ",                                  time: "52분 전"   },
  { id: 11, postId: 62, parentId: 7,      author: "익명", text: "…? 걔 입학식날에 앞에서 상 받았던애아님? 아니 ㄹㅇ?",                                         time: "50분 전"   },
  { id: 12, postId: 62, parentId: 11,     author: "익명", text: "인성 안보고 숫자로 들어오잖음 수행평가 꿰메기는 잘했나보지뭐ㅋㅋㅋㅋ",                         time: "47분 전"   },
  { id: 13, postId: 62, parentId: 12,     author: "익명", text: "얘 공부는 잘하디?",                                                                            time: "44분 전"   },
  { id: 14, postId: 62, parentId: 13,     author: "익명", text: "쟤 첫룸멘데 공부는 진짜잘함 아니 면학실 자리 생기자마자 계속 심심자뜀",                        time: "41분 전"   },

  /* ── 63: 아이패드 비번 ───────────────────────────── */
  { id: 15, postId: 63,                   author: "익명", text: "찐임?",                                                                                        time: "1시간 전"  },
  { id: 16, postId: 63,                   author: "익명", text: "구라 ㄴ",                                                                                      time: "59분 전"   },
  { id: 17, postId: 63,                   author: "익명", text: "바로 갤러리부터 들어가ㅋㅋㅋㅋㅋ",                                                             time: "57분 전"   },

  /* ── 64: 책-지피티 ───────────────────────────────── */
  { id: 18, postId: 64,                   author: "익명",         text: "시험기간인데 많이 힘드냐",                                                             time: "30분 전"   },
  { id: 19, postId: 64, parentId: 18,     author: "해당글작성자", text: "ㅈㅅ 지피티가 내 말 안들어서 그냥 뻘글쓰러옴",                                        time: "28분 전"   },

  /* ── 65: 전설의 문제 ─────────────────────────────── */
  { id: 20, postId: 65,                   author: "익명", text: "이거풀면 어따써먹는데",                                                                        time: "2시간 전"  },
  { id: 21, postId: 65, parentId: 20,     author: "익명", text: "혹시모름? 이걸로 세상의 진리를 알게 될수도 있잖음;;;;;;;;;",                                  time: "1시간 전"  },

  /* ── 9102: 패드 비번 ─────────────────────────────── */
  { id: 22, postId: 9102,                 author: "익명", text: "작년에 걔한테 듣기로는 1/7이라나 뭐라나. 하여간 무시하는것도 아니고",                         time: "방금 전"   },

  /* ── 66: 국회의원 뇌물 ───────────────────────────── */
  { id: 24, postId: 66,                   author: "익명", text: "돈 들고 왔던데",              time: "50분 전" },
  { id: 25, postId: 66, parentId: 24,     author: "익명", text: "헐 비리 뭐 그런거야",          time: "47분 전" },
  { id: 26, postId: 66, parentId: 25,     author: "익명", text: "아니 기부",                    time: "44분 전" },
  { id: 27, postId: 66, parentId: 26,     author: "익명", text: "아 뭐야",                      time: "41분 전" },

  /* ── 67: 베타-알파고 유착 ────────────────────────── */
  { id: 28, postId: 67,                   author: "익명", text: "이건 또 뭔소리야",             time: "40분 전" },
  { id: 29, postId: 67, parentId: 28,     author: "익명", text: "알파 베타 알파고 베타 히히",    time: "37분 전" },
  { id: 30, postId: 67, parentId: 29,     author: "익명", text: "…",                            time: "35분 전" },
  { id: 31, postId: 67, parentId: 29,     author: "익명", text: "학생회 힘내라 ㅋㅋ",            time: "33분 전" },

  /* ── 7: CPS와 폴라리스의 유착관계 ─────────────────── */
  { id: 32, postId: 7,                    author: "익명", text: "CPS랑 폴라리스 << 얘네들은 왜 매년마다 이러는거임 ㅈㅂ", time: "방금 전" },

  /* ── 9: 미적분 1 서술형 ──────────────────────────── */
  { id: 33, postId: 9,                    author: "익명", text: "…유감이다",     time: "10분 전" },
  { id: 34, postId: 9,                    author: "익명", text: "힘내",          time: "8분 전"  },
  { id: 35, postId: 9,                    author: "익명", text: "넌 할 수 있어", time: "5분 전"  },

  /* ── 10: 기숙사 에어컨 고장 ──────────────────────── */
  { id: 36, postId: 10,                   author: "익명", text: "ㅇㅇ 있는듯",                                              time: "30분 전" },
  { id: 37, postId: 10,                   author: "익명", text: "5층 a동 에어컨 언제 고치냐",                                time: "27분 전" },
  { id: 38, postId: 10, parentId: 37,     author: "익명", text: "오늘 고쳤다는데",                                          time: "24분 전" },
  { id: 39, postId: 10,                   author: "익명", text: "그냥 부품 교체하는 척만 하는듯",                            time: "21분 전" },
  { id: 40, postId: 10, parentId: 39,     author: "익명", text: "그래도 고치면 잘 돌아가긴 하자나…",                        time: "18분 전" },
  { id: 41, postId: 10,                   author: "익명", text: "2관 아니면 조용히 해라 여기는 고장나면 건물 단위로 왔다갔다해야됨", time: "15분 전" },

  /* ── 11: 한민고에 비둘기가 없는 이유 ─────────────── */
  { id: 42, postId: 11,                   author: "익명", text: "있는데",                     time: "1시간 전" },
  { id: 43, postId: 11, parentId: 42,     author: "익명", text: "서울보다 적잖아",             time: "58분 전"  },
  { id: 44, postId: 11, parentId: 43,     author: "익명", text: "여긴 파주야",                 time: "55분 전"  },
  { id: 45, postId: 11, parentId: 44,     author: "익명", text: "걸생이 뭐 하나보지",          time: "52분 전"  },
  { id: 46, postId: 11, parentId: 45,     author: "익명", text: "그런가",                      time: "49분 전"  },
  { id: 47, postId: 11, parentId: 45,     author: "익명", text: "나 비둘긴데 이거 맞다",        time: "47분 전"  },
  { id: 48, postId: 11, parentId: 47,     author: "익명", text: "비둘기는 그런 말투 안씀",      time: "44분 전"  },
  { id: 49, postId: 11, parentId: 48,     author: "익명", text: "구 구구구구 구구 구구",        time: "41분 전"  },
  { id: 50, postId: 11, parentId: 49,     author: "익명", text: "ㅋㅋㅋㅋㅋㅋㅋㅋㅋ",          time: "38분 전"  },
  { id: 51, postId: 11, parentId: 49,     author: "익명", text: "찐 등장 ㅋㅋㅋㅋㅋ",          time: "36분 전"  },
  { id: 52, postId: 11, parentId: 49,     author: "익명", text: "비둘기다",                    time: "34분 전"  },

  /* ── 12: 교장실 앞 개구리 ────────────────────────── */
  { id: 53, postId: 12,                   author: "익명", text: "걸생 친구한테 물어봤는데 그냥 자연사한거라는디", time: "방금 전" },

  /* ── 13: 반에서 에어컨 못 틀게 하는 물리쌤 ───────── */
  { id: 54, postId: 13,                   author: "익명", text: "에어컨 레이드하러 떠남",             time: "20분 전" },
  { id: 55, postId: 13,                   author: "익명", text: "얼마 전에 교장실 들어가던데",         time: "18분 전" },
  { id: 56, postId: 13, parentId: 55,     author: "익명", text: "엥??",                              time: "16분 전" },
  { id: 57, postId: 13, parentId: 55,     author: "익명", text: "교장실 에어컨도 끄려고 ㄷㄷ",         time: "14분 전" },
  { id: 58, postId: 13, parentId: 55,     author: "익명", text: "지구 지켰다고 참된 교사상 받았다는데", time: "12분 전" },
  { id: 59, postId: 13, parentId: 58,     author: "익명", text: "와우",                              time: "10분 전" },
  { id: 60, postId: 13, parentId: 58,     author: "익명", text: "학생들도 지켜주세요",                time: "8분 전"  },

  /* ── 15: 왜요 기장 알고보니 여자 ──────────────────── */
  { id: 61, postId: 15,                   author: "익명", text: "ㅇㅇ 몰랐어?",                      time: "25분 전" },
  { id: 62, postId: 15, parentId: 61,     author: "익명", text: "ㅇㅇ…",                              time: "22분 전" },
  { id: 63, postId: 15, parentId: 61,     author: "익명", text: "뭐라는거야",                         time: "20분 전" },
  { id: 64, postId: 15, parentId: 61,     author: "익명", text: "나 왜요 기장인데 이거 맞다", time: "18분 전" },

  /* ── 68: 제발 택배좀 제때 가져가 ──────────────────── */
  { id: 65, postId: 68,                   author: "익명", text: "그니까 좀 가져가",                        time: "45분 전" },
  { id: 66, postId: 68, parentId: 65,     author: "익명", text: "다른 사람 택배 말고 본인 거나 잘 가져가자", time: "42분 전" },
  { id: 67, postId: 68, parentId: 66,     author: "익명", text: "ㅇㄱㄹㅇ",                                time: "40분 전" },
  { id: 68, postId: 68, parentId: 66,     author: "익명", text: "ㅇㅈ",                                    time: "38분 전" },

  /* ── 22: 왜요에 모집 비리가 있다 ──────────────────── */
  { id: 69, postId: 22,                   author: "익명", text: "당연하지 첫개설이잖음;;;;;;;", time: "15분 전" },
  { id: 70, postId: 22, parentId: 69,     author: "익명", text: "아 맞네 ㅈㅅ",                  time: "12분 전" },

  /* ── 23: 급식실 두쫀쿠 실종 사건 ──────────────────── */
  { id: 71, postId: 23,                   author: "익명", text: "대x 데o",     time: "10분 전" },
  { id: 72, postId: 23, parentId: 71,     author: "익명", text: "대가 맞음",   time: "8분 전"  },

  /* ── 71: 이거 눌러보셈 ────────────────────────────── */
  { id: 73, postId: 71,                   author: "익명", text: "나가라그냥", time: "방금 전" },

  /* ── 33: 피묻은 벽돌 ────────────────────────────── */
  { id: 74, postId: 33,                   author: "익명", text: "그거 마카잖아;; 이걸 몰라?" },
  { id: 75, postID: 33, parentID: 74,     author: "작성자", text: "ㄹㅇ? 이게 피가 아니네 ㄲㅂ" },
  /* ── 36: 일산화이수소 ────────────────────────────── */
  { id: 76, postId: 36,                   author: "익명", text: "???? 그게 뭔데" },
  { id: 77, postId: 36, parentId: 76,     author: "익명", text: "급식에 들어간다는데" },
  { id: 78, postId: 36, parentId: 77,     author: "익명", text: "야 그거 염산보다 pH 높은거임 설마 먹었어?" },
  { id: 79, postId: 36, parentId: 76,     author: "익명", text: "골때리네 그거 금단증상 ㄹㅈㄷ임" },
  /*── 38: 운돌 놀림 ──────────────────────────────*/
  { id: 80, postId: 38,                   author: "익명", text: "찔림?" },
  { id: 81, postId: 38,                   author: "익명", text: "얼레리꼴레리 ㅋ" },
  { id: 82, postId: 38,                   author: "익명", text: "바텐더, 오늘은 락스온더 락이다" },
  /*── 39: 운돌 물고기 ──────────────────────────────*/
  { id: 83, postId: 39,                   author: "익명", text: "진짜 근데 한명도 역주행 안하는게 신기하긴해 ㅋㅋㅋㅋ" },
  { id: 84, postId: 39, parentId: 83,     author: "익명", text: "맞긴한데 역주행하면 커플들 얼굴 봐야됨" },
  /*── 40: 최샤갈 ──────────────────────────────*/
  { id: 85, postId: 40,                   author: "익명", text: "? 오늘만 사네" },
  { id: 86, postId: 40, parentId: 85,     author: "익명", text: "어음 저건 좀" },
  { id: 87, postId: 40, parentId: 86,     author: "익명", text: "진짜 얼굴에 대고 샤 갈! 이럼" },
  { id: 88, postId: 40, parentId: 87,     author: "익명", text: "예?" },
  { id: 89, postId: 40,                   author: "익명", text: "나 쟤 친군데 모르고 그랬다고 함" },
  /*── 41: 1학년 코끼리 ──────────────────────────────*/
  { id: 90, postId: 41,                   author: "익명", text: "ㄹㅇ임?" },
  { id: 91, postId: 41,                   author: "익명", text: "별명 코끼리인 거 잘못 안 거 아님? 한 명 있는데" },
  /*── 42: 소개팅 부스 ──────────────────────────────*/
  { id: 92, postId: 42,                   author: "익명", text: "개최자 승;;" },
  { id: 93, postId: 42,                   author: "익명", text: "소최몇 뭐 이런거냐 자랑이다" },
  { id: 94, postId: 42,                   author: "익명", text: "그 정도면 걍 거기서 니 불쌍해서 더 시켜준거임 ㅇㅇ 라고 하면 안되겠죠?" },
  { id: 95, postId: 42, parentId: 94,     author: "익명", text: "이미 다 말해놓고 뭘 ㅋㅋㅋㅋㅋㅋㅋ" },
  /*── 43: 합반 짝꿍 ──────────────────────────────*/
  { id: 96, postId: 43,                   author: "익명", text: "나 합반인데 짝 붙이면서 드디어 교실에 통로 좀 생겨서 그래도 만족하긴 함" },
  { id: 97, postId: 43, parentId: 96,     author: "익명", text: "다른게 생긴게 아니고??" },
  { id: 98, postId: 43, parentId: 97,     author: "익명", text: "아 근데 그거도 맞긴해 ㅋㅋ" },
  /*── 44: 남자 둘 사이 여자 ──────────────────────────────*/
  { id: 99, postId: 44,                   author: "익명", text: "오우 저건 좀 안타깝긴 하네..." },
  { id: 100, postId: 44,                  author: "익명", text: "ㄹㅇ임?? 아니 뭐 한자리만 따로 떼놓는건 봤어도 세자리 쭉은 첨보네" },
  { id: 101, postId: 44, parentId: 100,   author: "익명", text: "나 옆반이라 가끔 보이는데 ㄹㅇ임 심지어 맨앞 가운데" },
  /*── 45: 공주 ──────────────────────────────*/
  { id: 102, postId: 45,                  author: "익명", text: "ㅇㅇ 너 공주 해" },
  { id: 103, postId: 45, parentId: 102,   author: "익명", text: "아니 나 말고 고양이" },
  { id: 104, postId: 45, parentId: 102,   author: "익명", text: "고양이 이름이 공주라고" },
  { id: 105, postId: 45, parentId: 104,   author: "익명", text: "알았어 공주" },
  { id: 106, postId: 45, parentId: 104,   author: "익명", text: "좋은사랑해" },
  /*── 46: 젓가락 ──────────────────────────────*/
  { id: 107, postId: 46,                  author: "익명", text: "그 이씨 둘 아니냐" },
  { id: 108, postId: 46, parentId: 107,   author: "익명", text: "맞는듯" },
  { id: 109, postId: 46, parentId: 108,   author: "익명", text: "ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ" },
  { id: 110, postId: 46, parentId: 108,   author: "익명", text: "아 웃으면 안된다고" },
  { id: 111, postId: 46, parentId: 108,   author: "익명", text: "젓가락 이러네 ㅋㅋㅋㅋㅋ 말랐다고 그러지 말라고" },
  /*── 48: 매점 가격 인상 ──────────────────────────────*/
  { id: 112, postId: 48,                  author: "익명", text: "아 나 어제 지갑 꺼내기 귀찮다고 제티 참았는데 ㄲㅂ" },
  { id: 113, postId: 48, parentId: 112,   author: "익명", text: "? 뭔데" },
  { id: 114, postId: 48, parentId: 113,   author: "익명", text: "비싸짐" },
  { id: 115, postId: 48, parentId: 114,   author: "익명", text: "ㅇㄴ 얼탱" },
  /*── 49: 과동 개수 ──────────────────────────────*/
  { id: 116, postId: 49,                  author: "익명", text: "9개 맞잖아" },
  { id: 117, postId: 49, parentId: 116,   author: "익명", text: "10개임 올해 하나 추가됨" },
  /*── 51: 남자 반 여자 ──────────────────────────────*/
  { id: 118, postId: 51,                  author: "익명", text: "오늘 며칠이게" },
  { id: 119, postId: 51, parentId: 118,   author: "익명", text: "2029년 4월 1일 아 잠만" },
  { id: 120, postId: 51, parentId: 119,   author: "익명", text: "ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ" },
  { id: 121, postId: 51, parentId: 119,   author: "익명", text: "세상의 이치를 깨달으셨군..." },
  { id: 122, postId: 51, parentId: 119,   author: "익명", text: "만우절 <---- 그저 한민고 행사 GOAT" },
  /*── 52: 부모 빽 ──────────────────────────────*/
  { id: 123, postId: 52,                  author: "익명", text: "이번엔 진짜 비리 터진거냐" },
  { id: 124, postId: 52, parentId: 123,   author: "익명", text: "아니 나 군자년데" },
  { id: 125, postId: 52, parentId: 124,   author: "익명", text: "아씨 진짜 뭐 터진 줄 알았네" },
  /*── 55: 햇빛 없음 ──────────────────────────────*/
  { id: 126, postId: 55,                  author: "익명", text: "뭐가 없는데" },
  { id: 127, postId: 55, parentId: 126,   author: "익명", text: "햇빛" },
  { id: 128, postId: 55, parentId: 127,   author: "익명", text: "에반데" },
  { id: 129, postId: 55, parentId: 127,   author: "익명", text: "진짜?" },
  { id: 130, postId: 55, parentId: 127,   author: "익명", text: "아냐 있어 그리면 돼^^" },
  { id: 131, postId: 55, parentId: 130,   author: "익명", text: "더에바" },
  /*── 57: 운동장 비명 ──────────────────────────────*/
  { id: 132, postId: 57,                  author: "익명", text: "ㅇㅇ 너만 들음" },
  { id: 133, postId: 57,                  author: "익명", text: "안들렸는데 못들었는데" },
  { id: 134, postId: 57,                  author: "익명", text: "뭔데?뭔데?뭔데?뭔데?" },
  { id: 135, postId: 57, parentId: 134,   author: "익명", text: "무서워 하지마..." },
  { id: 136, postId: 57,                  author: "익명", text: "그거 유성우 떨어져서 그럴걸" },
  { id: 137, postId: 57, parentId: 136,   author: "익명", text: "그거 맞지...?" },
  { id: 138, postId: 57, parentId: 137,   author: "익명", text: "아닐껄?아닐껄?아닐껄?" },
  { id: 139, postId: 57, parentId: 137,   author: "익명", text: "몰라몰라몰라몰라몰라몰라몰라" },
  { id: 140, postId: 57, parentId: 139,   author: "익명", text: "오❧늘 덧글 상ㅌH 무슨 일ㅇ1ㅇㅑ" },
  /*── 59: 맹꽁이 한탈 ──────────────────────────────*/
  { id: 141, postId: 59,                  author: "익명", text: "아니 진짜로 누가 한탈하는줄" },
  { id: 142, postId: 59,                  author: "익명", text: "아 걔네가 맹꽁이야? 떡두꺼비같은 건줄" },
  { id: 143, postId: 59, parentId: 142,   author: "익명", text: "맹꽁이 ㄱㅇㅇ" },
  { id: 144, postId: 59, parentId: 143,   author: "익명", text: "안 기여버ㅓ ㅠㅜㅠㅜㅠ" },
  { id: 145, postId: 59, parentId: 144,   author: "익명", text: "걱정마 걸생이 잘해준대" },
  { id: 146, postId: 59, parentId: 145,   author: "익명", text: "다행이다... ㅠㅠㅜ" },
  /*── 60: CPS 숭배 ──────────────────────────────*/
  { id: 147, postId: 60,                  author: "익명", text: "솔직히맞잖아어떻게CutiePrettyS***teacher가아닐수있어혼자귀엽고예쁘고다하시는…[더보기]" },
  { id: 148, postId: 60, parentId: 147,   author: "익명", text: "본인 등판" },
  { id: 149, postId: 60, parentId: 147,   author: "익명", text: `그 긴거` },
  /*── 61: 동아리 유령부원 ──────────────────────────────*/
  { id: 150, postId: 61,                  author: "익명", text: "2학년이 미안해..." },
  { id: 151, postId: 61, parentId: 150,   author: "익명", text: "아닌데? 안 미안한데?" },
  { id: 152, postId: 61, parentId: 151,   author: "익명", text: "넌 그냥 나가라 ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ" },
  { id: 153, postId: 61,                  author: "익명", text: "그래서 학기초에는 얼굴 확실히 외워둔 선배 아니면 옷보고 인사하기 위험함" },
  { id: 154, postId: 61, parentId: 153,   author: "익명", text: "그러다 진짜 선배면 어캄" },
  { id: 155, postId: 61, parentId: 154,   author: "익명", text: "2학년도 후배 얼굴 잘 몰라서 상관 없음" },
  { id: 156, postId: 61,                  author: "익명", text: "근데 기장 남친분인건 어케 앎" },
  { id: 157, postId: 61, parentId: 156,   author: "익명", text: "어제 운돌 목격함... 나도 알고 싶지 않았어" },

];

/* ── 공개 채팅 (사이드바용 더미) ─────────────────────── */
const publicChat = [
  { author: "ㅇㅇ",        text: "오늘 저녁 급식 뭐였지?",  time: "방금 전" },
  { author: "한찌.com러",  text: "자습실 자리 남아있나",     time: "1분 전"  },
  { author: "익명",        text: "비 온다 우산 챙겨",         time: "2분 전"  },
  { author: "고양이편",    text: "고양이 봤다 ㅋㅋ",         time: "3분 전"  },
  { author: "Beta",        text: "오늘도 다들 고생했다",      time: "5분 전"  },
];
