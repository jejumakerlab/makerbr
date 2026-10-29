"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ACCEPTED_PRODUCT_IMAGE_TYPES,
  uploadProductImage,
  validateProductImage,
} from "@/lib/admin/product-images";

const ABSOLUTE_URL = /^https?:\/\/\S+$/i;

export function ImageUrlField({
  id,
  name,
  required,
  defaultValue,
  folder,
  onUploadingChange,
}: {
  id: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
  folder: string;
  onUploadingChange?: (uploading: boolean) => void;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    const problem = validateProductImage(file);
    if (problem) {
      toast.error(problem);
      return;
    }
    setUploading(true);
    onUploadingChange?.(true);
    try {
      setUrl(await uploadProductImage(file, folder));
      toast.success("이미지를 올렸습니다.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "이미지를 올리지 못했습니다.");
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
    }
  }

  return (
    <div className="grid gap-2">
      {ABSOLUTE_URL.test(url) ? (
        <div className="bg-muted relative aspect-[16/9] overflow-hidden rounded-xl border">
          {/* 붙여넣은 외부 주소도 미리 볼 수 있도록 최적화 로더를 거치지 않습니다. */}
          <Image src={url} alt="대표 이미지 미리보기" fill unoptimized className="object-cover" />
          <button
            type="button"
            onClick={() => setUrl("")}
            className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
            aria-label="대표 이미지 지우기"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      ) : null}
      <div className="flex gap-2">
        <Input
          id={id}
          name={name}
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          required={required}
          placeholder="이미지 주소를 붙여넣거나 업로드하세요"
          className="h-11 min-w-0 flex-1"
        />
        <Button
          type="button"
          variant="outline"
          className="h-11 shrink-0"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Upload className="size-4" aria-hidden="true" />
          )}
          {uploading ? "올리는 중" : "사진 업로드"}
        </Button>
      </div>
      <p className="text-muted-foreground text-xs">JPG · PNG · WEBP · GIF · AVIF, 5MB 이하</p>
      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTED_PRODUCT_IMAGE_TYPES.join(",")}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void upload(file);
        }}
      />
    </div>
  );
}
