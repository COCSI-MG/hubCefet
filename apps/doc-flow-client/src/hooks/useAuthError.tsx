import { useContext } from "react";
import { AuthErrorContext } from "@/layouts/AuthLayout";

const useAuthError = () => {
  const context = useContext(AuthErrorContext);
  if (context === undefined) {
    throw new Error(
      "useAuthErrorContext must be used within a AuthErrorContext.Provider",
    );
  }
  return context;
};

export default useAuthError;
