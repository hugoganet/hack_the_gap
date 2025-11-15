import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { closeGlobalDialog } from "./global-dialog.store";

// Pricing/plans removed for hackathon - this dialog is now a placeholder
export const OrgPlanDialog = () => {
  return (
    <Dialog open={true} onOpenChange={() => closeGlobalDialog()}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-auto px-8 py-6 lg:px-16 lg:py-14">
        <DialogHeader className="w-full text-center">
          <DialogTitle className="text-center font-bold lg:text-3xl">
            No Plans Available
          </DialogTitle>
          <DialogDescription className="text-center">
            Pricing and subscription plans have been removed for the hackathon version.
            All features are available for free.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
