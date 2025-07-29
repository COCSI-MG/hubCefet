import { components } from "@/lib/schema";
import AbstractService from "./abstract.service";

type GetAllProfilesResponseDto =
  components["schemas"]["GetAllProfilesResponseDto"];

export default class FileService extends AbstractService {
  constructor() {
    super("/profile", true);
  }

  async getAll(args: {
    limit: number;
    offset: number;
  }): Promise<GetAllProfilesResponseDto> {
    return await this.api.get(
      this.basePath + `?limit=${args.limit}&offset=${args.offset}`,
    );
  }
}
