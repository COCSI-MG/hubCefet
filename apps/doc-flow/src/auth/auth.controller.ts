import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInAuthDto } from './dto/signin-auth.dto';
import { Response } from 'express';
import { SignUpAuthDto } from './dto/singup-auth.dto';
import { Public } from './decorators/public-auth.decorator';
import { ApiResponse, ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiResponseDto } from 'src/lib/dto/api-response.dto';
import { AccessTokenResponseDto } from './dto/access-token-response.dto';
import { MagicLoginRequestDto } from './dto/magic-login-request.dto';
import { MagicLoginVerifyDto } from './dto/magic-login-verify.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Login com email e senha' })
  @ApiResponse({
    status: 200,
    description: 'Sign in',
    type: AccessTokenResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
    type: ApiResponseDto,
  })
  @Public()
  @Post('signin')
  async signIn(@Res() res: Response, @Body() signinDto: SignInAuthDto) {
    try {
      const accessToken = await this.authService.signIn(signinDto);
      if (!accessToken) {
        return res
          .status(401)
          .json(new ApiResponseDto(401, false, null, 'Invalid credentials'));
      }
      return res.status(200).json(accessToken);
    } catch (err) {
      if (process.env.APP_ENV === 'development') {
        console.error(err);
      }
      return res
        .status(500)
        .json(
          new ApiResponseDto<null>(500, false, null, 'Internal server error'),
        );
    }
  }

  @ApiOperation({ summary: 'Registro de novo usuário' })
  @ApiResponse({
    status: 201,
    description: 'Sign up',
    type: AccessTokenResponseDto,
  })
  @Public()
  @Post('signup')
  async signUp(@Res() res: Response, @Body() signupDto: SignUpAuthDto) {
    try {
      const accessToken = await this.authService.signUp(signupDto);
      if (!accessToken) {
        return res
          .status(400)
          .json(new ApiResponseDto(400, false, null, 'User already exists'));
      }
      return res.status(201).json(accessToken);
    } catch (err) {
      if (process.env.APP_ENV === 'development') {
        console.error(err);
      }
      return res
        .status(500)
        .json(
          new ApiResponseDto<null>(500, false, null, 'Internal server error'),
        );
    }
  }

  @ApiOperation({ summary: 'Solicitar magic login (apenas estudantes)' })
  @ApiResponse({
    status: 200,
    description: 'Magic link enviado por email',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example:
            'Link de acesso enviado para seu email. Verifique sua caixa de entrada.',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Magic Login disponível apenas para estudantes',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado no sistema',
    type: ApiResponseDto,
  })
  @Public()
  @Post('magic-login/request')
  async requestMagicLogin(
    @Res() res: Response,
    @Body() requestDto: MagicLoginRequestDto,
  ) {
    try {
      const result = await this.authService.requestMagicLogin(requestDto);
      return res.status(200).json(result);
    } catch (err) {
      if (process.env.APP_ENV === 'development') {
        console.error(err);
      }

      const status = err.status || 500;
      const message = err.message || 'Internal server error';

      return res
        .status(status)
        .json(new ApiResponseDto(status, false, null, message));
    }
  }

  @ApiOperation({ summary: 'Verificar token de magic login' })
  @ApiResponse({
    status: 200,
    description: 'Token válido - usuário autenticado',
    type: AccessTokenResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Token inválido ou expirado',
    type: ApiResponseDto,
  })
  @Public()
  @Post('magic-login/verify')
  async verifyMagicLogin(
    @Res() res: Response,
    @Body() verifyDto: MagicLoginVerifyDto,
  ) {
    try {
      const accessToken = await this.authService.verifyMagicLogin(verifyDto);
      return res.status(200).json(accessToken);
    } catch (err) {
      if (process.env.APP_ENV === 'development') {
        console.error(err);
      }

      const status = err.status || 500;
      const message = err.message || 'Internal server error';

      return res
        .status(status)
        .json(new ApiResponseDto(status, false, null, message));
    }
  }
}
