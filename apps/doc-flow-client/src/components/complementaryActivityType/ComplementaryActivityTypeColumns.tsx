import { ComplementaryActivityType } from "@/api/services/complementary-activity-type.service";
import { Button } from "../ui/button";
import { createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper<ComplementaryActivityType>()

export function GetComplementaryActivityTypeColumns(
  openEditModal: (item: ComplementaryActivityType) => void,
  openDeleteModal: (item: ComplementaryActivityType) => void,
) {
  return [

    columnHelper.accessor('name', {
      header: 'Nome',
      cell: (cell) => (
        <span className="block w-96 truncate">
          {cell.getValue()}
        </span>
      )
    }),

    columnHelper.accessor('description', {
      header: 'Descrição',
      cell: (cell) => (
        <span className="block w-96 truncate">
          {cell.getValue()}
        </span>
      )
    }),

    columnHelper.display({
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => {
        const item = row.original

        return (
          <div className="flex justify-start items-center gap-2">
            <Button
              className="rounded-2xl bg-sky-900 text-white hover:bg-sky-700"
              variant="secondary"
              size="sm"
              onClick={() => openEditModal(item)}
            >
              Editar
            </Button>

            <Button
              variant="destructive"
              className="rounded-2xl"
              size="sm"
              onClick={() => openDeleteModal(item)}
            >
              Excluir
            </Button>
          </div>
        )
      },
    })
  ]
}
