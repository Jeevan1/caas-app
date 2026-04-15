import { useState } from "react";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm p-0 overflow-hidden border-red-100 bg-white dark:border-red-900/30 dark:bg-zinc-900">
          <div className="p-6">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>

            <h2 className="mb-1.5 text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Delete event?
            </h2>

            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {eventName ? (
                <>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    “{eventName}”
                  </span>{" "}
                  will be permanently deleted. This action cannot be undone.
                </>
              ) : (
                "This event will be permanently deleted. This action cannot be undone."
              )}
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-zinc-100 px-6 py-4 dark:border-zinc-800 bg-red-50/30 dark:bg-red-950/20">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isDeleting}
              className="h-8 rounded-lg px-3 text-xs border-red-100 dark:border-red-900/30 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              disabled={isDeleting}
              onClick={handleConfirm}
              className="h-8 gap-1.5 rounded-lg bg-red-500 px-3 text-xs text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
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
        </DialogContent>
      </Dialog>
    </>
  );
}
