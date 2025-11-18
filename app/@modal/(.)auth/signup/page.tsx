import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DialogContent, DialogTitle } from "@/components/ui/dialog";
import { InterceptDialog } from "@/components/utils/intercept-dialog";
import { SiteConfig } from "@/site-config";
import { SignUpCredentialsForm } from "@app/auth/signup/sign-up-credentials-form";

export default function SignUpDialogPage() {
  return (
    <InterceptDialog>
      <DialogContent className="bg-card">
        <DialogTitle className="sr-only">Sign Up</DialogTitle>
        <div className="flex flex-col items-center justify-center gap-1">
          <div className="mx-auto mt-4 flex flex-row items-center gap-2">
            <Avatar className="size-8 rounded-md">
              <AvatarImage src={SiteConfig.appIcon} alt="app logo" />
              <AvatarFallback>
                {SiteConfig.title.substring(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-lg font-semibold">{SiteConfig.title}</span>
          </div>
          <p className="text-muted-foreground mt-2 text-center">
            Create your account to start learning.
          </p>
        </div>
        <SignUpCredentialsForm />
      </DialogContent>
    </InterceptDialog>
  );
}
