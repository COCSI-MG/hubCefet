import { toast } from "sonner";
import { FileIcon, LoaderCircle } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  canUpload: boolean;
  setFile: (file: File) => void;
  handleUpload: () => void;
  isUploading: boolean;
}

export default function FileUploader({
  canUpload,
  setFile,
  handleUpload,
  isUploading,
}: FileUploaderProps) {
  return (
    <div
      className={cn(
        "p-4 border rounded-xl max-md:col-span-0 col-span-2",
        !canUpload && "opacity-40"
      )}
    >
      <div
        onDrop={(e) => {
          if (!canUpload) {
            toast.warning("Você não pode fazer upload de arquivos");
            return;
          }

          e.preventDefault();
        }}
        draggable={canUpload}
        className="border-2 border-dashed border-gray-200 rounded-lg flex flex-col gap-1 p-6 items-center justify-center min-h-52 space-y-1"
      >
        <FileIcon className="w-12 h-12" />
        <span className="text-lg font-medium text-sky-900">
          Arraste algum arquivo para cá
        </span>
        <span className="text-sm text-sky-900">Ou clique para explorar</span>
        <Input
          type="file"
          className="w-1/2 border rounded-xl bg-sky-100 hover:cursor-pointer"
          onChange={(e) => {
            if (e.target?.files && e.target.files.length > 0) {
              setFile(e.target.files[0]);
            } else {
              toast.warning("Nenhum arquivo selecionado");
            }
          }}
          multiple={false}
          disabled={!canUpload}
        />

        <Button
          className="w-1/2 bg-sky-700 hover:bg-sky-900 text-white rounded-xl"
          onClick={handleUpload}
          disabled={!canUpload}
        >
          {isUploading ? (
            <>
              <LoaderCircle className="animate-spin w-12 h-12" />
              Enviando...
            </>
          ) : (
            "Enviar"
          )}
        </Button>
      </div>
    </div>
  );
}
