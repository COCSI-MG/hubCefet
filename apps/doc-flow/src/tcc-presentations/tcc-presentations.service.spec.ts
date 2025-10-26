import { Test, TestingModule } from '@nestjs/testing';
import { TccPresentationsService } from './tcc-presentations.service';

describe('TccPresentationsService', () => {
  let service: TccPresentationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TccPresentationsService],
    }).compile();

    service = module.get<TccPresentationsService>(TccPresentationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
