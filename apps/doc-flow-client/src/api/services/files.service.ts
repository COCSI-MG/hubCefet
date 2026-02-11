import { components } from "@/lib/schema";
import AbstractService from "./abstract.service";
import { CreateFile, CreateFileResponse } from "@/lib/schemas/file.schema";
import { AxiosProgressEvent } from "axios";
import { ApiError } from "../errors/ApiError";

type GetAllFilesResponseDto = components["schemas"]["GetAllFilesResponseDto"];

export default class FileService extends AbstractService {
  constructor() {
    super("/files", true);
  }

  async getAllByUser(args: {
    limit: number;
    offset: number;
  }): Promise<GetAllFilesResponseDto> {
    return await this.api.get(
      this.basePath + `/user?limit=${args.limit}&offset=${args.offset}`,
    );
  }

  async create(data: CreateFile): Promise<CreateFileResponse> {
    return await this.api.post(this.basePath, data);
  }

  async upload(
    fileId: string,
    fileData: FormData,
    onUploadProgress: (progressEvent: AxiosProgressEvent) => void,
  ) {
    return await this.api.post(this.basePath + `/upload/${fileId}`, fileData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    });
  }

  async download(fileId: string): Promise<void> {
    const token = localStorage.getItem('accessToken');
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    const response = await fetch(
      `${API_URL}/files/download/${fileId}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    if (!response.ok) {
      throw new ApiError("Eror ao baixar certificado", 500)
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `certificado-${fileId}.pdf`;
    link.click();

    URL.revokeObjectURL(url);
  }

  async remove(fileId: string) {
    return await this.api.delete(this.basePath + `/${fileId}`);
  }
}

export const fileService = new FileService()
