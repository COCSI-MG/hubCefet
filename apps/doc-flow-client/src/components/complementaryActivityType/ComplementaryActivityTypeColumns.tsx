import { ComplementaryActivityType } from "@/api/services/complementary-activity-type-service";
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

  // TODO: adicionar botoes para edicao e exclusao
  columnHelper.display({
    id: 'actions',
    header: 'Ações',
  }),
]
