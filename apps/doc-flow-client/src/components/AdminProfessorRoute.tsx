import { Navigate, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import useAuth from "@/hooks/useAuth";

const AdminProfessorRoute = () => {
  const { token } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserProfile = () => {
      try {
        if (token) {
          const decoded: any = jwtDecode(token);

          let profileName = '';
          if (typeof decoded.profile === 'string') {
            profileName = decoded.profile;
          } else if (decoded.profile?.name) {
            profileName = decoded.profile.name;
          } else if (decoded.profile?.roles && decoded.profile.roles.length > 0) {
            profileName = decoded.profile.roles[0];
          }

          const profileLower = profileName.toLowerCase();
          const isAdmin = profileLower === 'admin' || profileLower === 'coordinator';
          const isProfessor = profileLower === 'professor';

          setIsAuthorized(isAdmin || isProfessor);
        } else {
          setIsAuthorized(false);
        }
      } catch (err) {
        console.error('Erro ao decodificar token:', err);
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    getUserProfile();
  }, [token]);

  if (loading) {
    return null;
  }

  return isAuthorized ? <Outlet /> : <Navigate to="/horarios" replace />;
};

export default AdminProfessorRoute;