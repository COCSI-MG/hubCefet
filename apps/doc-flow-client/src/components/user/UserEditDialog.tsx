import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { CreateUser, createUserSchema } from '@/lib/schemas/user.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from '../ui/select';
import { ProfileSchema } from '@/lib/schemas/profile.schema';
import { getProfiles } from '@/api/data/profile.data';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel } from '../ui/form';
import useProfile from '@/hooks/useProfile';
import { updateUserPatchVerb } from '@/api/data/users.data';
import useUser from '@/hooks/useUser';
import { LoaderCircle } from 'lucide-react';

export default function UserEditDialog() {
  const [profiles, setProfiles] = useState<ProfileSchema[]>([]);
  const { user, isLoading } = useUser();
  const { isUserProfileAdminOrProfessor } = useProfile();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const form = useForm<CreateUser>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      fullName: user?.full_name || '',
      email: user?.email || '',
      enrollment: user?.enrollment || '',
      profile_id: user?.profile_id || '',
    },
  });

  const fetchProfiles = async () => {
    const profiles = await getProfiles();
    if (!profiles) return;
    if (import.meta.env.DEV) toast.info('Perfis carregados com sucesso');
    setProfiles(profiles);
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    form.reset({
      fullName: user?.full_name || '',
      email: user?.email || '',
      enrollment: user?.enrollment || '',
      profile_id: user?.profile_id || '',
    });
  }, [form, user]);

  const handleSubmit = async (data: CreateUser) => {
    setIsSubmitting(true);
    if (!user) return;
    const updatedUser = await updateUserPatchVerb(user.id, data);
    if (updatedUser) {
      toast.success('Usuário atualizado com sucesso');
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(false);
    toast.error('Erro ao atualizar usuário');
  };

  return (
    <Dialog onOpenChange={(isOpen) => !isOpen && form.reset()}>
      <DialogTrigger asChild>
        <Button
          variant="link"
          className="mr-2 bg-white border border-neutral-400 rounded-lg w-52"
        >
          Editar dados
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar perfil</DialogTitle>
          <DialogDescription>
            Atualize suas informações pessoais, depois clique em "Salvar
            alterações"
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id="user-edit"
            onSubmit={form.handleSubmit(handleSubmit)}
            className={cn(isLoading && 'opacity-50')}
          >
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="fullName"
                defaultValue={user?.full_name || ''}
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Nome completo</FormLabel>
                    <FormControl>
                      <Input
                        className={cn(
                          'rounded-2xl bg-white bg-opacity-60',
                          form.formState.errors?.fullName &&
                            'border-destructive',
                          'col-span-3'
                        )}
                        type="text"
                        placeholder="Nome completo"
                        {...field}
                        required
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                defaultValue={user?.email || ''}
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Email</FormLabel>
                    <FormControl>
                      <Input
                        className={cn(
                          'rounded-2xl bg-white bg-opacity-60',
                          form.formState.errors?.email && 'border-destructive',
                          'col-span-3'
                        )}
                        type="email"
                        placeholder="Email"
                        {...field}
                        onInput={() => {
                          if (form.formState.errors.email?.message) {
                            toast.error(form.formState.errors.email.message);
                          }
                        }}
                        required
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="enrollment"
                defaultValue={user?.enrollment || ''}
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Matricula</FormLabel>
                    <FormControl>
                      <Input
                        className={cn(
                          'rounded-2xl bg-white bg-opacity-60',
                          form.formState.errors.enrollment?.message &&
                            'border-destructive',
                          'col-span-3'
                        )}
                        type="text"
                        placeholder="Matricula"
                        {...field}
                        onInput={() => {
                          if (form.formState.errors.enrollment?.message) {
                            toast.error(
                              form.formState.errors.enrollment.message
                            );
                          }
                        }}
                        required
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="profile_id"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Perfil</FormLabel>
                    <FormControl>
                      <Select
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        disabled={!isUserProfileAdminOrProfessor}
                      >
                        <SelectTrigger className="col-span-3 rounded-2xl">
                          <SelectValue placeholder="Selecione um perfil" />
                        </SelectTrigger>

                        <SelectContent>
                          {profiles.map((profile) => (
                            <SelectItem key={profile.id} value={profile.id}>
                              {profile.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="bg-sky-900 rounded-2xl text-white"
                form="user-edit"
                disabled={isLoading || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="w-6 h-6 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar alterações'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
