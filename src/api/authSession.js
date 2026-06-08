import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  API_URL,
  AUTH_FAILURE_STATUS_CODES,
  REFRESH_TOKEN_ENDPOINT,
} from "../config/Config";

const AUTH_STORAGE_KEYS = [
  "token",
  "refresh_token",
  "refreshToken",
  "user",
  "logId",
];
const SESSION_CLEAR_KEYS = [...AUTH_STORAGE_KEYS, "circleClicked"];
const UNAUTHORIZED_MESSAGE_PATTERN =
  /unauthorized|forbidden|token.*(expired|invalid|revoked)|session.*(expired|invalid|revoked)/i;

let unauthorizedHandler = null;
let refreshPromise = null;
let logoutPromise = null;
const authTokenListeners = new Set();

const normalizeString = (value) =>
  typeof value === "string" ? value.trim() : "";

const getAuthPayload = (payload) => payload?.data || payload || {};

const getAccessTokenFromPayload = (payload) => {
  const authPayload = getAuthPayload(payload);

  return normalizeString(
    authPayload?.token ||
      authPayload?.access_token ||
      payload?.token ||
      payload?.access_token,
  );
};

const getRefreshTokenFromPayload = (payload) => {
  const authPayload = getAuthPayload(payload);

  return normalizeString(
    authPayload?.refresh_token ||
      authPayload?.refreshToken ||
      payload?.refresh_token ||
      payload?.refreshToken,
  );
};

const getUserFromPayload = (payload) => {
  const authPayload = getAuthPayload(payload);

  return (
    authPayload?.resultUser ||
    authPayload?.user ||
    payload?.resultUser ||
    payload?.user ||
    null
  );
};

const getLogIdFromPayload = (payload) => {
  const authPayload = getAuthPayload(payload);

  return (
    authPayload?.logId ??
    authPayload?.log_id ??
    authPayload?.resultUser?.logId ??
    payload?.logId ??
    payload?.log_id ??
    null
  );
};

const getAuthErrorMessage = (payload) =>
  [
    payload?.msg,
    payload?.message,
    payload?.error,
    payload?.statusText,
    payload?.status,
  ]
    .filter(Boolean)
    .join(" ");

const payloadLooksUnauthorized = (payload) =>
  UNAUTHORIZED_MESSAGE_PATTERN.test(getAuthErrorMessage(payload));

const buildRefreshUrl = () => {
  const normalizedEndpoint = REFRESH_TOKEN_ENDPOINT.startsWith("/")
    ? REFRESH_TOKEN_ENDPOINT
    : `/${REFRESH_TOKEN_ENDPOINT}`;

  return `${API_URL}${normalizedEndpoint}`;
};

const notifyAuthTokenListeners = (session) => {
  authTokenListeners.forEach((listener) => {
    try {
      listener(session);
    } catch (error) {
      console.log("Auth token listener error:", error);
    }
  });
};

const parseJsonSafely = async (response) => {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
};

const buildAuthorizedHeaders = (headers = {}, token) => ({
  "Content-Type": "application/json",
  ...headers,
  Authorization: `Bearer ${token}`,
});

export const buildApiUrl = (endpoint) => {
  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint;
  }

  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint.slice(1)
    : endpoint;

  return `${API_URL}/${normalizedEndpoint}`;
};

export const isAuthFailureStatus = (status) =>
  AUTH_FAILURE_STATUS_CODES.includes(status);

export const registerUnauthorizedHandler = (handler) => {
  unauthorizedHandler = typeof handler === "function" ? handler : null;
};

export const subscribeToAuthTokens = (listener) => {
  if (typeof listener !== "function") {
    return () => {};
  }

  authTokenListeners.add(listener);

  return () => {
    authTokenListeners.delete(listener);
  };
};

export const getStoredAuthTokens = async () => {
  const [token, refreshToken] = await AsyncStorage.multiGet([
    "token",
    "refresh_token",
  ]);

  return {
    token: normalizeString(token?.[1]),
    refreshToken: normalizeString(refreshToken?.[1]),
  };
};

export const clearSessionStorage = async () => {
  await AsyncStorage.multiRemove(SESSION_CLEAR_KEYS);
  notifyAuthTokenListeners({
    token: "",
    refreshToken: "",
  });
};

export const storeAuthTokens = async ({ token, refreshToken }) => {
  const normalizedToken = normalizeString(token);
  const normalizedRefreshToken = normalizeString(refreshToken);

  if (!normalizedToken) {
    throw new Error("Cannot store an empty access token.");
  }

  const updates = [["token", normalizedToken]];

  if (normalizedRefreshToken) {
    updates.push(["refresh_token", normalizedRefreshToken]);
  } else {
    await AsyncStorage.removeItem("refresh_token");
  }

  await AsyncStorage.multiSet(updates);
  notifyAuthTokenListeners({
    token: normalizedToken,
    refreshToken: normalizedRefreshToken,
  });
};

export const saveLoginSession = async (payload) => {
  const token = getAccessTokenFromPayload(payload);

  if (!token) {
    throw new Error("Login response did not include a token.");
  }

  const refreshToken = getRefreshTokenFromPayload(payload);
  const user = getUserFromPayload(payload);
  const logId = getLogIdFromPayload(payload);

  await AsyncStorage.multiRemove(AUTH_STORAGE_KEYS);

  const entries = [["token", token]];

  if (refreshToken) {
    entries.push(["refresh_token", refreshToken]);
  }

  if (user) {
    entries.push(["user", JSON.stringify(user)]);
  }

  if (logId !== null && logId !== undefined) {
    entries.push(["logId", JSON.stringify(logId)]);
  }

  await AsyncStorage.multiSet(entries);
  notifyAuthTokenListeners({
    token,
    refreshToken,
  });

  return {
    token,
    refreshToken,
    user,
    logId,
  };
};

export const logoutFromExpiredSession = async () => {
  if (logoutPromise) {
    return logoutPromise;
  }

  logoutPromise = (async () => {
    try {
      await clearSessionStorage();
    } catch (error) {
      console.log("Session clear error:", error);
    }

    try {
      await unauthorizedHandler?.();
    } catch (error) {
      console.log("Unauthorized handler error:", error);
    }
  })().finally(() => {
    logoutPromise = null;
  });

  return logoutPromise;
};

export const refreshAccessToken = async () => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const storedRefreshToken = normalizeString(
      await AsyncStorage.getItem("refresh_token"),
    );

    if (!storedRefreshToken) {
      throw new Error("No refresh token found.");
    }

    const response = await fetch(buildRefreshUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh_token: storedRefreshToken,
        refreshToken: storedRefreshToken,
      }),
    });

    const payload = await parseJsonSafely(response);

    if (
      !response.ok ||
      isAuthFailureStatus(response.status) ||
      payloadLooksUnauthorized(payload)
    ) {
      throw new Error(
        getAuthErrorMessage(payload) || "Refresh token request failed.",
      );
    }

    const nextToken = getAccessTokenFromPayload(payload);

    if (!nextToken) {
      throw new Error("Refresh response did not include a new token.");
    }

    const nextRefreshToken =
      getRefreshTokenFromPayload(payload) || storedRefreshToken;

    await storeAuthTokens({
      token: nextToken,
      refreshToken: nextRefreshToken,
    });

    return nextToken;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
};

export const authRequest = async (url, options = {}, retryAuth = true) => {
  const storedToken = normalizeString(await AsyncStorage.getItem("token"));

  if (!storedToken) {
    await logoutFromExpiredSession();

    return {
      response: null,
      data: null,
    };
  }

  const requestOptions = {
    ...options,
    headers: buildAuthorizedHeaders(options.headers, storedToken),
  };

  const response = await fetch(url, requestOptions);
  const data = await parseJsonSafely(response);
  const shouldRetryAuth =
    retryAuth &&
    (isAuthFailureStatus(response.status) || payloadLooksUnauthorized(data));

  if (!shouldRetryAuth) {
    return {
      response,
      data,
    };
  }

  try {
    const refreshedToken = await refreshAccessToken();
    const retriedResponse = await fetch(url, {
      ...options,
      headers: buildAuthorizedHeaders(options.headers, refreshedToken),
    });
    const retriedData = await parseJsonSafely(retriedResponse);

    if (
      isAuthFailureStatus(retriedResponse.status) ||
      payloadLooksUnauthorized(retriedData)
    ) {
      await logoutFromExpiredSession();
    }

    return {
      response: retriedResponse,
      data: retriedData,
    };
  } catch (error) {
    console.log("Token refresh failed:", error.message || error);
    await logoutFromExpiredSession();

    return {
      response,
      data,
    };
  }
};
