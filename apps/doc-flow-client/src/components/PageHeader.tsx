import { Separator } from "./ui/separator";

interface PageHeaderProps {
  title: string;
  description: string;
}

export default function PageHeader({ ...props }: PageHeaderProps) {
  return (
    <div>
      <header className="container w-1/2 p-6 space-y-4 max-md:w-full">
        <h1 className="text-2xl font-bold text-sky-900 mb-2">{props.title}</h1>
        <span className="text-muted">{props.description}</span>
      </header>
      <Separator />
    </div>
  );
}
