import ApiService from "./api-service";

export default abstract class AbstractService {
  protected basePath: string;
  protected api: ApiService;

  constructor(basePath: string, privateInstance = false) {
    this.basePath = basePath;
    this.api = new ApiService(privateInstance);
  }
}
