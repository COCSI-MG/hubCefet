import PageHeader from "@/components/PageHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/SquareAvatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import useAuth from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { Mail, User, Calendar, Shield, ArrowLeft } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="Perfil do Usuário"
        description="Visualize e gerencie suas informações pessoais"
      />
      <div className="p-6 max-w-4xl mx-auto">
        <div className="space-y-6">
          {/* User Info Card */}
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <div className="flex items-center space-x-6 mb-6">
              <Avatar className="w-24 h-24 bg-sky-900 border-2 border-sky-200">
                <AvatarImage
                  src={`https://avatar.vercel.sh/${user?.email}`}
                  alt={user?.fullName}
                />
                <AvatarFallback className="text-2xl text-white bg-sky-900">
                  {user?.fullName?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {user?.fullName}
                </h2>
                <div className="space-y-2 text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>{user?.email}</span>
                  </div>
                  {user?.profile && (
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4" />
                      <span className="capitalize">{user.profile.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator className="mb-6" />

            {/* User Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Informações Pessoais
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Nome Completo
                    </label>
                    <p className="text-gray-900">{user?.fullName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Email
                    </label>
                    <p className="text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Perfil
                    </label>
                    <p className="text-gray-900 capitalize">
                      {user?.profile?.name || "Não definido"}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Informações da Conta
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      ID do Usuário
                    </label>
                    <p className="text-gray-900 font-mono text-sm">
                      {user?.sub}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Status
                    </label>
                    <p className="text-green-600">Ativo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Ações</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="justify-start" asChild>
                <Link to="/apps">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao Menu
                </Link>
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => navigate("/user/changePassword")}
                disabled
              >
                <Shield className="w-4 h-4 mr-2" />
                Alterar Senha
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link to="/events">
                  <Calendar className="w-4 h-4 mr-2" />
                  Meus Eventos
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
