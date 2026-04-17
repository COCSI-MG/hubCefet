import { DropdownMenuItem } from "./ui/dropdown-menu";
import EllipsisDropdown from "./EllipsisDropdown";
import { Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EventsEllipsisDropdownInterface {
  eventId: string;
}

export default function EventsEllipsisDropdown({ eventId }: EventsEllipsisDropdownInterface) {
  const navigate = useNavigate()
  const navigationLink = `/events/${eventId}/edit`

  return (
    <EllipsisDropdown
      children={
        <>
          <DropdownMenuItem
            onSelect={() => navigate(navigationLink)}
            className="hover:bg-sky-100 cursor-pointer">
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
        </>
      }
    />
  );
}
