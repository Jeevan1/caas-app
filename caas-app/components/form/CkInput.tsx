"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import "ckeditor5/ckeditor5.css";

interface FieldRichTextProps {
  field: {
    name: string;
    state: {
      value: string;
      meta: { errors: string[]; isTouched: boolean };
    };
    handleChange: (val: string) => void;
    handleBlur: () => void;
  };
  label?: string;
  placeholder?: string;
  height?: number;
  required?: boolean;
}

// ─── Base64 upload adapter — embeds image as data URL, no backend ────────────
function Base64UploadAdapterPlugin(editor: any) {
  editor.plugins.get("FileRepository").createUploadAdapter = (loader: any) => ({
    upload: async () => {
      const file: File = await loader.file;
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ default: reader.result as string });
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
    },
    abort: () => {},
  });
}

// ─── Lazy-load CKEditor ───────────────────────────────────────────────────────
let editorPromise: Promise<any> | null = null;
function loadCKEditor() {
  if (!editorPromise) {
    editorPromise = import("ckeditor5").then((mod) => ({
      ClassicEditor: mod.ClassicEditor,
      plugins: [
        mod.Essentials,
        mod.Autoformat,
        mod.Bold,
        mod.Italic,
        mod.Underline,
        mod.Strikethrough,
        mod.BlockQuote,
        mod.Heading,
        mod.Link,
        mod.List,
        mod.Paragraph,
        mod.Table,
        mod.TableToolbar,
        mod.MediaEmbed,
        mod.HorizontalLine,
        mod.Alignment,
        mod.FontSize,
        mod.FontColor,
        mod.FontBackgroundColor,
        mod.Image,
        mod.ImageInsert, // registers insertImage toolbar button
        mod.ImageInsertViaUrl, // URL tab inside the insert panel
        mod.ImageUpload, // required by ImageInsert internally
        mod.FileRepository, // required by ImageUpload internally
        mod.ImageResize,
        mod.ImageStyle,
        mod.ImageToolbar,
        mod.ImageCaption,
        mod.ImageBlock,
        mod.ImageInline,
        mod.Indent,
        mod.IndentBlock,
        mod.RemoveFormat,
        mod.SpecialCharacters,
        mod.SpecialCharactersEssentials,
        mod.Code,
        mod.CodeBlock,
        mod.FindAndReplace,
        mod.PasteFromOffice,
        mod.SelectAll,
        mod.Undo,
        mod.WordCount,
      ],
      toolbar: {
        items: [
          "heading",
          "|",
          "bold",
          "italic",
          "underline",
          "strikethrough",
          "removeFormat",
          "|",
          "alignment",
          "|",
          "bulletedList",
          "numberedList",
          "indent",
          "outdent",
          "|",
          "link",
          "insertImage",
          "blockQuote",
          "insertTable",
          "horizontalLine",
          "|",
          "fontSize",
          "fontColor",
          "fontBackgroundColor",
          "|",
          "findAndReplace",
          "selectAll",
          "|",
          "undo",
          "redo",
        ],
        shouldNotGroupWhenFull: true,
      },
      table: {
        contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
      },
      image: {
        toolbar: [
          "imageStyle:inline",
          "imageStyle:wrapText",
          "imageStyle:breakText",
          "imageStyle:block",
          "imageStyle:side",
          "|",
          "toggleImageCaption",
          "imageTextAlternative",
          "|",
          "resizeImage",
        ],
        insert: {
          integrations: ["upload", "url"],
        },
        resizeOptions: [
          { name: "resizeImage:original", value: null, label: "Original" },
          { name: "resizeImage:25", value: "25", label: "25%" },
          { name: "resizeImage:50", value: "50", label: "50%" },
          { name: "resizeImage:75", value: "75", label: "75%" },
        ],
        resizeUnit: "%" as const,
      },
      heading: {
        options: [
          {
            model: "paragraph",
            title: "Paragraph",
            class: "ck-heading_paragraph",
          },
          {
            model: "heading1",
            view: "h1",
            title: "Heading 1",
            class: "ck-heading_heading1",
          },
          {
            model: "heading2",
            view: "h2",
            title: "Heading 2",
            class: "ck-heading_heading2",
          },
          {
            model: "heading3",
            view: "h3",
            title: "Heading 3",
            class: "ck-heading_heading3",
          },
          {
            model: "heading4",
            view: "h4",
            title: "Heading 4",
            class: "ck-heading_heading4",
          },
        ],
      },
      fontSize: {
        options: [10, 12, 14, "default", 18, 20, 24, 28, 32],
      },
    }));
  }
  return editorPromise;
}

export function FieldRichText({
  field,
  label,
  placeholder = "Start writing your article…",
  height = 480,
  required = false,
}: FieldRichTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const rawErrors = field.state.meta.isTouched ? field.state.meta.errors : [];
  const errors = rawErrors.map((e: any) =>
    typeof e === "string" ? e : (e?.message ?? String(e)),
  );
  const hasError = errors.length > 0;

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    let destroyed = false;

    loadCKEditor().then(
      ({
        ClassicEditor,
        plugins,
        toolbar,
        table,
        image,
        heading,
        fontSize,
      }) => {
        if (destroyed || !containerRef.current) return;

        ClassicEditor.create(containerRef.current!, {
          licenseKey: "GPL",
          plugins,
          toolbar,
          table,
          image,
          heading,
          fontSize,
          placeholder,
          initialData: field.state.value ?? "",
          extraPlugins: [Base64UploadAdapterPlugin],
          wordCount: {
            onUpdate: (stats: { words: number }) => setWordCount(stats.words),
          },
        })
          .then((editor: any) => {
            if (destroyed) {
              editor.destroy();
              return;
            }
            editorRef.current = editor;

            // Sync changes back to TanStack Form
            editor.model.document.on("change:data", () => {
              field.handleChange(editor.getData());
            });

            editor.ui.focusTracker.on(
              "change:isFocused",
              (_: any, __: any, isFocused: boolean) => {
                if (!isFocused) field.handleBlur();
              },
            );

            setReady(true);
          })
          .catch(console.error);
      },
    );

    return () => {
      destroyed = true;
      editorRef.current?.destroy().catch(() => {});
      editorRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update editor when external value changes (e.g. form reset)
  useEffect(() => {
    if (!editorRef.current) return;
    const current = editorRef.current.getData();
    if (current !== field.state.value) {
      editorRef.current.setData(field.state.value ?? "");
    }
  }, [field.state.value]);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-semibold text-foreground">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
      )}

      <div
        className={cn(
          "ck-editor-wrapper rounded-md border bg-card overflow-hidden transition-colors",
          hasError
            ? "border-destructive ring-1 ring-destructive"
            : "border-border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary",
        )}
        style={{ minHeight: height }}
      >
        {/* CKEditor mounts here */}
        <div ref={containerRef} />

        {!ready && (
          <div
            className="flex items-center justify-center text-sm text-muted-foreground"
            style={{ minHeight: height }}
          >
            Loading editor…
          </div>
        )}
      </div>

      {/* Footer: word count + errors */}
      <div className="flex items-center justify-between px-1">
        {hasError ? (
          <p className="text-xs text-destructive">{errors[0]}</p>
        ) : (
          <span />
        )}
        {ready && (
          <span className="text-xs text-muted-foreground ml-auto">
            {wordCount} {wordCount === 1 ? "word" : "words"}
          </span>
        )}
      </div>

      {/* ── CKEditor theme overrides — matches your card/border system ── */}
      <style>{`
        .ck-editor-wrapper .ck.ck-editor__top .ck-sticky-panel .ck-toolbar {
          border: none !important;
          border: 0 !important;
          border-bottom: 1px solid hsl(var(--border)) !important;
          background: hsl(var(--card)) !important;
          border-radius: 0 !important;
          padding: 4px 6px !important;
          flex-wrap: wrap !important;
          height: auto !important;
          min-height: unset !important;
        }
        .ck-editor-wrapper .ck.ck-toolbar__items {
          flex-wrap: wrap !important;
        }
        .ck-editor-wrapper .ck.ck-editor__main > .ck-editor__editable {
          border: none !important;
          border-radius: 0 !important;
          background: transparent !important;
          color: hsl(var(--foreground)) !important;
          min-height: ${height - 80}px !important;
          padding: 1.25rem 1.5rem !important;
          font-size: 0.9375rem !important;
          line-height: 1.75 !important;
          box-shadow: none !important;
        }
        .ck-editor-wrapper .ck.ck-editor__main > .ck-editor__editable:focus {
          box-shadow: none !important;
        }
        .ck-editor-wrapper .ck.ck-editor {
          border: none !important;
          border-radius: 0 !important;
          box-shadow: none !important;
        }
        /* Toolbar buttons */
        .ck-editor-wrapper .ck.ck-button {
          border-radius: 6px !important;
          color: hsl(var(--foreground)) !important;
        }
        .ck-editor-wrapper .ck.ck-button:hover,
        .ck-editor-wrapper .ck.ck-button.ck-on {
          background: hsl(var(--muted)) !important;
        }
        /* Heading dropdown button text */
        .ck-editor-wrapper .ck.ck-heading-dropdown .ck-dropdown__button .ck-button__label {
          color: hsl(var(--foreground)) !important;
        }
        /* Dropdowns */
        .ck-editor-wrapper .ck.ck-dropdown__panel,
        .ck-editor-wrapper .ck.ck-list {
          background: hsl(var(--popover)) !important;
          border: 1px solid hsl(var(--border)) !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 16px rgba(0,0,0,.1) !important;
        }
        .ck-editor-wrapper .ck.ck-list__item .ck-button {
          color: hsl(var(--foreground)) !important;
        }
        .ck-editor-wrapper .ck.ck-list__item .ck-button:hover {
          background: hsl(var(--muted)) !important;
        }
        .ck-editor-wrapper .ck.ck-list__item .ck-button.ck-on {
          background: hsl(var(--primary) / 0.1) !important;
          color: hsl(var(--primary)) !important;
        }
        /* Heading options in dropdown */
        .ck-editor-wrapper .ck.ck-heading_heading1 { font-size: 1.4em !important; font-weight: bold !important; }
        .ck-editor-wrapper .ck.ck-heading_heading2 { font-size: 1.2em !important; font-weight: bold !important; }
        .ck-editor-wrapper .ck.ck-heading_heading3 { font-size: 1.1em !important; font-weight: bold !important; }
        /* Tooltip */
        .ck-editor-wrapper .ck.ck-tooltip__text {
          background: hsl(var(--foreground)) !important;
          color: hsl(var(--background)) !important;
          border-radius: 4px !important;
          font-size: 11px !important;
        }
        /* Placeholder */
        .ck-editor-wrapper .ck .ck-placeholder::before {
          color: hsl(var(--muted-foreground)) !important;
        }
        /* Balloon / inline toolbar */
        .ck.ck-balloon-panel {
          border: 1px solid hsl(var(--border)) !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 16px rgba(0,0,0,.12) !important;
          background: hsl(var(--popover)) !important;
        }
        .ck.ck-balloon-panel .ck.ck-button {
          color: hsl(var(--foreground)) !important;
        }
        /* Table */
        .ck-editor-wrapper .ck-content table {
          border-collapse: collapse;
        }
        .ck-editor-wrapper .ck-content td,
        .ck-editor-wrapper .ck-content th {
          border: 1px solid hsl(var(--border));
          padding: 6px 10px;
        }
        /* Code block */
        .ck-editor-wrapper .ck-content pre {
          background: hsl(var(--muted)) !important;
          border-radius: 6px !important;
          padding: 12px 16px !important;
          font-size: 13px !important;
        }
        /* Blockquote */
        .ck-editor-wrapper .ck-content blockquote {
          border-left: 3px solid hsl(var(--primary)) !important;
          background: hsl(var(--muted) / 0.3) !important;
          padding: 8px 16px !important;
          margin: 0 !important;
          border-radius: 0 6px 6px 0 !important;
        }
        /* Content headings */
        .ck-editor-wrapper .ck-content h1 { font-size: 2em; font-weight: 800; line-height: 1.2; margin: 0.5em 0; }
        .ck-editor-wrapper .ck-content h2 { font-size: 1.5em; font-weight: 700; line-height: 1.3; margin: 0.5em 0; }
        .ck-editor-wrapper .ck-content h3 { font-size: 1.25em; font-weight: 700; line-height: 1.4; margin: 0.5em 0; }
        .ck-editor-wrapper .ck-content h4 { font-size: 1.1em; font-weight: 600; line-height: 1.4; margin: 0.5em 0; }
      `}</style>
    </div>
  );
}
