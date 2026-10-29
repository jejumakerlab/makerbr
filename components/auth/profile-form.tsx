"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AddressFields, type AddressValue } from "@/components/auth/address-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export type ProfileFormValue = {
  fullName: string;
  phone: string;
} & AddressValue;

export function ProfileForm({
  userId,
  email,
  initial,
  redirectTo,
}: {
  userId: string;
  email: string;
  initial: ProfileFormValue;
  redirectTo: string;
}) {
  const [fullName, setFullName] = useState(initial.fullName);
  const [phone, setPhone] = useState(initial.phone);
  const [address, setAddress] = useState<AddressValue>({
    zipcode: initial.zipcode,
    address: initial.address,
    addressDetail: initial.addressDetail,
  });
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!fullName.trim() || !phone.trim() || !address.address.trim()) {
      toast.error("이름, 휴대전화, 주소를 모두 입력해 주세요.");
      return;
    }
    const supabase = createClient();
    if (!supabase) {
      toast.error("인증 서버가 설정되지 않았습니다.");
      return;
    }

    setPending(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        phone: phone.trim(),
        zipcode: address.zipcode.trim() || null,
        address: address.address.trim(),
        address_detail: address.addressDetail.trim() || null,
      })
      .eq("id", userId);

    if (error) {
      setPending(false);
      toast.error(`저장하지 못했습니다: ${error.message}`);
      return;
    }
    toast.success("회원정보를 저장했습니다.");
    window.location.assign(redirectTo);
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="profile_email">이메일</Label>
        <Input id="profile_email" value={email} readOnly disabled className="h-11" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="profile_name">
          이름 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="profile_name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          required
          maxLength={50}
          autoComplete="name"
          className="h-11"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="profile_phone">
          휴대전화 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="profile_phone"
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          required
          maxLength={30}
          placeholder="010-0000-0000"
          autoComplete="tel"
          className="h-11"
        />
      </div>
      <AddressFields value={address} onChange={setAddress} required />
      <Button type="submit" size="xl" disabled={pending}>
        {pending ? "저장 중..." : "저장하기"}
      </Button>
    </form>
  );
}
