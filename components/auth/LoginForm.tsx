import { useAuth } from "@/hooks/useAuth";
import { apiPost, setAccessToken } from "@/utils/api";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import ScaleInPressable from "../ScaleInPressable";
import ThemedButton from "../ui/ThemedButton";
import ThemedInput from "../ui/ThemedInput";

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
      <View>
        <Image
          source={require("../../assets/images/icon.png")}
          style={{
            borderRadius: 28,
            overflow: "hidden",
            width: 128,
            height: 128,
            marginBottom: 24,
          }}
        />
      </View>
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
        disabled={submitting || !username || !password}
        isLoading={submitting}
        onPress={handleSubmit}
        title="SUBMIT"
      ></ThemedButton>
      <ScaleInPressable
        onPress={() => router.push("/signup")}
        style={{ marginTop: 42 }}
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
      </ScaleInPressable>
    </View>
  );
}
