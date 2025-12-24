import AsyncStorage from "@react-native-async-storage/async-storage";
import { io } from "socket.io-client";

const baseURL = `http://192.168.68.54:3010`;
console.log({ baseURL });
let accessToken: string | null = null;
export const getAcessToken = async () => {
  if (accessToken) return accessToken;
  accessToken = await AsyncStorage.getItem("accessToken");
  return accessToken;
};
export const setAccessToken = async (token: string | null) => {
  accessToken = token;
  if (!token) {
    await AsyncStorage.removeItem("accessToken");
  } else {
    await AsyncStorage.setItem("accessToken", token);
  }
};

const defaultHeaders = async () => {
  const token = await getAcessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export async function apiPost<T>(url: string, body: any): Promise<T> {
  return fetch(baseURL + url, {
    method: "POST",
    headers: await defaultHeaders(),
    body: JSON.stringify(body),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("apiPost", { url, body, data });
      return data;
    });
}

export async function apiGet<T>(url: string): Promise<T> {
  return fetch(baseURL + url, {
    method: "GET",
    headers: await defaultHeaders(),
  })
    .catch((error) => {
      console.log("apiGet error", { url, error });
      throw error;
    })
    .then((res) =>
      res.headers.get("content-type")?.includes("application/json")
        ? res.json()
        : res.text()
    )
    .then((data) => {
      console.log("apiGet", { url, data });
      return data;
    });
}
export async function apiDelete<T>(url: string): Promise<T> {
  return fetch(baseURL + url, {
    method: "DELETE",
    headers: await defaultHeaders(),
  }).then((res) => res.json());
}
export async function apiPut<T>(url: string, body: any): Promise<T> {
  return fetch(baseURL + url, {
    method: "PUT",
    headers: await defaultHeaders(),
    body: JSON.stringify(body),
  }).then((res) => res.json());
}

export const socket = io(baseURL, {
  autoConnect: false,
  auth: async (cb) => {
    const token = await getAcessToken();
    cb({ token });
  },
});

export function sendTypingIndicator(conversationId: number, isTyping: boolean) {
  socket.emit("typing", { conversationId, isTyping });
}

export function getUserInfo() {
  return fetch("https://user-info.goaff.pro")
    .then((res) => res.json())
    .catch((e) => {
      return null;
    });
}
