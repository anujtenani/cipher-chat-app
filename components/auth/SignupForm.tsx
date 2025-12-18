import { useAuth } from "@/hooks/useAuth";
import { apiPost, setAccessToken } from "@/utils/api";
import { router } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import ThemedButton from "../ui/ThemedButton";
import ThemedInput from "../ui/ThemedInput";
import { ThemedText } from "../ui/ThemedText";

export default function SignupForm() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const setUser = useAuth((state) => state.setUser);
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = () => {
    setSubmitting(true);
    apiPost<{ user: any; access_token: string; error: string }>(
      "/auth/signup",
      {
        username,
        password,
      }
    ).then((data) => {
      setSubmitting(false);
      if (data.error) {
        alert(data.error);
        return;
      } else {
        setAccessToken(data.access_token).then(() => {
          setUser(data.user);
          router.replace("/home");
        });
      }
    });
  };
  return (
    <View style={{ padding: 16 }}>
      <ThemedText type="title" style={{ marginBottom: 16 }}>
        Sign Up
      </ThemedText>
      <ThemedInput
        value={username}
        autoCapitalize="none"
        style={{ marginBottom: 12 }}
        placeholder="Enter username"
        onChangeText={setUsername}
      ></ThemedInput>
      <ThemedInput
        style={{ marginBottom: 12 }}
        value={password}
        secureTextEntry
        placeholder="Enter password"
        onChangeText={setPassword}
      ></ThemedInput>
      <ThemedInput
        style={{ marginBottom: 12 }}
        value={confirm}
        secureTextEntry
        placeholder="Confirm password"
        onChangeText={setConfirm}
      ></ThemedInput>
      <ThemedButton
        isLoading={submitting}
        onPress={handleSubmit}
        title="Submit"
      ></ThemedButton>
      <Pressable
        onPress={() => router.push("/login")}
        style={{ marginTop: 16 }}
      >
        <Text
          style={{
            color: "#007AFF",
            textAlign: "center",
            fontSize: 16,
            fontWeight: "bold",
          }}
        >
          Already have an account? Log in
        </Text>
      </Pressable>
    </View>
  );
}
