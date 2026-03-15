import { fileService } from "@/api/services/files.service";
import { Button } from "../ui/button";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/api/errors/ApiError";

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
    try {
      setisDownloading(true);

      await fileService.download(props.fileId);
      toast.success(`Arquivo baixado com sucesso!`);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
        return
      }
      toast.error("Erro ao baixar arquivo. Tente novamente.");
    } finally {
      setisDownloading(false);
    }
  };


  const handleDestructiveClick = async () => {
    try {
      setIsDeleting(true);

      await fileService.remove(props.fileId);

      toast.success("Arquivo excluído com sucesso");
      props.onDelete?.();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
        return
      }

      toast.error("Erro ao excluir arquivo.");
    } finally {
      setIsDeleting(false);
    }
  };

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
