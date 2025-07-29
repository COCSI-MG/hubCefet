import { Routes, Route, Navigate } from "react-router-dom";
import DefaultLayout from "@/layouts/DefaultLayout";
import DocFlowLayout from "@/layouts/DocFlowLayout";
import EventsLayout from "@/layouts/EventsLayout";
import ScheduleLayout from "@/layouts/ScheduleLayout";
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
import FileCreate from '@/pages/files/FileCreate';
import { AppSelection } from "@/pages/AppSelection";
import ScheduleView from '@/pages/schedule/ScheduleView';
import SubjectDetails from "@/pages/schedule/SubjectDetails";
import ClassManagement from "@/pages/schedule/ClassManagement";
import ClassForm from "@/pages/schedule/ClassForm";
import ClassDetails from "@/pages/schedule/ClassDetails";
import ClassStudents from "@/pages/schedule/ClassStudents";
import CancelClass from "@/pages/schedule/CancelClass";
import DisciplineCreate from "@/pages/schedule/DisciplineCreate";
import ManagementHome from '@/pages/schedule/RoomManagement';
import BlockRoomManagement from '@/pages/schedule/BlockRoomManagement';
import PeriodManagement from '@/pages/schedule/PeriodManagement';
import PeriodForm from '@/pages/schedule/PeriodForm';
import TeacherScheduleView from '@/pages/schedule/TeacherScheduleView';
import TimeSlotManagement from "@/pages/schedule/TimeSlotManagement";
import TimeSlotForm from "@/pages/schedule/TimeSlotForm";
import StudentRoute from "@/components/StudentRoute";
import AdminProfessorRoute from "@/components/AdminProfessorRoute";
import { CertificateCreate } from "@/pages/certificates";
import CertificateDashboard from "@/pages/certificates/CertificateDashboard";
import { CertificateReview } from "@/pages/certificates";
import { AllSchedulesView, PublicClassDetails } from '@/pages/schedule';

export default function Router() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Navigate to="/apps" replace />} />
          
          <Route path="/apps" element={<AppSelection />} />

          <Route path="/docflow" element={<DocFlowLayout />}>
            <Route index element={<Navigate to="/docflow/files" replace />} />
            
            <Route path="files">
              <Route index element={<File />} />
              <Route
                element={<ProfileRoute profile={['Admin', 'Professor']} />}
              >
                <Route path="create" element={<FileCreate />} />
              </Route>
            </Route>

            <Route path="certificates">
              <Route
                element={<ProfileRoute profile={['Student']} />}
              >
                <Route path="create" element={<CertificateCreate />} />
                <Route path="dashboard" element={<CertificateDashboard />} />
              </Route>
              <Route
                element={<ProfileRoute profile={['Professor']} />}
              >
                <Route path="review" element={<CertificateReview />} />
              </Route>
            </Route>
          </Route>

          <Route path="/events" element={<EventsLayout />}>
            <Route index element={<Navigate to="/events/all" replace />} />
            
            <Route path="all" element={<EventsView />} />
            <Route
              element={<ProfileRoute profile={['Admin', 'Professor']} />}
            >
              <Route path="user" element={<EventsUserView />} />
              <Route path="create" element={<EventsCreate />} />
              <Route path=":eventId/edit" element={<EventsEdit />} />
            </Route>

            <Route path="profile" element={<Profile />} />

            <Route path="user">
              <Route path="changePassword" element={<ChangePassword />} />
            </Route>
          </Route>

          <Route path="/horarios" element={<ScheduleLayout />}>
            <Route element={<StudentRoute />}>
              <Route index element={<ScheduleView />} />
              <Route path="todos" element={<AllSchedulesView />} />
              <Route path="disciplina/:id" element={<SubjectDetails />} />
              <Route path="aulas/detalhes/:id" element={<ClassDetails />} />
              <Route path="aulas/detalhes-publicos/:id" element={<PublicClassDetails />} />
              
              {/* Rotas restritas para Admin e Professor */}
              <Route element={<AdminProfessorRoute />}>
                <Route path="gerenciar" element={<ManagementHome />} />
                <Route path="gerenciar/horarios" element={<TimeSlotManagement />} />
                <Route path="gerenciar/horarios/novo" element={<TimeSlotForm />} />
                <Route path="gerenciar/horarios/:id" element={<TimeSlotForm />} />
                <Route path="aulas" element={<ClassManagement />} />
                <Route path="aulas/criar" element={<ClassForm />} />
                <Route path="aulas/editar/:id" element={<ClassForm />} />
                <Route path="aulas/alunos/:id" element={<ClassStudents />} />
                <Route path="aulas/cancelar/:id" element={<CancelClass />} />
                <Route path="disciplinas/cadastrar" element={<DisciplineCreate />} />
                <Route path="salas/gerenciar" element={<BlockRoomManagement />} />
                <Route path="periodos" element={<PeriodManagement />} />
                <Route path="periodos/criar" element={<PeriodForm />} />
                <Route path="periodos/editar/:id" element={<PeriodForm />} />
                <Route path="horarios/gerenciar" element={<TimeSlotManagement />} />
                <Route
                  element={<ProfileRoute profile={['Professor']} />}
                >
                  <Route path="mapa-horarios" element={<TeacherScheduleView />} />
                </Route>
              </Route>
            </Route>
          </Route>
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
        </Route>

        {/* Rota pública para Magic Login (fora do AuthLayout) */}
        <Route path="/auth/magic-login" element={<MagicLogin />} />

        <Route path="/forbidden" element={<Forbidden />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
