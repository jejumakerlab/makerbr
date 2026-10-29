type DaumPostcodeData = {
  zonecode: string;
  roadAddress: string;
  jibunAddress: string;
  buildingName: string;
};

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: { oncomplete: (data: DaumPostcodeData) => void }) => {
        open: () => void;
      };
    };
  }
}

const POSTCODE_SCRIPT = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

function loadPostcodeScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.daum?.Postcode) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${POSTCODE_SCRIPT}"]`);
    const script = existing ?? document.createElement("script");
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("주소 검색을 불러오지 못했습니다.")), {
      once: true,
    });
    if (!existing) {
      script.src = POSTCODE_SCRIPT;
      script.async = true;
      document.head.appendChild(script);
    }
  });
}

/** 다음(카카오) 우편번호 검색 창을 열고, 고른 주소를 돌려줍니다. */
export async function openPostcodeSearch(
  onSelect: (result: { zipcode: string; address: string }) => void,
) {
  await loadPostcodeScript();
  new window.daum!.Postcode({
    oncomplete: (data) => {
      onSelect({
        zipcode: data.zonecode,
        address: [data.roadAddress || data.jibunAddress, data.buildingName && `(${data.buildingName})`]
          .filter(Boolean)
          .join(" "),
      });
    },
  }).open();
}
