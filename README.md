# 한찌.com — 한민고 커뮤니티

> 학교 커뮤니티 사이트 형식의 공포 게임 (Electron EXE 배포)

---

## 폴더 구조

```
Han_be_2026/
├── index.html          ← 진입점. 스크립트/스타일 로드 순서는 여기서 결정
├── main.js             ← Electron 메인 프로세스
├── package.json        ← Electron + 빌드 설정
│
├── css/
│   ├── base.css        ← CSS 변수, 리셋
│   ├── layout.css      ← 헤더, 네비, 그리드  ← .page / .page.active 여기 정의
│   ├── board.css       ← 게시판 테이블
│   ├── sidebar.css     ← 사이드바
│   ├── post.css        ← 게시글, 댓글
│   ├── forms.css       ← 로그인/쓰기 폼
│   ├── modal.css       ← 모달
│   ├── responsive.css  ← 모바일 반응형 (1차)
│   ├── skin.css        ← 2010년대 포털 스킨 (모바일 무효화 포함)
│   ├── horror.css      ← 갑툭튀/공포 레이어
│   └── minigame.css    ← 미니게임 UI (팝업폭탄/카카오/캡챠/엔딩)
│
├── js/
│   ├── data.js         ★ 콘텐츠 수정 시 이 파일만 편집
│   ├── store.js        ← localStorage 상태 관리
│   ├── utils.js        ← esc(), showPage(), boardRows() 등
│   ├── horror.js       ← 갑툭튀/공포 이벤트 시스템
│   ├── notices.js      ← 공지사항 모달
│   ├── render.js       ← 페이지별 렌더링 함수
│   ├── app.js          ← 클릭 이벤트 위임 + 초기화
│   ├── game-data.js    ← 미니게임 콘텐츠 데이터
│   ├── game-corrupt.js ← 텍스트 오염 유틸
│   ├── game-trigger.js ← 팝업폭탄 / 블랙아웃 로그
│   ├── game-kakao.js   ← 카카오 팝업
│   └── game-minigame.js← 게임 상태 머신 (Stage 0→4→엔딩)
│
└── assets/
    ├── README.txt      ← 교체 파일 안내
    ├── ending_a_stamp.svg
    ├── ending_b_stamp.svg
    └── ending_c_stamp.svg
    (jumpscare.jpg, *.mp3, icon.ico 는 직접 교체 — .gitignore 처리됨)
```

---

## 로컬 개발 환경 실행

Python이 설치된 상태에서:

```bash
cd Han_be_2026
python -m http.server 5173
# 브라우저에서 http://localhost:5173 접속
```

또는 Node.js 있으면:

```bash
npx live-server --port=5173
# 파일 저장 시 자동 새로고침 (추천)
```

---

## EXE 빌드 (배포)

```bash
npm install
npm run build
# dist/ 폴더에 설치 파일 생성
```

---

## 교체해야 할 에셋

`assets/README.txt` 참조. 아래 파일은 직접 넣어야 합니다:

| 파일명 | 용도 |
|---|---|
| `assets/jumpscare.jpg` | 갑툭튀 이미지 |
| `assets/jumpscare.mp3` | 갑툭튀 소리 |
| `assets/horror_ambience.mp3` | observer 배경음 |
| `assets/unknown_letter.mp3` | unknown 엔딩 배경음 |
| `assets/icon.ico` | EXE 아이콘 |

---

## 게임 공략 (개발자용)

- **Ctrl+Shift+R** → 관리자 패널 열기 (단계 수동 이동, 엔딩 직접 확인)
- 검색창에 `RESET-3141` 입력 → 전체 초기화
- 콘솔에서 `resetHansseolDemo()` → 초기화 + 새로고침

### 미니게임 트리거 단어

`js/game-data.js`의 `triggerWords` 배열 참조.  
게시글을 5개 이상 열람하거나 트리거 단어 검색 시 다음 단계로 진행.

---

## 협업 분업 가이드

| 역할 | 담당 파일 |
|---|---|
| 콘텐츠 | `js/data.js` |
| 디자인/스킨 | `css/skin.css`, `css/layout.css` |
| 공포 연출 | `js/horror.js`, `css/horror.css` |
| 미니게임 | `js/game-*.js`, `css/minigame.css` |
| 기능/라우팅 | `js/render.js`, `js/app.js` |

> `js/data.js`와 `js/store.js`는 동시 수정 시 병합 충돌이 가장 자주 발생합니다.  
> 게시글 ID 범위를 미리 나누거나 한 사람이 담당하세요.
