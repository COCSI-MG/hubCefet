import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import useAuth from "@/hooks/useAuth";

const StudentRoute = () => {
  const { token } = useAuth();
  const location = useLocation();
  const [isStudent, setIsStudent] = useState<boolean | null>(null);
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
          const resolvedIsStudent = profileLower === 'student' || profileLower === 'aluno';

          setIsStudent(resolvedIsStudent);
        } else {
          setIsStudent(false);
        }
      } catch (err) {
        console.error('Erro ao decodificar token:', err);
        setIsStudent(false);
      } finally {
        setLoading(false);
      }
    };

    getUserProfile();
  }, [token]);

  if (loading) {
    return null;
  }

  if (isStudent) {
    const allowedPaths = [
      '/horarios',
      '/horarios/disciplina',
      '/horarios/aulas/detalhes'
    ];

    const isAllowedPath = allowedPaths.some(path =>
      location.pathname === path || location.pathname.startsWith(path + '/')
    );

    if (isAllowedPath) {
      return <Outlet />;
    } else {
      return <Navigate to="/horarios" replace />;
    }
  }

  return <Outlet />;
};

export default StudentRoute;