import EventsEllipsisDropdown from "../EventsEllipsisDropdown";
import { getEventsStatusText } from "@/lib/utils";
import { Event } from "@/lib/schemas/event.schema";

type ViewUserEventsBoxProps = {
  event: Event;
};

export default function ViewUserEventsBox({
  ...props
}: ViewUserEventsBoxProps) {
  const startedAtDate = new Date(props.event.start_at);

  return (
    <div
      className={
        props.event.status === "ended"
          ? "border border-slate-400 rounded-xl max-h-32 min-w-32 bg-sky-900 transition delay-150 duration-300 ease-in-out hover:-translate-y-2 hover:scale-105 hover:bg-sky-700"
          : "border border-slate-400 rounded-xl max-h-32 min-w-32 transition delay-150 duration-300 ease-in-out hover:-translate-y-2 hover:scale-105"
      }
    >
      <div className="p-4">
        <div className="flex flex-row justify-between align-middle">
          <span
            className={
              props.event.status === "ended" ? "text-white" : "text-sky-900"
            }
          >
            {props.event.name}
          </span>
          <EventsEllipsisDropdown eventId={props.event.id} />
        </div>
        <div className="flex flex-row space-x-4 content-end">
          <span
            className={
              props.event.status === "ended" ? "text-white" : "text-neutral-600"
            }
          >
            Data: {`${startedAtDate.toLocaleDateString("pt-br")}`}
          </span>
          <span
            className={
              props.event.status === "ended" ? "text-white" : "text-neutral-600"
            }
          >
            Horário: {`${startedAtDate.toLocaleTimeString("pt-br")}`}
          </span>
          <span
            className={
              props.event.status === "ended" ? "text-white" : "text-neutral-600"
            }
          >
            Status: {getEventsStatusText(props.event.status)}
          </span>
        </div>
      </div>
    </div>
  );
}
