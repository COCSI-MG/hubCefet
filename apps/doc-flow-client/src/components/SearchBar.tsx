import { Input } from "./ui/input";

interface SearchBarProps {
  placeholder: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function SearchBar({ ...props }: SearchBarProps) {
  return (
    <div className="flex items-center w-full space-x-2 border rounded-2xl border-gray-200 bg-gray-50 py-2 px-3.5">
      <SearchIcon className="h-4 w-4" />
      <Input
        type="text"
        placeholder={props.placeholder}
        className="w-full h-8 border-0 rounded-2xl font-semibold bg-gray-50 focus-visible:ring-neutral-500"
        onChange={props.onChange}
      />
    </div>
  );
}

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 20 20"
      fill="currentColor"
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M8 0a8 8 0 015.657 13.657l5.657 5.657-1.414 1.414-5.657-5.657A8 8 0 118 0zm0 2a6 6 0 100 12A6 6 0 008 2z"
      />
    </svg>
  );
}
