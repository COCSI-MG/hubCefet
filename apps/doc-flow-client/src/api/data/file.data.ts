import { CreateFile, File, FileSchema } from "@/lib/schemas/file.schema";
import FileService from "../services/files.service";
import { AxiosError, AxiosProgressEvent } from "axios";
import { ApiResponse } from "@/lib/types";

const fileService = new FileService();

export async function getFilesByUser(args: {
  limit: number;
  offset: number;
}): Promise<File[] | undefined> {
  try {
    const res = await fileService.getAllByUser({ ...args });
    return res.data?.files;
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error(err);
    }
  }
}

export const create = async (
  file: CreateFile,
): Promise<FileSchema | undefined> => {
  try {
    const res = await fileService.create(file);
    return res.data?.file;
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error(err);
    }
  }
};

export const upload = async (
  fileId: string,
  fileData: FormData,
  onUploadProgress: (progressEvent: AxiosProgressEvent) => void,
): Promise<ApiResponse<{ message: string | null }> | undefined> => {
  try {
    const res = await fileService.upload(fileId, fileData, onUploadProgress);
    return res.data;
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error(err);
    }
    if (err instanceof AxiosError) {
      console.error(err.response?.data);
      if (err.response?.data === 409) {
        return err.response.data;
      }
    }
  }
};

export const download = async (fileId: string): Promise<void | ApiResponse<null>> => {
  try {
    const res = await fileService.download(fileId);
    if (!res) {
      return;
    }
    const url = window.URL.createObjectURL(res.data);
    const link = document.createElement("a");
    const fileName = res.headers["content-disposition"].split("filename=")[1];
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error(err);
    }
    if (err instanceof AxiosError) {
      return err.response?.data;
    }
  }
}

export const remove = async (fileId: string): Promise<void | ApiResponse<null>> => {
  try {
    const res = await fileService.remove(fileId);
    return res.data;
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error(err);
    }
    if (err instanceof AxiosError) {
      return err.response?.data;
    }
  }
}