/* eslint-disable react-refresh/only-export-components */
import React, { useState, ReactNode, useEffect, useCallback } from "react";
import { createContext } from "react";
import {
  UserPayload,
  userPayloadSchema,
  type AuthContextType,
} from "@/lib/types";
import { useLocation, useNavigate } from "react-router";
import LoadingOverlay from "@/components/LoadingOverlay";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<UserPayload | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.clear();
    setIsAuthenticated(false);
    navigate("/login", { replace: true });
  }, [navigate]);

  const decodeAndReturnPayload = useCallback((token: string) => {
    const payload = token.split(".")[1];
    //see: https://stackoverflow.com/questions/68849233/convert-a-string-to-base64-in-javascript-btoa-and-atob-are-deprecated
    const decodedPayload = atob(payload);
    return JSON.parse(decodedPayload);
  }, []);

  const tokenExpired = useCallback(
    (token: string) => {
      const payload = decodeAndReturnPayload(token);
      if (!payload) return false;
      const expirateDate = payload.exp * 1000;
      return expirateDate < Date.now();
    },
    [decodeAndReturnPayload],
  );

  const loadUser = useCallback(
    async (token: string) => {
      const payload = decodeAndReturnPayload(token);
      if (!payload) return false;
      const userPayload = userPayloadSchema.parse(payload);
      setUser(userPayload);
    },
    [decodeAndReturnPayload],
  );

  const checkAuthentication = useCallback(async () => {
    const accessToken = localStorage.getItem("accessToken");
    
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    try {
      if (tokenExpired(accessToken)) {
        logout();
        return;
      }
      
      setToken(accessToken);
      setIsAuthenticated(true);
      await loadUser(accessToken);
    } catch (err) {
      console.error("Erro durante a autenticação:", err);
    } finally {
      setIsLoading(false);
    }
  }, [tokenExpired, loadUser, logout]);

  useEffect(() => {
    checkAuthentication();
    if (isLoading) return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  useEffect(() => {
    if (isLoading) return;
    
    if (
      isAuthenticated &&
      (location.pathname === "/login" || location.pathname === "/signup")
    ) {
      const navigateFromTo = location.state?.from?.pathname || "/";
      navigate(navigateFromTo, { state: { from: "refresh" } });
      return;
    }

    if (!isAuthenticated) {
      if (location.pathname === "/login" || location.pathname === "/signup") {
        return;
      }
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, location, navigate, isLoading]);

  if (isLoading) {
    return <LoadingOverlay />;
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        setToken,
        user,
        logout,
        isAuthenticated,
        setIsAuthenticated,
        isLoading,
        checkAuthentication,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
