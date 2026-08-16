import { redirect } from "next/navigation";

export default function UnauthorizeAliasPage() {
  redirect("/unauthorized");
}
