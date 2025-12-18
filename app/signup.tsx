import SignupForm from "@/components/auth/SignupForm";
import { Stack } from "expo-router";
import React from "react";

export default function Signup() {
  return (
    <React.Fragment>
      <Stack.Screen options={{ title: "Signup" }} />
      <SignupForm />
    </React.Fragment>
  );
}
