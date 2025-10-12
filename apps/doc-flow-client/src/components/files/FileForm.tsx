import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { CreateFile, createFileSchema } from "@/lib/schemas/file.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "../ui/button";
import { create } from "@/api/data/file.data";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";

interface FileFormProps {
  onFileCreated: (fileId: string) => void;
  disabled?: boolean;
}

export default function FileForm({ ...props }: FileFormProps) {
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const form = useForm<CreateFile>({
    resolver: zodResolver(createFileSchema),
  });

  const handleSubmit = async (data: CreateFile) => {
    setIsCreating(true);
    const file = await create(data);
    if (file) {
      props.onFileCreated(file.id);
      toast.success("Arquivo criado com sucesso");
      setIsCreating(false);
      return;
    }
    toast.error("Erro ao criar arquivo");
    setIsCreating(false);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="grid grid-cols-6 items-center gap-4">
                <FormLabel className="text-right">Nome</FormLabel>
                <FormControl>
                  <Input
                    className={cn(
                      "rounded-2xl bg-white bg-opacity-60",
                      form.formState.errors?.name && "border-destructive",
                      "col-span-5"
                    )}
                    type="text"
                    placeholder="Nome do Arquivo"
                    {...field}
                    required
                    onInput={() => {
                      if (form.formState.errors.name?.message) {
                        toast.error(form.formState.errors.name.message);
                      }
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="grid grid-cols-6 items-center gap-4">
                <FormLabel className="text-right">Tipo do arquivo</FormLabel>
                <FormControl>
                  <Select
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="col-span-5 rounded-2xl">
                      <SelectValue placeholder="Selecione um tipo" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="certificate">Certificado</SelectItem>
                      <SelectItem value="image">Imagem</SelectItem>
                      <SelectItem value="document">Documento</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full bg-sky-700 hover:bg-sky-900 text-white rounded-xl"
            disabled={isCreating || props.disabled}
          >
            {isCreating ? (
              <>
                <LoaderCircle className="animate-spin w-12 h-12" />
                Criando...
              </>
            ) : (
              "Criar"
            )}
          </Button>
        </form>
      </Form>
    </>
  );
}
