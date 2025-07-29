import { Test, TestingModule } from '@nestjs/testing';
import { TccStudentsService } from './tcc-students.service';

describe('TccStudentsService', () => {
  let service: TccStudentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TccStudentsService],
    }).compile();

    service = module.get<TccStudentsService>(TccStudentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
