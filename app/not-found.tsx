import { LandingHeader } from "@/features/landing/landing-header";
import { Page404 } from "@/features/page/page-404";

export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <LandingHeader />
      <div className="flex flex-1 items-center justify-center">
        <Page404 />
      </div>
    </div>
  );
}
