import { BASE_URL } from "../config";

export const loginUser = async (email: string, password: string) => {
  const res = await fetch(`${BASE_URL}/user/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error("Login failed");

  return res.text(); // your backend returns token as string
};