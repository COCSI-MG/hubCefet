import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import { EventCreateSchema, Event } from "@/lib/schemas/event.schema";
import FormItemField from "../FormItemField";
import { UseFormReturn } from "react-hook-form";
import { Button } from "../ui/button";
import { FormatFormDateToLocal } from "@/lib/utils/form";

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
                  name="status"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={event ? event.status : "upcoming"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Defina um status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="upcoming">Próximo</SelectItem>
                            <SelectItem value="started">
                              Em andamento
                            </SelectItem>
                            <SelectItem value="ended">Finalizado</SelectItem>
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
                    status: event.status,
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
