import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { CreateUser, createUserSchema } from "@/lib/schemas/user.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ProfileSchema } from "@/lib/schemas/profile.schema";
import { getProfiles } from "@/api/data/profile.data";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import FormItemField from "../FormItemField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { LoaderCircle } from "lucide-react";
import { components } from "@/lib/schema";

type User = components["schemas"]["User"];

interface UserEditDialogAdminProps {
  children: React.ReactNode;
  user: User;
  onSuccess?: () => void;
}

export default function UserEditDialogAdmin({
  children,
  user,
  onSuccess,
}: UserEditDialogAdminProps) {
  const [profiles, setProfiles] = useState<ProfileSchema[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<CreateUser>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      full_name: user.full_name,
      email: user.email,
      enrollment: user.enrollment,
      profileId: user.profile_id,
    },
  });

  const fetchProfiles = async () => {
    const profiles = await getProfiles();
    if (!profiles) return;
    setProfiles(profiles);
  };

  useEffect(() => {
    if (isOpen) fetchProfiles();
  }, [isOpen]);

  useEffect(() => {
    form.reset({
      full_name: user.full_name,
      email: user.email,
      enrollment: user.enrollment,
      profileId: user.profile_id,
    });
  }, [form, user]);

  const handleSubmit = async (data: CreateUser) => {
    setIsSubmitting(true);
    try {
      // Here you would call your update user API
      // const updatedUser = await updateUser(user.id, data);
      console.log("Updating user:", user.id, data);

      toast.success("Usuário atualizado com sucesso");
      setIsOpen(false);
      onSuccess?.();
    } catch (err) {
      console.error("Error updating user:", err);
      toast.error("Erro ao atualizar usuário");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>
            Edite as informações do usuário "{user.full_name}".
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
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

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-sky-900 hover:bg-sky-800"
              >
                {isSubmitting && (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                )}
                Salvar Alterações
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
