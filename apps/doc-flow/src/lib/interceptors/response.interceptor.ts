import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { ApiResponseDto } from 'src/lib/dto/api-response.dto';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponseDto<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponseDto<T>> {
    return next.handle().pipe(
      map(data => {
        return new ApiResponseDto(context.switchToHttp().getResponse().statusCode, true, data, null)
      })
    );
  }
}
