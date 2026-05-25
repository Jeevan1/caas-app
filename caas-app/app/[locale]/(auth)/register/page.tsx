import { BecomeOrganizerCard } from "@/components/auth/BecomeOrganizerr";
import AuthSection from "@/components/auth/login-signup";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register as Organizer",
  robots: { index: false },
};

const RegisterOrganizer = async () => {
  const user = await getCurrentUser();

  const isNotOrganizer = user && !user?.roles.includes("organizer");

  if (isNotOrganizer) {
    return <BecomeOrganizerCard />;
  }

  return (
    <div>
      <AuthSection page="signup" isOrganizer />
    </div>
  );
};

export default RegisterOrganizer;
