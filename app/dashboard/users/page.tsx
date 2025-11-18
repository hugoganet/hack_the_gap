import { redirect } from "next/navigation";

export default function UsersPageRedirect() {
  redirect("/dashboard");
}
