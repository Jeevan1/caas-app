"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useStore } from "@tanstack/react-store";
import { z } from "zod";
import {
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Calendar,
  Tag,
  AlignLeft,
  Globe,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn, useApiMutation } from "@/lib/utils";
import StyledInput from "@/components/form/FormInput";
import FieldTextarea from "@/components/form/FieldTextarea";
import { FieldImageUpload } from "@/components/form/ImageUploadField";
import { FieldTagInput } from "@/components/form/TagInput";
import { Switch } from "@/components/ui/switch";
import { BLOG_QUERY_KEY } from "@/constants";
import { BlogPost } from "@/lib/types";

// ── Schema ────────────────────────────────────────────────────────────────────

const blogSchema = z.object({
  title: z.string().min(1, "Title is required").min(3, "At least 3 characters"),
  author: z.any(),
  content: z
    .string()
    .min(1, "Content is required")
    .min(20, "At least 20 characters"),
  cover_image: z
    .instanceof(File)
    .refine((f) => f.size <= 5 * 1024 * 1024, "Max 5 MB")
    .optional(),
  tags: z.array(z.string()).optional(),
  is_published: z.boolean(),
});

type BlogValues = z.infer<typeof blogSchema>;
type FormStep = "blog" | "done";

// ── Section divider ───────────────────────────────────────────────────────────

function Section({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <div className="h-px flex-1 bg-border/60" />
    </div>
  );
}

// ── Success screen ────────────────────────────────────────────────────────────

function SuccessScreen({ isEdit }: { isEdit: boolean }) {
  return (
    <div
      className="flex flex-col items-center gap-4 py-10 text-center"
      style={{ animation: "scaleIn 0.4s cubic-bezier(0.34,1.5,0.64,1) both" }}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10">
        <CheckCircle2 className="h-8 w-8 text-secondary" />
      </div>
      <div>
        <p className="font-heading text-xl font-bold text-foreground">
          {isEdit ? "Post updated!" : "Post published!"} 🎉
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Changes saved successfully.
        </p>
      </div>
    </div>
  );
}

// ── BlogForm dialog ───────────────────────────────────────────────────────────

export function BlogForm({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: BlogPost | null;
}) {
  const isEdit = !!editing;
  const [step, setStep] = useState<FormStep>("blog");

  const { mutateAsync: createPost } = useApiMutation<BlogValues>({
    apiPath: "/api/blog/posts/",
    method: "POST",
    queryKey: BLOG_QUERY_KEY,
  });

  const { mutateAsync: updatePost } = useApiMutation<BlogValues>({
    apiPath: `/api/blog/posts/${editing?.idx}/`,
    method: "PATCH",
    queryKey: BLOG_QUERY_KEY,
  });

  const form = useForm({
    defaultValues: {
      title: editing?.title ?? "",
      author: editing?.author ?? "",
      content: editing?.content ?? "",
      cover_image: undefined as File | undefined,
      tags: editing?.tags ?? [],
      is_published: editing?.is_published ?? false,
    } satisfies BlogValues,
    validators: { onChange: blogSchema as any },
    onSubmit: async ({ value }) => {
      if (isEdit) {
        await updatePost(value);
      } else {
        await createPost(value);
      }
      setStep("done");
      setTimeout(() => {
        setStep("blog");
        onOpenChange(false);
      }, 1400);
    },
  });

  const isPublished = useStore(form.store, (s) => s.values.is_published);
  const { canSubmit, isSubmitting } = useStore(form.store, (s) => ({
    canSubmit: s.canSubmit,
    isSubmitting: s.isSubmitting,
  }));

  const handleOpenChange = (o: boolean) => {
    if (!o) {
      setStep("blog");
      form.reset();
    }
    onOpenChange(o);
  };

  const accentClass =
    step === "done"
      ? "from-secondary via-green-400 to-secondary"
      : isEdit
        ? "from-accent via-primary to-secondary"
        : "from-primary via-secondary to-accent";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="overflow-hidden rounded-3xl border border-border bg-card p-0 shadow-2xl ring-1 ring-inset ring-white/[0.06] sm:max-w-xl">
        <DialogTitle className="sr-only">
          {isEdit ? "Edit post" : "New post"}
        </DialogTitle>

        {/* Accent bar */}
        <div
          className={cn(
            "h-[2.5px] w-full bg-gradient-to-r transition-all duration-500",
            accentClass,
          )}
        />

        <div className="max-h-[85vh] overflow-y-auto px-6 pb-6 pt-4">
          {/* ── Done ── */}
          {step === "done" && <SuccessScreen isEdit={isEdit} />}

          {/* ── Form ── */}
          {step === "blog" && (
            <>
              <div className="mb-4 text-center">
                <div
                  className={cn(
                    "mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl text-xl",
                    isEdit ? "bg-accent/10" : "bg-primary/10",
                  )}
                >
                  {isEdit ? "✏️" : "📝"}
                </div>
                <h2 className="font-heading text-xl font-bold text-foreground">
                  {isEdit ? "Edit post" : "New post"}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isEdit
                    ? "Update the post details below"
                    : "Fill in the details to publish a blog post"}
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleSubmit();
                }}
                className="flex flex-col gap-4"
              >
                <Section label="Content" />

                <form.Field name="title">
                  {(f) => (
                    <StyledInput
                      field={f}
                      label="Post title"
                      placeholder="e.g. Getting Started with Next.js"
                    />
                  )}
                </form.Field>

                <form.Field name="author">
                  {(f) => (
                    <FieldTextarea
                      field={f}
                      label="author"
                      maxLength={200}
                      placeholder="Short summary shown in post listings…"
                    />
                  )}
                </form.Field>

                <form.Field name="content">
                  {(f) => (
                    <FieldTextarea
                      field={f}
                      label="Content"
                      maxLength={10000}
                      placeholder="Write your post content here…"
                    />
                  )}
                </form.Field>

                <Section label="Media" />

                <form.Field name="cover_image">
                  {(f) => <FieldImageUpload field={f} label="Cover image" />}
                </form.Field>

                <Section label="Meta" />

                <form.Field name="tags">
                  {(f) => (
                    <FieldTagInput
                      field={f}
                      label="Tags"
                      placeholder="Type a tag and press Space…"
                    />
                  )}
                </form.Field>

                {/* Publish toggle */}
                <form.Field name="is_published">
                  {(f) => (
                    <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-3.5 py-3">
                      <div className="flex items-center gap-2.5">
                        {isPublished ? (
                          <Globe className="h-4 w-4 text-green-500" />
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {isPublished ? "Published" : "Draft"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {isPublished
                              ? "Visible to everyone"
                              : "Only visible to you"}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={Boolean(f.state.value)}
                        onCheckedChange={(v) => f.handleChange(v)}
                      />
                    </div>
                  )}
                </form.Field>

                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className={cn(
                    "mt-2 w-full gap-2 rounded-xl font-bold",
                    isEdit && "bg-accent hover:bg-accent/90",
                  )}
                >
                  {isSubmitting ? (
                    isEdit ? (
                      "Saving…"
                    ) : (
                      "Publishing…"
                    )
                  ) : isEdit ? (
                    <>
                      Save changes <ArrowRight className="h-4 w-4" />
                    </>
                  ) : isPublished ? (
                    <>
                      Publish post <ArrowRight className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Save draft <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </DialogContent>

      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </Dialog>
  );
}
