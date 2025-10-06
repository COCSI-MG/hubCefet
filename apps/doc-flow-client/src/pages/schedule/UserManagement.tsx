import { UserManagementDataTable } from "@/components/user/UserManagementTable";
import PageHeader from "@/components/PageHeader";

export default function UserManagement() {
  return (
    <div>
      <PageHeader
        title="Gerenciamento de Usuários"
        description="Gerencie todos os usuários do sistema. Visualize, edite, crie e remova usuários conforme necessário."
      />
      <div className="container max-w-full flex flex-col space-y-2 p-6 h-fit">
        <div className="p-1">
          <UserManagementDataTable />
        </div>
      </div>
    </div>
  );
}
