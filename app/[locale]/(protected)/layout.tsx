import { getCurrentUser } from "@/lib/auth/get-current-user";
import { CurrentUserProvider } from "@/lib/providers";
import { redirect } from "next/navigation";

export const metadata = {
  title: {
    default: "MHR",
    template: "%s | MHR",
  },
  description: "MHR Dashboard",
};

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex-1 overflow-y-auto ">
      <div className=" mx-auto px-4 py-6 lg:px-6 lg:py-8 w-full">
        {children}
      </div>
    </main>
  );
}
