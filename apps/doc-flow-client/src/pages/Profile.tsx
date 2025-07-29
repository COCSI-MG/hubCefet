import PageHeader from "@/components/PageHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/SquareAvatar";
import { Button } from "@/components/ui/button";
import UserEditDialog from "@/components/user/UserEditDialog";
import useAuth from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="Perfil"
        description="Dados atualizados, armazenados e seguros"
      />
      <div className="p-6">
        <div className="flex flex-col space-y-4 border rounded-2xl p-6 bg-sky-50">
          <div className="bg-sky-100 border rounded-xl p-4 min-h-48">
            <div className="p-6 flex items-center">
              <Avatar className="box-border size-32 bg-sky-900 border rounded-xl">
                <AvatarImage
                  src={user?.fullName.charAt(0).toLowerCase() || ""}
                  alt={user?.fullName}
                />
                <AvatarFallback className="text-2xl">
                  {user?.fullName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="ml-10 text-2xl text-sky-900 font-bold">
                {user?.fullName}
              </span>
            </div>
          </div>
          <div className="flex flex-row space-x-4">
            <Button
              variant="link"
              className="mr-2 bg-white border border-neutral-400 rounded-lg w-52"
              onClick={() => navigate("/user/changePassword")}
            >
              Trocar senha
            </Button>
            <UserEditDialog />
            <Button
              variant="link"
              className="mr-2 bg-white border border-neutral-400 rounded-lg w-52"
            >
              <Link to={"/events"}>Seus Eventos</Link>
            </Button>
            <Button
              variant="link"
              className="mr-2 bg-white border border-neutral-400 rounded-lg w-52"
            >
              Presenças em evento
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
