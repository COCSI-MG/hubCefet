import { Test, TestingModule } from '@nestjs/testing';
import { TccService } from './tcc.service';

describe('TccService', () => {
  let service: TccService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TccService],
    }).compile();

    service = module.get<TccService>(TccService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
