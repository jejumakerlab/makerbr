import { createClient } from "@/lib/supabase/client";

export const PRODUCT_IMAGE_BUCKET = "product-images";
/** product-images 버킷의 file_size_limit 과 같아야 합니다. */
export const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_PRODUCT_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

const PUBLIC_PATH_MARKER = `/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/`;

export function validateProductImage(file: File) {
  if (!ACCEPTED_PRODUCT_IMAGE_TYPES.includes(file.type)) {
    return `${file.name}: JPG, PNG, WEBP, GIF, AVIF 이미지만 올릴 수 있습니다.`;
  }
  if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
    return `${file.name}: 5MB 이하 이미지만 올릴 수 있습니다.`;
  }
  return null;
}

export async function uploadProductImage(file: File, folder = "products") {
  const supabase = createClient();
  if (!supabase) throw new Error("Supabase 설정이 없어 이미지를 올릴 수 없습니다.");

  // Storage 객체 키는 한글 등 비ASCII 문자를 허용하지 않으므로 원본 파일명은 쓰지 않습니다.
  const ext = file.type.split("/")[1]?.replace("jpeg", "jpg") ?? "img";
  const path = `${folder}/${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(path, file, { contentType: file.type, cacheControl: "31536000" });
  if (error) throw new Error(`${file.name}: ${error.message}`);

  return supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** product-images 버킷에 올라간 이미지만 지웁니다. 외부 URL은 무시합니다. */
export async function removeProductImages(urls: string[]) {
  const paths = urls
    .map((url) => {
      const index = url.indexOf(PUBLIC_PATH_MARKER);
      return index === -1 ? null : decodeURIComponent(url.slice(index + PUBLIC_PATH_MARKER.length));
    })
    .filter((path): path is string => Boolean(path));
  if (paths.length === 0) return;

  const supabase = createClient();
  if (!supabase) return;
  const { error } = await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove(paths);
  if (error) console.warn("[product-images] 이미지 정리 실패", error.message);
}
