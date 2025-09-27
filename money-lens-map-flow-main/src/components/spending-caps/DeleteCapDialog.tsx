import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useDeleteSpendingCap } from "@/hooks/useApi";
import toast from "react-hot-toast";

interface DeleteCapDialogProps {
  isOpen: boolean;
  onClose: () => void;
  cap: any;
  onSuccess?: () => void;
}

export default function DeleteCapDialog({ isOpen, onClose, cap, onSuccess }: DeleteCapDialogProps) {
  const deleteCapMutation = useDeleteSpendingCap();

  const handleDelete = async () => {
    try {
      await deleteCapMutation.mutateAsync(cap.id);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error deleting cap:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Delete Spending Cap
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-lg">
            <Trash2 className="w-5 h-5 text-destructive mt-0.5" />
            <div>
              <p className="font-medium">Are you sure you want to delete this spending cap?</p>
              <p className="text-sm text-muted-foreground mt-1">
                <strong>"{cap?.name}"</strong> will be permanently removed and cannot be recovered.
              </p>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>This action will:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Remove the spending cap from your account</li>
              <li>Stop monitoring spending against this limit</li>
              <li>Delete all associated analytics data</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={deleteCapMutation.isPending}
          >
            {deleteCapMutation.isPending ? "Deleting..." : "Delete Cap"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
