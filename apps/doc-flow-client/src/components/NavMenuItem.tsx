import { SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";

interface NavMenuItemProps {
  text: string;
  onClick: () => void;
  activeNavItem: boolean;
  icon?: React.ReactNode;
}

export default function NavMenuItem({ ...props }: NavMenuItemProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        className={`${
          props.activeNavItem
            ? "bg-sky-900 text-white border rounded-xl min-h-10  hover:bg-sky-800"
            : "text-muted"
        } p-4 mb-4`}
        type="button"
        onClick={props.onClick}
      >
        {props.icon && <span className="mr-2">{props.icon}</span>}
        <span>{props.text}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
