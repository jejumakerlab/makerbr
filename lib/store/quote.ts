const DIGITS = ["", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구"];
const SMALL_UNITS = ["", "십", "백", "천"];
const BIG_UNITS = ["", "만", "억", "조"];

/** 견적서 금액 표기용: 1234500 → "일백이십삼만사천오백" */
export function toKoreanAmount(value: number) {
  const amount = Math.floor(Math.abs(value));
  if (amount === 0) return "영";

  const digits = String(amount).split("").reverse().map(Number);
  let result = "";
  for (let group = 0; group * 4 < digits.length; group += 1) {
    let part = "";
    for (let i = 0; i < 4; i += 1) {
      const digit = digits[group * 4 + i];
      if (!digit) continue;
      part = `${DIGITS[digit]}${SMALL_UNITS[i]}${part}`;
    }
    if (part) result = `${part}${BIG_UNITS[group]}${result}`;
  }
  return result;
}

/** 부가세 포함 금액을 공급가액·세액으로 나눕니다. */
export function splitVat(totalIncludingVat: number) {
  const supply = Math.round(totalIncludingVat / 1.1);
  return { supply, vat: totalIncludingVat - supply };
}

export function createQuoteNumber(date = new Date()) {
  const ymd = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");
  return `MB-Q${ymd}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
}
