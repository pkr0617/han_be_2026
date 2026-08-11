/* =====================================================
   game-corrupt.js — 텍스트 오염 유틸
   blueport-horror 의 BP_CORRUPT 이식
   ===================================================== */
"use strict";

const GM_CORRUPT = (() => {
  const NORMAL   = "가나다라마바사아자차카타파하것입니다그리고그래서하지만";
  const GARBLED  = "ᄀᄂᄃᄅᄆᄇᄉᄋᄌᄎᄏᄐᄑ하ᅣᅥᅧᅩᅭᅮᅲᅳᅵ";
  const SYMBOLS  = "!@#$%^&*░▒▓█▀▄■□▪▫◆◇○●";

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  /**
   * intensity: 0.0 ~ 1.0
   * 0.0 = 원문 그대로
   * 0.5 = 일부 한글 자모 섞임
   * 1.0 = 완전히 깨진 문자
   */
  function mutate(text, intensity) {
    if (!intensity || intensity <= 0) return text;
    return text.split("").map(ch => {
      const r = Math.random();
      if (r > intensity) return ch;
      if (r > intensity * 0.4) return pick(GARBLED.split(""));
      if (r > intensity * 0.1) return pick(SYMBOLS.split(""));
      return pick(NORMAL.split(""));
    }).join("");
  }

  /**
   * position: 0 ~ max  (scrollY, post index 등)
   * max:      기준 최대값 (ex. 5)
   * 반환값:   0.0 ~ 0.9
   */
  function intensityFromPosition(position, max) {
    return Math.min(0.9, (position / Math.max(max, 1)) * 0.9);
  }

  return { pick, mutate, intensityFromPosition };
})();
