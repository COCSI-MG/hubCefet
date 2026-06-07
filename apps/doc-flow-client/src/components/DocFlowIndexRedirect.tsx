import { Navigate } from "react-router-dom";
import useProfile from "@/hooks/useProfile";

const DocFlowIndexRedirect = () => {
  const { profile } = useProfile();

  switch (String(profile).toLowerCase()) {
    case "student":
      return <Navigate to="/docflow/certificates/dashboard" replace />;
    case "professor":
      return <Navigate to="/docflow/certificates/review" replace />;
    default:
      return <Navigate to="/docflow/complementary" replace />;
  }
};

export default DocFlowIndexRedirect;
