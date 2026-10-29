"use client";

import { Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { openPostcodeSearch } from "@/lib/postcode";

export type AddressValue = { zipcode: string; address: string; addressDetail: string };

export function AddressFields({
  value,
  onChange,
  required = false,
}: {
  value: AddressValue;
  onChange: (value: AddressValue) => void;
  required?: boolean;
}) {
  async function search() {
    try {
      await openPostcodeSearch((result) => {
        onChange({ ...value, zipcode: result.zipcode, address: result.address });
        document.getElementById("member_address_detail")?.focus();
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "주소 검색을 열지 못했습니다.");
    }
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor="member_address">
        주소 {required ? <span className="text-destructive">*</span> : null}
      </Label>
      <div className="flex gap-2">
        <Input
          aria-label="우편번호"
          value={value.zipcode}
          onChange={(event) => onChange({ ...value, zipcode: event.target.value })}
          placeholder="우편번호"
          maxLength={10}
          className="h-11 w-32"
        />
        <Button type="button" variant="outline" className="h-11" onClick={() => void search()}>
          <Search className="size-4" aria-hidden="true" />
          주소 검색
        </Button>
      </div>
      <Input
        id="member_address"
        value={value.address}
        onChange={(event) => onChange({ ...value, address: event.target.value })}
        placeholder="주소 검색을 누르거나 직접 입력해 주세요"
        required={required}
        maxLength={200}
        autoComplete="street-address"
        className="h-11"
      />
      <Input
        id="member_address_detail"
        aria-label="상세 주소"
        value={value.addressDetail}
        onChange={(event) => onChange({ ...value, addressDetail: event.target.value })}
        placeholder="상세 주소 (동·호수 등)"
        maxLength={200}
        className="h-11"
      />
    </div>
  );
}
