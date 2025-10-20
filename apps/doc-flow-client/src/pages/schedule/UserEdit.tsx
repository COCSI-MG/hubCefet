import PageHeader from "@/components/PageHeader";
import { useForm } from "react-hook-form";
import { CreateUser } from "@/lib/schemas/user.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { ProfileSchema } from "@/lib/schemas/profile.schema";
import { getProfiles } from "@/api/data/profile.data";
import { getUser, updateUserPatchVerb } from "@/api/data/users.data";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import FormItemField from "@/components/FormItemField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LoaderCircle, ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { components } from "@/lib/schema";
import { z } from "zod";

type User = components["schemas"]["User"];

// Edit user schema (with password fields)
const editUserSchema = z
  .object({
    full_name: z.string(),
    email: z
      .string()
      .email()
      .regex(/(@cefet-rj\.br|@aluno\.cefet-rj\.br)$/, {
        message: "Email deve ser @cefet-rj.br ou @aluno.cefet-rj.br",
      }),
    enrollment: z.string().regex(/\d{4}\d{3}\w{3}/, {
      message: "Matrícula inválida",
    }),
    profileId: z.string(),
    password: z
      .string()
      .min(8, { message: "Senha deve ter no mínimo 8 caracteres" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type EditUser = z.infer<typeof editUserSchema>;

export default function UserEdit() {
  const [profiles, setProfiles] = useState<ProfileSchema[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const form = useForm<EditUser>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      full_name: "",
      email: "",
      enrollment: "",
      profileId: "",
      password: "",
      confirmPassword: "",
    },
  });

  const fetchProfiles = async () => {
    const profiles = await getProfiles();
    if (!profiles) return;
    setProfiles(profiles);
  };

  const fetchUser = useCallback(async () => {
    if (!id) {
      toast.error("ID do usuário não fornecido");
      navigate("/horarios/gerenciar/usuarios");
      return;
    }

    try {
      const userData = await getUser(id);
      if (!userData) {
        toast.error("Usuário não encontrado");
        navigate("/horarios/gerenciar/usuarios");
        return;
      }

      setUser(userData);
      form.reset({
        full_name: userData.full_name,
        email: userData.email,
        enrollment: userData.enrollment,
        profileId: userData.profile_id,
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Error fetching user:", err);
      toast.error("Erro ao carregar usuário");
      navigate("/horarios/gerenciar/usuarios");
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate, form]);

  useEffect(() => {
    fetchProfiles();
    fetchUser();
  }, [fetchUser]);

  const handleSubmit = async (data: EditUser) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      // Map the edit data to the API format
      const updateData: CreateUser = {
        full_name: data.full_name,
        email: data.email,
        enrollment: data.enrollment,
        profileId: data.profileId,
        password: data.password,
        confirmPassword: data.confirmPassword,
      };

      const updatedUser = await updateUserPatchVerb(id, updateData);
      if (!updatedUser) {
        throw new Error("Falha ao atualizar usuário");
      }

      toast.success("Usuário atualizado com sucesso");
      navigate("/horarios/gerenciar/usuarios");
    } catch (err) {
      console.error("Error updating user:", err);
      toast.error("Erro ao atualizar usuário");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      <PageHeader
        title="Editar Usuário"
        description={`Edite as informações do usuário "${user.full_name}".`}
      />

      <div className="container max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg border p-6">
          {/* Back Button */}
          <div className="mb-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate("/horarios/gerenciar/usuarios")}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar para Gerenciamento de Usuários</span>
            </Button>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItemField
                    field={field}
                    label="Nome Completo"
                    error={form.formState.errors.full_name?.message}
                    type="text"
                    placeholder="João Silva"
                  />
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItemField
                    field={field}
                    label="Email"
                    error={form.formState.errors.email?.message}
                    type="email"
                    placeholder="joao.silva@cefet-rj.br"
                  />
                )}
              />

              <FormField
                control={form.control}
                name="enrollment"
                render={({ field }) => (
                  <FormItemField
                    field={field}
                    label="Matrícula"
                    error={form.formState.errors.enrollment?.message}
                    type="text"
                    placeholder="2024123SINF"
                  />
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItemField
                    field={field}
                    label="Nova Senha"
                    error={form.formState.errors.password?.message}
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                  />
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItemField
                    field={field}
                    label="Confirmar Nova Senha"
                    error={form.formState.errors.confirmPassword?.message}
                    type="password"
                    placeholder="Digite a senha novamente"
                  />
                )}
              />

              <FormField
                control={form.control}
                name="profileId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Perfil</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-2xl bg-white bg-opacity-60">
                          <SelectValue placeholder="Selecione um perfil" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {profiles.map((profile) => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {profile.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/horarios/gerenciar/usuarios")}
                  disabled={isSubmitting}
                  className="rounded-2xl"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-sky-900 hover:bg-sky-800 rounded-2xl"
                >
                  {isSubmitting && (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
