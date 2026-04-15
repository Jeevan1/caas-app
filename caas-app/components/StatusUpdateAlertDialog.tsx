import { useState } from "react";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useApiMutation } from "@/lib/utils";
import { toast } from "sonner";

interface StatusUpdateAlertDialogProps {
  eventName?: string;
  trigger?: (open: () => void) => React.ReactNode;
  url?: string;
  queryKey?: string | string[];
  newStatus: number; // 1 for Draft, 2 for Published
  onSuccess?: () => void;
}

export function StatusUpdateAlertDialog({
  onSuccess,
  eventName,
  trigger,
  url,
  queryKey,
  newStatus,
}: StatusUpdateAlertDialogProps) {
  const [open, setOpen] = useState(false);

  const { mutateAsync: updateStatus, isPending } = useApiMutation({
    apiPath: url ?? "",
    method: "PATCH",
    queryKey: queryKey,
  });

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    if (isPending) return;
    setOpen(false);
  };

  const isPublishing = newStatus === 2;

  const handleConfirm = async () => {
    try {
      await updateStatus({ status: newStatus });
      setOpen(false);
      onSuccess?.();
    } catch {
      // error handling
    }
  };

  return (
    <>
      {trigger && trigger(handleOpen)}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 sm:max-w-sm overflow-hidden border-border bg-card shadow-2xl">
          <div className="flex flex-col items-center px-6 pt-8 pb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              {isPublishing ? (
                <CheckCircle2 className="h-6 w-6 text-primary" />
              ) : (
                <AlertCircle className="h-6 w-6 text-primary" />
              )}
            </div>

            <h2 className="mb-2 text-lg font-semibold text-foreground">
              {isPublishing ? "Publish event?" : "Move to draft?"}
            </h2>

            <p className="text-sm text-muted-foreground">
              {eventName ? (
                <>
                  <span className="font-medium text-foreground">
                    “{eventName}”
                  </span>{" "}
                  will be changed to {isPublishing ? "Published" : "Draft"}.
                  {isPublishing
                    ? " It will be visible to everyone."
                    : " It will be hidden from the public."}
                </>
              ) : (
                "This event's status will be changed."
              )}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 border-t border-border bg-muted/20 px-6 py-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
              className="h-8 rounded-lg px-3 text-xs"
            >
              Cancel
            </Button>
            <Button
              disabled={isPending}
              onClick={handleConfirm}
              className="h-8 gap-1.5 rounded-lg bg-primary px-3 text-xs text-primary-foreground hover:bg-primary/90"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Updating…
                </>
              ) : (
                <>{isPublishing ? "Publish" : "Move to Draft"}</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
