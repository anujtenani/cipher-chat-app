import LoginForm from "@/components/auth/LoginForm";
import { Stack } from "expo-router";
import React from "react";

export default function Login() {
  return (
    <React.Fragment>
      <Stack.Screen options={{ title: "Login" }} />
      <LoginForm />
    </React.Fragment>
  );
}
