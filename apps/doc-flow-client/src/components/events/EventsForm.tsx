import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { EventCreateSchema, Event } from "@/lib/schemas/event.schema";
import FormItemField from "../FormItemField";
import { UseFormReturn } from "react-hook-form";
import { Button } from "../ui/button";
import { FormatFormDateToLocal } from "@/lib/utils/form";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActivityTypes } from "@/hooks/useActivityTypes";
import { ActivityTypeEnum } from "@/lib/types/certificate.types";
import {
  ComplementaryActivityType,
  complementaryActivityTypeService,
} from "@/api/services/complementary-activity-type.service";
import {
  ExtensionActivityType,
  extensionActivityTypeService,
} from "@/api/services/extension-activity-type.service";
import { ApiError } from "@/api/errors/ApiError";

type modes = 'create' | 'edit';

interface EventsFormProps {
  form: UseFormReturn<EventCreateSchema>;
  onSubmit: (data: EventCreateSchema) => void;
  event?: Event;
  mode: modes;
}

export default function EventsForm({ form, onSubmit, event, mode }: EventsFormProps) {
  const discardText = mode === "edit"
    ? "Desfazer alterações"
    : "Limpar formulario";

  const { activityTypes } = useActivityTypes();
  const [complementaryActivityTypes, setComplementaryActivityTypes] =
    useState<ComplementaryActivityType[]>();
  const [extensionActivityTypes, setExtensionActivityTypes] =
    useState<ExtensionActivityType[]>();

  const activityTypeValue = form.watch("activity_type_id");

  async function fetchComplementaryActivityTypes() {
    try {
      const response = await complementaryActivityTypeService.findAll();
      setComplementaryActivityTypes(response.rows);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
        return;
      }
      toast.error("Erro ao carregar tipos de atividade complementar");
    }
  }

  async function fetchExtensionActivityTypes() {
    try {
      const response = await extensionActivityTypeService.findAll();
      setExtensionActivityTypes(response.rows);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
        return;
      }
      toast.error("Erro ao carregar tipos de atividade de extensão");
    }
  }

  useEffect(() => {
    if (activityTypeValue === ActivityTypeEnum.COMPLEMENTARY.toString()) {
      fetchComplementaryActivityTypes();
    }
    if (activityTypeValue === ActivityTypeEnum.EXTENSION.toString()) {
      fetchExtensionActivityTypes();
    }
  }, [activityTypeValue]);

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="w-full p-6 space-y-4 max-sm:w-full">
            <h1 className="text-2xl text-sky-900 font-bold mb-2">
              Nome do Evento
            </h1>
            <span className="text-sky-800">
              <strong>Descricao do evento:</strong>
            </span>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItemField
                  field={field}
                  error={form.formState.errors.description?.message}
                  type="textarea"
                  placeholder="Insira uma descrição detalhada..."
                />
              )}
            />
          </div>
          <div className="grid grid-cols-3 p-4 gap-x-8 gap-y-4  max-md:space-x-0 max-md:flex max-md:flex-col max-md:space-y-4">
            <div className="p-4 flex flex-col space-y-3 border rounded-xl max-md:col-span-0">
              <div>
                <span className="font-bold">Diretrizes</span>
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItemField
                      field={field}
                      label="Nome"
                      error={form.formState.errors.name?.message}
                      type="text"
                      placeholder="Nome do evento"
                    />
                  )}
                />
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="presence_option"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>Opção de Presença</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={event?.presence_option || "qrcode"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Defina a opção de presença" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="qrcode">QR Code</SelectItem>
                            <SelectItem value="geo">Manual / Confirmação</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    );
                  }}
                />
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="vacancies"
                  render={({ field }) => (
                    <FormItemField
                      field={{ ...field }}
                      label="Vagas Disponíveis"
                      error={form.formState.errors.vacancies?.message}
                      type="number"
                      placeholder="Quantidade vagas do evento"
                    />
                  )}
                />
              </div>
            </div>
            <div className="p-4 border rounded-xl space-y-3">
              <div>
                <span className="font-bold">Diretrizes</span>
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="start_at"
                  render={({ field }) => (
                    <FormItemField
                      field={{
                        ...field,
                      }}
                      label="Data de início"
                      error={form.formState.errors.start_at?.message}
                      type="date"
                      placeholder="Data de início"
                    />
                  )}
                />
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="end_at"
                  render={({ field }) => (
                    <FormItemField
                      field={field}
                      label="Data de término"
                      error={form.formState.errors.end_at?.message}
                      type="date"
                      placeholder="Data de término"
                    />
                  )}
                />
              </div>
            </div>
            <div className="p-4 border rounded-xl space-y-3">
              <span className="font-bold">Diretrizes</span>
              <div>
                <FormField
                  control={form.control}
                  name="eventStartTime"
                  render={({ field }) => (
                    <FormItemField
                      field={field}
                      label="Hora de início"
                      type="time"
                      placeholder="Hora de início"
                      error={form.formState.errors.eventStartTime?.message}
                    />
                  )}
                />
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="eventEndTime"
                  render={({ field }) => (
                    <FormItemField
                      field={field}
                      label="Hora de término"
                      type="time"
                      placeholder="Hora de término"
                      error={form.formState.errors.eventEndTime?.message}
                    />
                  )}
                />
              </div>
            </div>
            <div className="p-4 border rounded-xl space-y-3">
              <span className="font-bold">Diretrizes</span>
              <div>
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItemField
                      field={{ ...field }}
                      label="Latitude"
                      error={form.formState.errors.latitude?.message}
                      type="number"
                      placeholder="Latitude do evento"
                    />
                  )}
                />
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItemField
                      field={{ ...field }}
                      label="Longitude"
                      error={form.formState.errors.longitude?.message}
                      type="number"
                      placeholder="Longitude do evento"
                    />
                  )}
                />
              </div>
              <div className="flex items-end">
                <div className="w-2/6">
                  <FormField
                    control={form.control}
                    name="radius"
                    render={({ field }) => (
                      <FormItemField
                        field={{ ...field }}
                        label="Raio"
                        error={form.formState.errors.radius?.message}
                        type="number"
                        placeholder="Raio do evento"
                      />
                    )}
                  />
                </div>
                <span className="text-xs ml-2">metro(s)</span>
              </div>
            </div>
            <div className="p-4 border rounded-xl space-y-3">
              <span className="font-bold">Atividade vinculada</span>
              <FormField
                control={form.control}
                name="activity_type_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Atividade</FormLabel>
                    <FormControl>
                      <SearchableSelect
                        options={activityTypes.map((type) => ({
                          value: type.id,
                          label: type.name,
                        }))}
                        value={field.value ?? ""}
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue("complementary_activity_type_id", undefined);
                          form.setValue("extension_activity_type_id", undefined);
                        }}
                        placeholder="Selecione o tipo de atividade"
                        searchPlaceholder="Buscar tipos de atividade..."
                        emptyText="Nenhum tipo encontrado"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {activityTypeValue === ActivityTypeEnum.COMPLEMENTARY.toString() && (
                <FormField
                  control={form.control}
                  name="complementary_activity_type_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Atividade Complementar</FormLabel>
                      <FormControl>
                        <SearchableSelect
                          options={(complementaryActivityTypes ?? []).map((type) => ({
                            value: type.id.toString(),
                            label: type.name,
                          }))}
                          value={field.value ?? ""}
                          onValueChange={field.onChange}
                          placeholder="Selecione o tipo de atividade complementar"
                          searchPlaceholder="Buscar tipos de atividades complementares..."
                          emptyText="Nenhum tipo encontrado"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {activityTypeValue === ActivityTypeEnum.EXTENSION.toString() && (
                <FormField
                  control={form.control}
                  name="extension_activity_type_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Atividade de Extensão</FormLabel>
                      <FormControl>
                        <SearchableSelect
                          options={(extensionActivityTypes ?? []).map((type) => ({
                            value: type.id.toString(),
                            label: type.name,
                          }))}
                          value={field.value ?? ""}
                          onValueChange={field.onChange}
                          placeholder="Selecione o tipo de atividade de extensão"
                          searchPlaceholder="Buscar tipos de atividades de extensão..."
                          emptyText="Nenhum tipo encontrado"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {activityTypeValue && (
                <FormField
                  control={form.control}
                  name="activity_hours"
                  render={({ field }) => (
                    <FormItemField
                      field={{
                        ...field,
                        value: field.value ?? "",
                        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                          field.onChange(
                            e.target.value === "" ? undefined : Number(e.target.value)
                          ),
                      }}
                      label="Quantidade de Horas"
                      error={form.formState.errors.activity_hours?.message}
                      type="number"
                      placeholder="Horas da atividade"
                    />
                  )}
                />
              )}
            </div>
          </div>

          <div className="flex md:flex-row flex-col md:space-x-3 space-y-3 md:space-y-0 justify-end">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl border lg:w-full h-12 w-full"
              onClick={() => {
                if (mode === "edit" && event) {
                  const startParts = FormatFormDateToLocal(event.start_at);
                  const endParts = FormatFormDateToLocal(event.end_at);

                  form.reset({
                    name: event.name,
                    start_at: startParts.date,
                    eventStartTime: startParts.time,
                    end_at: endParts.date,
                    eventEndTime: endParts.time,
                    description: event.description,
                    latitude: event.latitude,
                    longitude: event.longitude,
                    radius: event.radius,
                    vacancies: event.vacancies,
                    presence_option: event.presence_option,
                  })
                } else {
                  form.reset()
                }
              }}
            >
              {discardText}
            </Button>
            <Button
              type="submit"
              variant="outline"
              className="rounded-xl bg-sky-900 text-white lg:w-full h-12 hover:bg-sky-800 w-full pl-0"
            >
              Confirmar
            </Button>
          </div>
        </form>
      </Form >
    </>
  );
}
