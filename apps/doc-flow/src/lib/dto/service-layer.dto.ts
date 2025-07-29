export class ServiceLayerDto<T> {
  data: T | null;
  success: boolean;

  constructor(data: T | null, success: boolean) {
    this.data = data;
    this.success = success;
  }
}
