import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import { ApiResponseDto } from "../dto/api-response.dto";
import { Response } from "express";
import { ExceptionResponseObject } from "../types";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const statusCode = exception.getStatus();

    const exceptionResponse = exception.getResponse() as string | ExceptionResponseObject;

    let message: string;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    }
    else if (Array.isArray(exceptionResponse.message)) {
      message = exceptionResponse.message[0];
    }
    else {
      message = exceptionResponse.message;
    }


    response.status(statusCode).json(new ApiResponseDto(statusCode, false, null, message));
  }
}
