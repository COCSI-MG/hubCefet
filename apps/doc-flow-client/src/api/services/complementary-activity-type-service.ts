import { ApiResponse } from "@/lib/types";
import AbstractService from "./abstract.service";

export interface ComplementaryActivityType {
  id: number
  name: string
  description?: string
}

class ComplementaryActivityTypeService extends AbstractService {
  constructor() {
    super("/complementary-activity-type", true);
  }

  async findAll(): Promise<ComplementaryActivityType[]> {
    return await this.api.get(this.basePath);
  }

  async findOne(id: string): Promise<ComplementaryActivityType> {
    return await this.api.get(this.basePath + `/${id}`);
  }

  async create(createComplementaryActivityType: ComplementaryActivityType): Promise<ApiResponse<string>> {
    return await this.api.post(this.basePath, createComplementaryActivityType)
  }

  async update(id: string, updateComplementaryActivityType: ComplementaryActivityType): Promise<ApiResponse<string>> {
    return await this.api.patch(this.basePath + `/${id}`, updateComplementaryActivityType)
  }

  async remove(id: string): Promise<ApiResponse<string>> {
    return await this.api.delete(this.basePath + `/${id}`)
  }
}

export const complementaryActivityTypeService = new ComplementaryActivityTypeService()
