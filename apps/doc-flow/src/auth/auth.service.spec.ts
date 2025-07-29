import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { SignInAuthDto } from './dto/signin-auth.dto';
import { SignUpAuthDto } from './dto/singup-auth.dto';
import { User } from 'src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { ServiceLayerDto } from 'src/lib/dto/service-layer.dto';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  const userData: User = {
    id: 'eeb1b3b0-0b1b-4b3b-8b3b-0b1b3b0b3b0b',
    email: 'email@cefet-rj.br',
    password: 'hashedPassword',
    full_name: 'Name Example',
    profile: {
      id: 'eeb1b3b0-0b1b-4b3b-8b3b-0b1b3b0b3b0b',
      name: 'user',
    },
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(() => Promise.resolve(userData)),
            create: jest.fn(() => Promise.resolve(userData)),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(() => Promise.resolve('token')),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    it('should return access token if credentials are valid', async () => {
      const signInDto: SignInAuthDto = { email: 'test', password: 'test' };

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(userData);

      const result = await service.signIn(signInDto);
      expect(result).toEqual({ access_token: 'token' });
    });

    it('should return null if credentials are invalid', async () => {
      const signInDto: SignInAuthDto = { email: 'test', password: 'test' };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(userData);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.signIn(signInDto);
      expect(result).toBeNull();
    });
  });

  describe('signUp', () => {
    it('should throw an error if user already exists', async () => {
      const signUpDto: SignUpAuthDto = {
        email: 'test',
        password: 'test',
        profileId: 'eeb1b3b0-0b1b-4b3b-8b3b-0b1b3b0b3b0b',
        fullName: 'test',
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(userData);

      await expect(service.signUp(signUpDto)).rejects.toThrow(
        'User already exists',
      );
    });

    it('should return access token if user is created successfully', async () => {
      const signUpDto: SignUpAuthDto = {
        email: 'test',
        password: 'test',
        profileId: 'eeb1b3b0-0b1b-4b3b-8b3b-0b1b3b0b3b0b',
        fullName: 'test',
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      jest
        .spyOn(usersService, 'create')
        .mockResolvedValue(new ServiceLayerDto({ user: userData }, true));

      const result = await service.signUp(signUpDto);
      expect(result).toEqual({ access_token: 'token' });
    });
  });
});
