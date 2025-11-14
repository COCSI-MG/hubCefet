import { ComplementaryActivityType } from "@/api/services/complementary-activity-type-service";
import { Button } from "../ui/button";
import { createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper<ComplementaryActivityType>()

export const ComplementaryActivityTypeColumns = [
  columnHelper.accessor('id', {
    header: 'Id'
  }),

  columnHelper.accessor('name', {
    header: 'Nome'
  }),

  columnHelper.accessor('description', {
    header: 'Descrição'
  }),

  columnHelper.display({
    id: 'actions',
    header: 'Ações',
    cell: ({ row }) => {
      const item = row.original

      return (
        <div className="flex items-center space-x-2">
          <Button
            className="rounded-2xl bg-sky-900 text-white hover:bg-sky-700"
            variant="secondary"
            size="sm"
          >
            Atualizar
          </Button>
          <Button
            variant="destructive"
            className="rounded-2xl"
            size="sm"
          >
            Excluir
          </Button>
        </div>
      )
    },
  })
]
