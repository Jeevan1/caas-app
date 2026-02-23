import { useState } from "react";
import { Trash2, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApiMutation } from "@/lib/utils";

interface DeleteAlertDialogProps {
  eventName?: string;
  trigger?: (open: () => void) => React.ReactNode;
  url?: string;
  queryKey?: string | string[];
  onSuccess?: () => void;
}

export function DeleteAlertDialog({
  onSuccess,
  eventName,
  trigger,
  url,
  queryKey,
}: DeleteAlertDialogProps) {
  const [open, setOpen] = useState(false);

  const { mutateAsync: deleteEvent, isPending: isDeleting } = useApiMutation({
    apiPath: url ?? "",
    method: "DELETE",
    queryKey: queryKey,
  });

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    if (isDeleting) return;
    setOpen(false);
  };

  const handleConfirm = async () => {
    try {
      await deleteEvent({});
      setOpen(false);
      onSuccess?.();
    } catch {
      // error handling can be extended here (e.g. toast)
    }
  };

  return (
    <>
      {trigger ? (
        trigger(handleOpen)
      ) : (
        <Button
          size="sm"
          variant="outline"
          disabled={isDeleting}
          className="h-8 gap-1.5 rounded-lg px-3 text-xs text-red-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
          onClick={handleOpen}
        >
          <Trash2 className="h-3 w-3" /> Delete
        </Button>
      )}

      {open && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleClose}
          />

          <div className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
            <div className="relative rounded-xl border border-red-100 bg-white shadow-2xl shadow-red-100/50 dark:border-red-900/30 dark:bg-zinc-900 dark:shadow-red-950/30">
              <button
                onClick={handleClose}
                disabled={isDeleting}
                className="absolute right-3 top-3 rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors disabled:pointer-events-none disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="p-6">
                <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>

                <h2 className="mb-1.5 text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Delete event?
                </h2>

                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {eventName ? (
                    <>
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">
                        "{eventName}"
                      </span>{" "}
                      will be permanently deleted. This action cannot be undone.
                    </>
                  ) : (
                    "This event will be permanently deleted. This action cannot be undone."
                  )}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-zinc-100 px-6 py-4 dark:border-zinc-800">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isDeleting}
                  className="h-8 rounded-lg px-3 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={isDeleting}
                  onClick={handleConfirm}
                  className="h-8 gap-1.5 rounded-lg bg-red-500 px-3 text-xs text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                >
                  {isDeleting ? (
                    <>
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Deleting…
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
