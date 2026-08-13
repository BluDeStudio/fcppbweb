"use server";

import { redirect } from "next/navigation";
import { createAdminSession, destroyAdminSession } from "@/lib/adminAuth";

export async function adminLogin(formData: FormData) {
  const password = String(formData.get("password") ?? "");

  if (!process.env.FC_PPB_ADMIN_PASSWORD ||
      password !== process.env.FC_PPB_ADMIN_PASSWORD) {
    redirect("/admin/login?error=1");
  }

  await createAdminSession();
  redirect("/admin");
}

export async function adminLogout() {
  await destroyAdminSession();
  redirect("/admin/login");
}
