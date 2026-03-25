import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { redirect } from "next/navigation";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  const isOrganizer = user?.roles.includes("organizer");

  if (isOrganizer) {
    return redirect("/");
  }
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
