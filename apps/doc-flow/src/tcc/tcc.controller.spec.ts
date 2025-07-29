import { Test, TestingModule } from '@nestjs/testing';
import { TccController } from './tcc.controller';
import { TccService } from './tcc.service';

describe('TccController', () => {
  let controller: TccController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TccController],
      providers: [TccService],
    }).compile();

    controller = module.get<TccController>(TccController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
