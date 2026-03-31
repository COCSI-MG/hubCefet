import { Routes, Route, Navigate } from "react-router-dom";
import DocFlowLayout from "@/layouts/DocFlowLayout";
import EventsLayout from "@/layouts/EventsLayout";
import PrivateRoute from "@/components/PrivateRoute";
import AuthLayout from "@/layouts/AuthLayout";
import Login from "@/pages/auth/Login";
import MagicLogin from "@/pages/auth/MagicLogin";
import { AuthProvider } from "@/context/AuthProvider";
import Signup from "@/pages/auth/Signup";
import EventsCreate from "@/pages/events/EventsCreate";
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
import { CertificateDetails, CertificateReview, CertificateReviewDetails } from "@/pages/certificates";
import { ComplementaryActivityTypeManagement } from "@/pages/complementaryActivityType/ComplementaryActivityType";
import { ExtensionActivityTypeManagement } from "@/pages/extensionActivityType/ExtensionActivityType";
import AppSelecionLayout from "@/layouts/AppSelectionLayout";
import AllEventsView from "@/pages/events/AllEventsView";
import UserEventsView from "@/pages/events/UserEventsView";
import { EventView } from "@/pages/events/EventView";

export default function Router() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Navigate to="/apps" replace />} />

          <Route path="/apps" element={<AppSelecionLayout />}>
            <Route index element={<AppSelection />} />
          </Route>

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

            <Route
              path="complementary"
              element={<ProfileRoute profile={["Admin"]} />}
            >
              <Route index element={<ComplementaryActivityTypeManagement />} />
            </Route>

            <Route
              path="extension"
              element={<ProfileRoute profile={["Admin"]} />}
            >
              <Route index element={<ExtensionActivityTypeManagement />} />
            </Route>

            <Route path="certificates">
              <Route element={<ProfileRoute profile={["Student"]} />}>
                <Route path="create" element={<CertificateCreate />} />
                <Route path="dashboard" element={<CertificateDashboard />} />
                <Route path=":activityId" element={<CertificateDetails />} />
              </Route>
              <Route element={<ProfileRoute profile={["Professor"]} />}>
                <Route path="review" element={<CertificateReview />} />
                <Route path="review/:activityId" element={<CertificateReviewDetails />} />
              </Route>
            </Route>
          </Route>

          <Route path="/events" element={<EventsLayout />}>
            <Route index element={<Navigate to="/events/all" replace />} />

            <Route path="all" element={<AllEventsView />} />
            <Route path="user" element={<UserEventsView />} />
            <Route path=":eventId" element={<EventView />} />

            <Route element={<ProfileRoute profile={["Admin", "Professor"]} />}>
              <Route path="create" element={<EventsCreate />} />
            </Route>

            <Route element={<ProfileRoute profile={["Admin", "Professor"]} />}>
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
    </AuthProvider >
  );
}
