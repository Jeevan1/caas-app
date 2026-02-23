"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useStore } from "@tanstack/react-store";
import { z } from "zod";
import {
  Plus,
  Pencil,
  ArrowRight,
  FolderOpen,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn, useApiMutation } from "@/lib/utils";
import StyledInput from "@/components/form/FormInput";
import FieldTextarea from "@/components/form/FieldTextarea";
import { FieldImageUpload } from "../form/ImageUploadField";
import { Category, PaginatedAPIResponse } from "@/lib/types";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { CATEGORIES_QUERY_KEY } from "@/constants";
import Image from "next/image";
import { DeleteAlertDialog } from "../DeleteAlertDialog";

// ─── SCHEMA ──────────────────────────────────────────────────────────────────

const categorySchema = z.object({
  name: z.string().min(1, "Title is required").min(2, "At least 2 characters"),
  description: z.string().max(200, "Max 200 characters").optional(),
  image: z
    .instanceof(File, { message: "Image is required" })
    .refine((f) => f.size <= 5 * 1024 * 1024, "Max 5 MB"),
});

type CategoryValues = z.infer<typeof categorySchema>;

// ─── FORM POPUP ───────────────────────────────────────────────────────────────

function CategoryForm({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: Category | null;
}) {
  const [done, setDone] = useState(false);
  const isEdit = !!editing;

  // ── Mutations ────────────────────────────────────────────────────────────────
  const { mutateAsync: createCategory } = useApiMutation({
    apiPath: "/api/event/categories",
    method: "POST",
    queryKey: CATEGORIES_QUERY_KEY,
  });

  const { mutateAsync: updateCategory } = useApiMutation({
    apiPath: `/api/event/categories/${editing?.idx}`,
    method: "PATCH",
    queryKey: CATEGORIES_QUERY_KEY,
  });

  // ── Form ──────────────────────────────────────────────────────────────────
  const form = useForm({
    defaultValues: {
      name: editing?.name ?? "",
      description: editing?.description ?? "",
      image: undefined as unknown as File,
    },
    validators: { onChange: categorySchema as any },
    onSubmit: async ({ value }) => {
      const payload = new FormData();
      payload.append("name", value.name);
      if (value.description) payload.append("description", value.description);
      payload.append("image", value.image);

      isEdit ? await updateCategory(payload) : await createCategory(payload);

      setDone(true);
      setTimeout(() => {
        setDone(false);
        onOpenChange(false);
      }, 1200);
    },
  });

  const { canSubmit, isSubmitting } = useStore(form.store, (s) => ({
    canSubmit: s.canSubmit,
    isSubmitting: s.isSubmitting,
  }));

  const handleOpenChange = (o: boolean) => {
    if (!o) {
      setDone(false);
      form.reset();
    }
    onOpenChange(o);
  };

  const accentClass = done
    ? "from-secondary via-green-400 to-secondary"
    : isEdit
      ? "from-accent via-primary to-secondary"
      : "from-primary via-secondary to-accent";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="overflow-hidden rounded-3xl border border-border bg-card p-0 shadow-2xl ring-1 ring-inset ring-white/[0.06] sm:max-w-sm">
        <DialogTitle className="sr-only">
          {isEdit ? "Edit category" : "Add category"}
        </DialogTitle>

        <div
          className={cn(
            "h-[2.5px] w-full bg-gradient-to-r transition-all duration-500",
            accentClass,
          )}
        />

        <div className="px-7 pb-7 pt-6">
          {done ? (
            <div
              className="flex flex-col items-center gap-4 py-8 text-center"
              style={{
                animation: "scaleIn 0.4s cubic-bezier(0.34,1.5,0.64,1) both",
              }}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10">
                <CheckCircle2 className="h-8 w-8 text-secondary" />
              </div>
              <div>
                <p className="font-heading text-xl font-bold text-foreground">
                  {isEdit ? "Category updated!" : "Category created!"} 🎉
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Changes saved successfully.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <div
                  className={cn(
                    "mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl text-xl",
                    isEdit ? "bg-accent/10" : "bg-primary/10",
                  )}
                >
                  {isEdit ? "✏️" : "📁"}
                </div>
                <h2 className="font-heading text-xl font-bold text-foreground">
                  {isEdit ? "Edit category" : "New category"}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isEdit
                    ? "Update the category details below"
                    : "Fill in the details to create a category"}
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
                <form.Field name="name">
                  {(field) => (
                    <StyledInput
                      field={field}
                      label="Title"
                      placeholder="e.g. Technology"
                    />
                  )}
                </form.Field>

                <form.Field name="description">
                  {(field) => (
                    <FieldTextarea
                      field={field}
                      label="Description"
                      placeholder="A short description of this category…"
                      maxLength={200}
                      optional
                    />
                  )}
                </form.Field>

                <form.Field name="image">
                  {(field) => (
                    <FieldImageUpload field={field} label="Category image" />
                  )}
                </form.Field>

                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className={cn(
                    "mt-1 w-full gap-2 rounded-xl font-bold",
                    isEdit && "bg-accent hover:bg-accent/90",
                  )}
                >
                  {isSubmitting ? (
                    isEdit ? (
                      "Saving…"
                    ) : (
                      "Creating…"
                    )
                  ) : isEdit ? (
                    <>
                      {" "}
                      Save changes <ArrowRight className="h-4 w-4" />{" "}
                    </>
                  ) : (
                    <>
                      {" "}
                      Create category <ArrowRight className="h-4 w-4" />{" "}
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

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

export function CategoryOverview() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  // ── Query ────────────────────────────────────────────────────────────────────
  const { data, isLoading } = useApiQuery<PaginatedAPIResponse<Category>>({
    url: "/api/event/categories/",
    queryKey: CATEGORIES_QUERY_KEY,
  });

  const categories = data?.results ?? [];

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
            Categories
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage campaign categories and their details.
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Total Categories",
            value: categories.length,
            color: "text-primary",
            bg: "bg-primary/10",
            icon: FolderOpen,
          },
          {
            label: "Active",
            value: "—",
            color: "text-secondary",
            bg: "bg-secondary/10",
            icon: CheckCircle2,
          },
          {
            label: "Total Campaigns",
            value: "—",
            color: "text-accent",
            bg: "bg-accent/10",
            icon: Plus,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-5"
          >
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
                s.bg,
              )}
            >
              <s.icon className={cn("h-5 w-5", s.color)} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              All Categories
            </h3>
            <p className="text-xs text-muted-foreground">
              {categories.length} categories total
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-16 text-center text-sm text-muted-foreground"
                  >
                    Loading…
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-16 text-center text-sm text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <FolderOpen className="h-8 w-8 text-muted-foreground/40" />
                      <p>No categories yet. Add one to get started.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr
                    key={cat.idx}
                    className="border-b border-border last:border-0 transition-colors hover:bg-muted/30"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-lg">
                          {cat.image ? (
                            <Image
                              src={cat.image}
                              alt={cat.name}
                              width={32}
                              height={32}
                              className="h-9 w-9 rounded-xl object-cover"
                            />
                          ) : (
                            "📁"
                          )}
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          {cat.name}
                        </span>
                      </div>
                    </td>

                    <td className="max-w-[220px] px-6 py-4 text-sm text-muted-foreground">
                      <span className="line-clamp-1">
                        {cat.description || "—"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1.5 rounded-lg px-3 text-xs"
                          onClick={() => {
                            setEditing(cat);
                            setOpen(true);
                          }}
                        >
                          <Pencil className="h-3 w-3" /> Edit
                        </Button>

                        <DeleteAlertDialog
                          url={`/api/event/categories/${cat.idx}`}
                          queryKey={CATEGORIES_QUERY_KEY}
                          eventName={cat.name}
                          onSuccess={() => console.log("deleted!")}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CategoryForm open={open} onOpenChange={setOpen} editing={editing} />
    </div>
  );
}
