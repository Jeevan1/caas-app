import AuthSection from "@/components/auth/login-signup";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { redirect } from "next/navigation";

const page = async () => {
  const user = await getCurrentUser();

  if (user) {
    return redirect("/");
  }
  return (
    <div>
      <AuthSection page="login" />
    </div>
  );
};

export default page;
