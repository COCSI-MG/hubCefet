import { ViewEventsDataTable } from "@/components/events/ViewEventsTable";
import PageHeader from "@/components/PageHeader";

export default function EventsView() {
  return (
    <div>
      <PageHeader
        title="Todos os eventos"
        description="Use o mecanismo de busca ou a ferramenta de filtros para encontrar o evento que deseja"
      />
      <div className="container max-w-full flex flex-col space-y-2 p-6 h-fit">
        <div className="p-1">
          <ViewEventsDataTable />
        </div>
      </div>
    </div>
  );
}
