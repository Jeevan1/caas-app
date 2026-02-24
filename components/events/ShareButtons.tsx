"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareButtonsProps {
  url?: string;
  title?: string;
  description?: string;
  hashtags?: string[];
}

function getUrl(override?: string) {
  if (override) return override;
  if (typeof window === "undefined") return "";
  return window.location.href;
}

function twitterUrl(url: string, title: string, hashtags: string[]) {
  const params = new URLSearchParams({
    text: title,
    url,
    ...(hashtags.length ? { hashtags: hashtags.join(",") } : {}),
  });
  return `https://twitter.com/intent/tweet?${params}`;
}

function linkedinUrl(url: string) {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
}

function facebookUrl(url: string) {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

function whatsappUrl(url: string, title: string) {
  return `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`;
}

const SHARE_BUTTONS = (props: Required<ShareButtonsProps>) =>
  [
    {
      id: "twitter",
      label: "X",
      icon: "𝕏",
      href: twitterUrl(props.url, props.title, props.hashtags),
      active:
        "hover:border-[#1DA1F2]/40 hover:bg-[#1DA1F2]/5 hover:text-[#1DA1F2]",
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      icon: "in",
      href: linkedinUrl(props.url),
      active:
        "hover:border-[#0A66C2]/40 hover:bg-[#0A66C2]/5 hover:text-[#0A66C2]",
    },
    {
      id: "facebook",
      label: "Facebook",
      icon: "f",
      href: facebookUrl(props.url),
      active:
        "hover:border-[#1877F2]/40 hover:bg-[#1877F2]/5 hover:text-[#1877F2]",
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: "💬",
      href: whatsappUrl(props.url, props.title),
      active:
        "hover:border-[#25D366]/40 hover:bg-[#25D366]/5 hover:text-[#25D366]",
    },
  ] as const;

export function ShareButtons({
  url: urlProp,
  title = "Check this out!",
  description = "",
  hashtags = [],
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const url = getUrl(urlProp);
  const buttons = SHARE_BUTTONS({ url, title, description, hashtags });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement("input");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="mb-3 text-xs font-semibold text-foreground">Share</p>

      <div className="grid grid-cols-5 gap-2">
        {buttons.map((btn) => (
          <a
            key={btn.id}
            href={btn.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl border border-border bg-muted py-2.5 text-xs font-bold text-muted-foreground transition-all duration-150",
              btn.active,
            )}
          >
            <span className="text-sm leading-none">{btn.icon}</span>
            <span className="text-[9px]">{btn.label}</span>
          </a>
        ))}

        <button
          onClick={handleCopy}
          className={cn(
            "flex flex-col items-center gap-1 rounded-xl border border-border bg-muted py-2.5 text-xs font-bold transition-all duration-150",
            copied
              ? "border-secondary/40 bg-secondary/5 text-secondary"
              : "text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-primary",
          )}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <span className="text-sm leading-none">🔗</span>
          )}
          <span className="text-[9px]">{copied ? "Copied!" : "Copy"}</span>
        </button>
      </div>
    </div>
  );
}
