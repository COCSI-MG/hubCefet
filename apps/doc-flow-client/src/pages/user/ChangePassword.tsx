import PageHeader from "@/components/PageHeader";
import ChangePasswordForm from "@/components/user/ChangePasswordForm";

export default function ChangePassword() {
  return (
    <div>
      <PageHeader
        title="Trocar senha"
        description="Mantenha sua senha segura"
      />
      <div className="p-6 space-y-4">
        <div className="space-x-4 p-6 border rounded-xl w-full bg-slate-200">
          <div className="flex justify-center">
            <ChangePasswordForm />
          </div>
        </div>
      </div>
    </div>
  );
}
