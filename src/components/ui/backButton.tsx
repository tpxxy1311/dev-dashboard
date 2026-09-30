// src/components/ui/backButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import { useCanGoBack } from "@/hooks/useCanGoBack";

type BackButtonProps = {
  className?: string;
  disabledClassName?: string;
};

const BackButton = ({ className, disabledClassName }: BackButtonProps) => {
  const router = useRouter();
  const canGoBack = useCanGoBack();

  const classes = [className, !canGoBack && disabledClassName]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={classes}
      disabled={!canGoBack}
      onClick={() => router.back()}
      aria-label="Back"
    >
      <ArrowUturnLeftIcon width={24} height={24} aria-hidden="true" />
    </button>
  );
};

export default BackButton;
