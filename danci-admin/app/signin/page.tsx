import { Suspense } from "react";
import { AuthForm } from "../components/auth-form";

export default function SigninPage() {
  return <Suspense><AuthForm mode="signin" /></Suspense>;
}
