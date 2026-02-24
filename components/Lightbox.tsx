"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export function Lightbox({
  src,
  onClose,
}: {
  src: string;
  onClose: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <Dialog
      open
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="flex h-screen w-screen max-w-none items-center justify-center border-0 bg-black/45 p-0 shadow-none backdrop-blur-md [&>button]:text-white [&>button]:ring-white/20 [&>button]:hover:bg-white/20">
        <DialogTitle className="sr-only">Image preview</DialogTitle>

        <div className="relative h-[90vh] w-[90vw]">
          <Image
            src={src}
            alt="Preview"
            fill
            sizes="90vw"
            className="rounded-2xl object-contain shadow-2xl"
            priority
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
