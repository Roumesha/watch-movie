export const getSessionId = (): string => {
    if (typeof window === "undefined") return "temp-session";
  let sessionId = localStorage.getItem("sessionId");
  console.log("method sessionId",sessionId);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("sessionId", sessionId);
    // console.log("New sessionId generated:", sessionId);
  }
  return sessionId;
};

export const getUserId = (): string => {
    if (typeof window === "undefined") return "temp-user";
  let userId = localStorage.getItem("userId");
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem("userId", userId);
    if (!localStorage.getItem("displayName")) localStorage.setItem("displayName", "Guest");
  }
  return userId;
};