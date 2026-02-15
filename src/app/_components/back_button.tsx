"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      size="sm"
      className="cursor-pointer"
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push("/blog"); 
        }
      }}
    >
      <ArrowLeft className="size-4" />
      Back
    </Button>
  );
}
