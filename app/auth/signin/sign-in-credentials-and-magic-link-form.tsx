"use client";

import { Typography } from "@/components/nowts/typography";
import { useLocalStorage } from "react-use";
import { SignInWithEmailOTP } from "./_components/sign-in-otp-form";
import { SignInPasswordForm } from "./_components/sign-in-password-form";
import { useTranslations } from "next-intl";

export const SignInCredentialsAndMagicLinkForm = (props: {
  callbackUrl?: string;
}) => {
  const t = useTranslations("auth.signin");
  const [isUsingCredentials, setIsUsingCredentials] = useLocalStorage(
    "sign-in-with-credentials",
    true,
  );

  if (!isUsingCredentials) {
    return (
      <div className="max-w-lg space-y-4">
        <SignInWithEmailOTP callbackUrl={props.callbackUrl} />
        <Typography variant="muted" className="text-xs">
          {t("preferPassword")} {" "}
          <Typography
            variant="link"
            as="button"
            type="button"
            onClick={() => {
              setIsUsingCredentials(true);
            }}
          >
            {t("usePassword")}
          </Typography>
        </Typography>
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-4">
      <SignInPasswordForm callbackUrl={props.callbackUrl} />
      <Typography variant="muted" className="text-xs">
        {t("wantFaster")} {" "}
        <Typography
          variant="link"
          as="button"
          type="button"
          onClick={() => {
            setIsUsingCredentials(false);
          }}
        >
          {t("loginWithOtp")}
        </Typography>
      </Typography>
    </div>
  );
};
