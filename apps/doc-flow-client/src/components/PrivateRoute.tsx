import { Navigate, Outlet, useLocation } from "react-router";
import useAuth from "@/hooks/useAuth";

const PrivateRoute = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate
      to="/login"
      state={{
        from: location,
      }}
    />
  );
};

export default PrivateRoute;
