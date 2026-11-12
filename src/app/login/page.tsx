import type { Metadata } from "next";

import AuthScreen from "./auth-screen";

export const metadata: Metadata = {
  title: "Sign up or log in",
};

export default function LoginPage() {
  return <AuthScreen />;
}
