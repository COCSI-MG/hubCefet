import { download, remove } from "@/api/data/file.data";
import { Button } from "../ui/button";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

interface ActionsTableColumnProps {
  fileId: string;
  onDelete: () => void;
}

export default function ActionsTableColumn({
  ...props
}: ActionsTableColumnProps) {
  const [isDownloading, setisDownloading] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handlePrimaryClick = async () => {
    setisDownloading(true);
    const result = await download(props.fileId);
    if (result !== undefined) {
      toast.error("Erro ao baixar arquivo");
    }
    setisDownloading(false);
  }

  const handleDestructiveClick = async () => {
    setIsDeleting(true);
    const data = await remove(props.fileId);
    if (data?.error) {
      toast.error("Erro ao excluir arquivo");
      setIsDeleting(false);
      return;
    }
    toast.success("Arquivo excluído com sucesso");
    setIsDeleting(false);
    props.onDelete();
  }

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="secondary"
        className="rounded-2xl bg-sky-900 text-white hover:bg-sky-700"
        size="sm"
        onClick={handlePrimaryClick}
        disabled={isDownloading || isDeleting}
      >
        {
          isDownloading ? (
            <LoaderCircle className="animate-spin" size={20} />
          ) : (
            "Baixar"
          )
        }
      </Button>
      <Button
        variant="destructive"
        className="rounded-2xl"
        size="sm"
        onClick={handleDestructiveClick}
        disabled={isDeleting || isDownloading}
      >
        {
          isDeleting ? (
            <LoaderCircle className="animate-spin" size={20} />
          ) : (
            "Excluir"
          )
        }
      </Button>
    </div>
  );
}
