import { ApiError } from "@/api/errors/ApiError";
import { fileService } from "@/api/services/files.service";
import FileForm from "@/components/files/FileForm";
import FileUploader from "@/components/files/FileUploader";
import PageHeader from "@/components/PageHeader";
import { AxiosProgressEvent } from "axios";
import { useState } from "react";
import { toast } from "sonner";

export default function FileCreate() {
  const [createdFileId, setCreatedFileId] = useState<string | null>(null);
  const [canUpload, setCanUpload] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isFileModified, setIsFileModified] = useState<boolean>(false);

  const fileIsValid = (file: File) => {
    if (file.size > 1024 * 1024 * 10) {
      toast.error("Tamanho do arquivo maior que o permitido, máximo de 10MB");
      return false;
    }

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Tipo de arquivo inválido");
      return false;
    }

    return true;
  };

  const onProgress = (progressEvent: AxiosProgressEvent) => {
    setIsUploading(true);
    const total = progressEvent.total ?? 0;
    const percentCompleted = Math.round((progressEvent.loaded * 100) / total);
    if (percentCompleted === 100) {
      setIsUploading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Nenhum arquivo selecionado");
      return;
    }

    if (!fileIsValid(file)) {
      return;
    }

    if (!createdFileId) {
      toast.error("Arquivo não criado, por favor preencha as informações");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      await fileService.upload(createdFileId, formData, onProgress);

      setCanUpload(false);
      toast.success("Upload feito com sucesso");
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
        return;
      }

      toast.error("Erro inesperado ao realizar upload");
    }
  };
  return (
    <>
      <PageHeader
        title="Criando arquivos"
        description="Crie um arquivo para que possa ser compartilhado com os participantes"
      />
      <div className="ml-6 mr-6 mt-6 max-w-full p-6 border rounded-xl">
        <div className="flex flex-col p-4 gap-x-2 gap-y-4  space-x-0 xl:grid-cols-[1.5fr_1fr_1fr] xl:grid xl:items-center">
          <div className="p-4 flex flex-col space-y-3 border rounded-xl justify-center bg-neutral-50 h-full xl:py-0">
            <div>
              <span className="font-bold">Informações</span>
            </div>
            <FileForm
              onFileCreated={(fileId) => {
                setCreatedFileId(fileId);
                setCanUpload(true);
                setIsFileModified(false);
              }}
              onFileModified={() => {
                setIsFileModified(true);
                setCanUpload(false);
              }}
              disabled={canUpload && !isFileModified}
            />
          </div>
          <FileUploader
            canUpload={canUpload}
            setFile={setFile}
            handleUpload={handleUpload}
            isUploading={isUploading}
          />
        </div>
      </div>
    </>
  );
}
