import { Routes, Route, Navigate } from "react-router-dom";
import DocFlowLayout from "@/layouts/DocFlowLayout";
import EventsLayout from "@/layouts/EventsLayout";
import PrivateRoute from "@/components/PrivateRoute";
import AuthLayout from "@/layouts/AuthLayout";
import Login from "@/pages/auth/Login";
import MagicLogin from "@/pages/auth/MagicLogin";
import { AuthProvider } from "@/context/AuthProvider";
import Signup from "@/pages/auth/Signup";
import EventsView from "@/pages/events/EventsView";
import EventsCreate from "@/pages/events/EventsCreate";
import EventsUserView from "@/pages/events/EventsUserView";
import EventsEdit from "@/pages/events/EventsEdit";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";
import File from "@/pages/files/File";
import ProfileRoute from "@/components/ProfileRoute";
import ChangePassword from "@/pages/user/ChangePassword";
import Forbidden from "@/pages/Forbidden";
import FileCreate from "@/pages/files/FileCreate";
import { AppSelection } from "@/pages/AppSelection";
import { CertificateCreate } from "@/pages/certificates";
import CertificateDashboard from "@/pages/certificates/CertificateDashboard";
import { CertificateReview } from "@/pages/certificates";

export default function Router() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Navigate to="/apps" replace />} />

          <Route path="/apps" element={<AppSelection />} />

          <Route path="/profile" element={<Profile />} />

          <Route path="/docflow" element={<DocFlowLayout />}>
            <Route index element={<Navigate to="/docflow/files" replace />} />

            <Route path="files">
              <Route index element={<File />} />
              <Route
                element={<ProfileRoute profile={["Admin", "Professor"]} />}
              >
                <Route path="create" element={<FileCreate />} />
              </Route>
            </Route>

            <Route path="certificates">
              <Route element={<ProfileRoute profile={["Student"]} />}>
                <Route path="create" element={<CertificateCreate />} />
                <Route path="dashboard" element={<CertificateDashboard />} />
              </Route>
              <Route element={<ProfileRoute profile={["Professor"]} />}>
                <Route path="review" element={<CertificateReview />} />
              </Route>
            </Route>
          </Route>

          <Route path="/events" element={<EventsLayout />}>
            <Route index element={<Navigate to="/events/all" replace />} />

            <Route path="all" element={<EventsView />} />
            <Route element={<ProfileRoute profile={["Admin", "Professor"]} />}>
              <Route path="user" element={<EventsUserView />} />
              <Route path="create" element={<EventsCreate />} />
              <Route path=":eventId/edit" element={<EventsEdit />} />
            </Route>

            <Route path="user">
              <Route path="changePassword" element={<ChangePassword />} />
            </Route>
          </Route>

        </Route>

        <Route element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
        </Route>

        <Route path="/auth/magic-login" element={<MagicLogin />} />

        <Route path="/forbidden" element={<Forbidden />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
