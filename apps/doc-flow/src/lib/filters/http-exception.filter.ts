import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import { ApiResponseDto } from "../dto/api-response.dto";
import { Response } from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const statusCode = exception.getStatus();
    const error = exception.message;

    res.status(statusCode).json(new ApiResponseDto(statusCode, false, null, error));
  }
}
