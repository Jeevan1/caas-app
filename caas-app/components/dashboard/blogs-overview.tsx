"use client";

import { useState } from "react";
import { Plus, Pencil, BookOpen, Calendar, Globe, Lock } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { BLOG_QUERY_KEY } from "@/constants";
import { BlogPost, PaginatedAPIResponse } from "@/lib/types";
import { DeleteAlertDialog } from "@/components/DeleteAlertDialog";
import { formatDistanceToNow } from "date-fns";
import { BlogForm } from "./blog-form";

export function BlogOverview() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);

  const { data, isLoading } = useApiQuery<PaginatedAPIResponse<BlogPost>>({
    url: "/api/blog/posts/",
    queryKey: BLOG_QUERY_KEY,
  });

  const posts = data?.results ?? [];

  const statCards = [
    {
      label: "Total Posts",
      value: posts.length,
      color: "text-primary",
      bg: "bg-primary/10",
      icon: BookOpen,
    },
    {
      label: "Published",
      value: posts.filter((p) => p.is_published).length,
      color: "text-secondary",
      bg: "bg-secondary/10",
      icon: Globe,
    },
    {
      label: "Drafts",
      value: posts.filter((p) => !p.is_published).length,
      color: "text-accent",
      bg: "bg-accent/10",
      icon: Lock,
    },
  ] as const;

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
            Blog
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and publish your blog posts.
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> New Post
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {statCards.map((s) => (
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
            <h3 className="text-sm font-semibold text-foreground">All Posts</h3>
            <p className="text-xs text-muted-foreground">
              {posts.length} posts total
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3">Post</th>
                <th className="px-6 py-3">Tags</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Author</th>
                <th className="px-6 py-3">Created</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-16 text-center text-sm text-muted-foreground"
                  >
                    Loading…
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-8 w-8 text-muted-foreground/40" />
                      <p>No posts yet. Create one to get started.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr
                    key={post.idx}
                    className="border-b border-border last:border-0 transition-colors hover:bg-muted/30"
                  >
                    {/* Post */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {post.image ? (
                          <Image
                            src={post.image}
                            alt={post.title}
                            width={36}
                            height={36}
                            className="h-9 w-9 shrink-0 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-base">
                            📝
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-foreground line-clamp-1">
                            {post.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {post.author?.name}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Tags */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {post.tags?.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-primary/8 px-2 py-0.5 text-[10px] font-medium text-primary"
                          >
                            {tag}
                          </span>
                        ))}
                        {(post.tags?.length ?? 0) > 2 && (
                          <span className="text-[10px] text-muted-foreground">
                            +{post.tags!.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                          post.is_published
                            ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {post.is_published ? (
                          <>
                            <Globe className="h-3 w-3" /> Published
                          </>
                        ) : (
                          <>
                            <Lock className="h-3 w-3" /> Draft
                          </>
                        )}
                      </span>
                    </td>

                    {/* Author */}
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {post.author ? `${post.author.name}` : "—"}
                    </td>

                    {/* Created */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-foreground">
                        {new Date(post.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(post.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1.5 rounded-lg px-3 text-xs"
                          onClick={() => {
                            setEditing(post);
                            setOpen(true);
                          }}
                        >
                          <Pencil className="h-3 w-3" /> Edit
                        </Button>
                        <DeleteAlertDialog
                          url={`/api/blog/posts/${post.idx}/`}
                          queryKey={BLOG_QUERY_KEY}
                          eventName={post.title}
                          onSuccess={() => {}}
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

      <BlogForm open={open} onOpenChange={setOpen} editing={editing} />
    </div>
  );
}
