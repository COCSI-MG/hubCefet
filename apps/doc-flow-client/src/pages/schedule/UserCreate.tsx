import PageHeader from "@/components/PageHeader";
import { useForm } from "react-hook-form";
import { CreateUser, createUserSchema } from "@/lib/schemas/user.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ProfileSchema } from "@/lib/schemas/profile.schema";
import { getProfiles } from "@/api/data/profile.data";
import { createUser } from "@/api/data/users.data";
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
import { useNavigate } from "react-router-dom";

export default function UserCreate() {
  const [profiles, setProfiles] = useState<ProfileSchema[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();

  const form = useForm<CreateUser>({
    resolver: zodResolver(createUserSchema),
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

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleSubmit = async (data: CreateUser) => {
    setIsSubmitting(true);
    try {
      const newUser = await createUser(data);
      if (!newUser) {
        throw new Error("Falha ao criar usuário");
      }

      toast.success("Usuário criado com sucesso");
      form.reset();

      // Navigate back to user management after success
      navigate("/horarios/gerenciar/usuarios");
    } catch (err) {
      console.error("Error creating user:", err);
      toast.error("Erro ao criar usuário");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Criar Novo Usuário"
        description="Preencha as informações abaixo para criar um novo usuário no sistema."
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
                    label="Senha"
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
                    label="Confirmar Senha"
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
                  Criar Usuário
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
