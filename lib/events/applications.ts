import type { ApplicationStatus } from "@/types/database";

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "pending",
  "confirmed",
  "waitlist",
  "cancelled",
];

export const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
  pending: "확인 중",
  confirmed: "참가 확정",
  waitlist: "대기",
  cancelled: "취소",
};

export const APPLICATION_STATUS_STYLE: Record<ApplicationStatus, string> = {
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  confirmed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  waitlist: "bg-sky-50 text-sky-800 ring-sky-200",
  cancelled: "bg-slate-100 text-slate-600 ring-slate-200",
};

/** 마이페이지에서 신청자에게 보여 주는 안내 */
export const APPLICATION_STATUS_GUIDE: Record<ApplicationStatus, string> = {
  pending: "신청이 접수되었습니다. 담당자가 확인 후 참가를 확정해 드립니다.",
  confirmed: "참가가 확정되었습니다. 일정과 준비물을 확인해 주세요.",
  waitlist: "정원이 가득 차 대기자로 등록되었습니다. 자리가 나면 확정해 드립니다.",
  cancelled: "신청이 취소되었습니다. 문의는 고객센터로 연락해 주세요.",
};
