import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { ApiResponseDto } from "../dto/api-response.dto";
import { Request, Response } from "express";
import { ExceptionResponseObject } from "../types";
import { PinoLogger } from "nestjs-pino";

@Catch()
export class GeneralExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(GeneralExceptionFilter.name)
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>()

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse() as string | ExceptionResponseObject;
      const statusCode = exception.getStatus();

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

      this.logger.error(
        {
          message,
          method: request.method,
          url: request.url,
          statusCode
        },
        `Erro na requisicao HTTP  `,
      )

      return response.status(statusCode).json(new ApiResponseDto(statusCode, false, null, message));
    }

    const statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

    this.logger.error(
      {
        err: exception instanceof Error ? exception.stack : exception,
        method: request.method,
        url: request.url,
        statusCode,
      },
      'Erro desconhecido'
    );

    return response.status(statusCode).json(new ApiResponseDto(statusCode, false, null, 'Erro Interno no Servidor'))
  }
}
