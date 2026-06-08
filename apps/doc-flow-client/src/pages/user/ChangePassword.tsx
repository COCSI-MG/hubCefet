import PageHeader from "@/components/PageHeader";
import ChangePasswordForm from "@/components/user/ChangePasswordForm";

export default function ChangePassword() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <PageHeader
        title="Trocar senha"
        description="Mantenha sua senha segura"
      />
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
