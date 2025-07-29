import { ViewFilesTable } from "@/components/files/ViewFilesTable";
import PageHeader from "@/components/PageHeader";

export default function File() {
  return (
    <div>
      <PageHeader title="Seus Arquivos" description="" />

      <div className="container max-w-full flex flex-col space-y-2 p-6 h-fit">
        <div className="p-1">
          <ViewFilesTable />
        </div>
      </div>
    </div>
  );
}
