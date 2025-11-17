import { getRequiredUser } from "@/lib/auth/auth-user";
import { UserDetailsForm } from "./(details)/user-details-form";

export default async function RoutePage() {
  const user = await getRequiredUser();

  return (
    <UserDetailsForm
      defaultValues={{
        name: user.name || "",
        email: user.email,
      }}
    />
  );
}
