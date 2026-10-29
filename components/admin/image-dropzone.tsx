"use client";

import { useEffect, useId, useRef, useState, type DragEvent } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import {
  ACCEPTED_PRODUCT_IMAGE_TYPES,
  uploadProductImage,
  validateProductImage,
} from "@/lib/admin/product-images";
import { cn } from "@/lib/utils";

export function ImageDropzone({
  label,
  hint,
  value,
  onChange,
  multiple = false,
  onUploadingChange,
}: {
  label: string;
  hint?: string;
  value: string[];
  onChange: (urls: string[]) => void;
  multiple?: boolean;
  onUploadingChange?: (uploading: boolean) => void;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [pending, setPending] = useState(0);
  const pendingRef = useRef(0);
  // 업로드가 끝나는 시점의 최신 목록에 덧붙여야, 업로드 중에 지운 사진이 되살아나지 않습니다.
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  function changePending(delta: number) {
    pendingRef.current += delta;
    setPending(pendingRef.current);
    onUploadingChange?.(pendingRef.current > 0);
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = multiple ? Array.from(fileList) : [fileList[0]];

    const valid: File[] = [];
    for (const file of files) {
      const problem = validateProductImage(file);
      if (problem) toast.error(problem);
      else valid.push(file);
    }
    if (valid.length === 0) return;

    changePending(valid.length);
    const results = await Promise.allSettled(valid.map((file) => uploadProductImage(file)));

    const uploaded: string[] = [];
    for (const result of results) {
      if (result.status === "fulfilled") uploaded.push(result.value);
      else toast.error(`업로드 실패 — ${result.reason instanceof Error ? result.reason.message : "알 수 없는 오류"}`);
    }
    if (uploaded.length > 0) {
      const next = multiple ? [...valueRef.current, ...uploaded] : uploaded.slice(0, 1);
      valueRef.current = next;
      onChange(next);
    }
    changePending(-valid.length);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    void handleFiles(event.dataTransfer.files);
  }

  const showDropArea = multiple || (value.length === 0 && pending === 0);

  return (
    <div className="grid gap-2">
      <p className="text-sm font-medium">{label}</p>

      {value.length > 0 || pending > 0 ? (
        <ul className={cn("grid gap-2", multiple ? "grid-cols-3" : "grid-cols-1")}>
          {value.map((url, index) => (
            <li
              key={url}
              className={cn(
                "bg-muted relative overflow-hidden rounded-xl border",
                multiple ? "aspect-square" : "aspect-[4/3]",
              )}
            >
              <Image
                src={url}
                alt={multiple ? `상세 사진 ${index + 1}` : "대표 사진"}
                fill
                className="object-cover"
                sizes={multiple ? "160px" : "480px"}
              />
              <button
                type="button"
                onClick={() => onChange(value.filter((item) => item !== url))}
                className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                aria-label={multiple ? `상세 사진 ${index + 1} 삭제` : "대표 사진 삭제"}
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </li>
          ))}
          {Array.from({ length: pending }).map((_, index) => (
            <li
              key={`pending-${index}`}
              className={cn(
                "bg-muted text-muted-foreground flex items-center justify-center rounded-xl border",
                multiple ? "aspect-square" : "aspect-[4/3]",
              )}
            >
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
              <span className="sr-only">업로드 중</span>
            </li>
          ))}
        </ul>
      ) : null}

      {showDropArea ? (
        <label
          htmlFor={inputId}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-4 text-center transition-colors",
            multiple ? "py-5" : "py-10",
            dragging
              ? "border-primary bg-primary/5"
              : "border-slate-300 hover:border-primary/50 hover:bg-slate-50",
          )}
        >
          <ImagePlus className="text-muted-foreground size-6" aria-hidden="true" />
          <span className="text-sm font-medium">
            사진을 끌어다 놓거나 <span className="text-primary underline">클릭해서 선택</span>
          </span>
          <span className="text-muted-foreground text-xs">
            {hint ?? "JPG · PNG · WEBP, 5MB 이하"}
          </span>
        </label>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-primary justify-self-start text-sm font-medium underline-offset-4 hover:underline"
        >
          다른 사진으로 바꾸기
        </button>
      )}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPTED_PRODUCT_IMAGE_TYPES.join(",")}
        multiple={multiple}
        className="sr-only"
        onChange={(event) => {
          void handleFiles(event.target.files);
          event.target.value = "";
        }}
      />
    </div>
  );
}
