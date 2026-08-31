import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";

export default async function Home() {
  redirect((await getCurrentAdmin()) ? "/books" : "/signin");
}
