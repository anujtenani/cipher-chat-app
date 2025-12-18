import { useAuth } from "@/hooks/useAuth";
import { apiPost, setAccessToken } from "@/utils/api";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import ThemedButton from "../ui/ThemedButton";
import ThemedInput from "../ui/ThemedInput";
import { ThemedText } from "../ui/ThemedText";

export default function LoginForm() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const setUser = useAuth((state) => state.setUser);
  const handleSubmit = () => {
    setSubmitting(true);
    apiPost<{ user: any; access_token: string; error: string }>("/auth/login", {
      username,
      password,
    }).then((data) => {
      setSubmitting(false);
      if (data.error) {
        alert(data.error);
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
        Login
      </ThemedText>
      <ThemedInput
        value={username}
        style={{ marginBottom: 12 }}
        autoCapitalize="none"
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

      <ThemedButton
        isLoading={submitting}
        onPress={handleSubmit}
        title="Submit"
      ></ThemedButton>
      <Pressable
        onPress={() => router.push("/signup")}
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
          Don&apos;t have an account? Sign up
        </Text>
      </Pressable>
    </View>
  );
}
