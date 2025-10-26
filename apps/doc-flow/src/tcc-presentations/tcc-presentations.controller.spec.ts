import { Test, TestingModule } from '@nestjs/testing';
import { TccPresentationsController } from './tcc-presentations.controller';
import { TccPresentationsService } from './tcc-presentations.service';

describe('TccPresentationsController', () => {
  let controller: TccPresentationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TccPresentationsController],
      providers: [TccPresentationsService],
    }).compile();

    controller = module.get<TccPresentationsController>(
      TccPresentationsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
