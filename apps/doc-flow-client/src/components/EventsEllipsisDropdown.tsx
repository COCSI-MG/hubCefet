import { DropdownMenuItem } from "./ui/dropdown-menu";
import EllipsisDropdown from "./EllipsisDropdown";
import { Edit } from "lucide-react";
import { Link } from "react-router-dom";

export default function EventsEllipsisDropdown({
  ...props
}: {
  eventId: string;
}) {
  return (
    <EllipsisDropdown
      children={
        <>
          <DropdownMenuItem className="hover:bg-sky-100">
            <Edit className="mr-2 h-4 w-4" />
            <Link to={`/events/${props.eventId}/edit`}>Editar</Link>
          </DropdownMenuItem>
        </>
      }
    />
  );
}
