import { useAuth } from "@/hooks/useAuth";
import { apiPost, getUserInfo, setAccessToken } from "@/utils/api";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import ThemedButton from "../ui/ThemedButton";
import ThemedInput from "../ui/ThemedInput";
export default function SignupForm() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const setUser = useAuth((state) => state.setUser);
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    const userInfo = await getUserInfo();

    apiPost<{ user: any; access_token: string; error: string }>(
      "/auth/signup",
      {
        username,
        password,
        info: userInfo,
      }
    )
      .then((data) => {
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
      })
      .catch((error) => {
        setSubmitting(false);
        alert(`An error occurred. Please try again. ${error.toString()}`);
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

      <ThemedButton
        disabled={submitting || !username || !password}
        isLoading={submitting}
        onPress={handleSubmit}
        title="SUBMIT"
      ></ThemedButton>
      <Pressable
        onPress={() => router.push("/login")}
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
          Already have an account? Log in
        </Text>
      </Pressable>
    </View>
  );
}
