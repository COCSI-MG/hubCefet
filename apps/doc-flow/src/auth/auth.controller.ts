import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInAuthDto } from './dto/signin-auth.dto';
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
  constructor(private readonly authService: AuthService) { }

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
  async signIn(@Body() signinDto: SignInAuthDto) {
    const accessToken = await this.authService.signIn(signinDto);

    return accessToken;
  }

  @ApiOperation({ summary: 'Registro de novo usuário' })
  @ApiResponse({
    status: 201,
    description: 'Sign up',
    type: AccessTokenResponseDto,
  })
  @Public()
  @Post('signup')
  async signUp(@Body() signupDto: SignUpAuthDto) {
    const accessToken = await this.authService.signUp(signupDto);

    return accessToken;
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
    @Body() requestDto: MagicLoginRequestDto,
  ) {
    return await this.authService.requestMagicLogin(requestDto);
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
    @Body() verifyDto: MagicLoginVerifyDto,
  ) {
    const accessToken = await this.authService.verifyMagicLogin(verifyDto);

    return accessToken
  }
}
