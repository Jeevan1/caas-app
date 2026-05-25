import AuthSection from "@/components/auth/login-signup";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  robots: { index: false },
};

const page = async () => {
  return (
    <div>
      <AuthSection page="signup" />
    </div>
  );
};

export default page;
