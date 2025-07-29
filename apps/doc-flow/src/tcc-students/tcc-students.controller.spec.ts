import { Test, TestingModule } from '@nestjs/testing';
import { TccStudentsController } from './tcc-students.controller';
import { TccStudentsService } from './tcc-students.service';

describe('TccStudentsController', () => {
  let controller: TccStudentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TccStudentsController],
      providers: [TccStudentsService],
    }).compile();

    controller = module.get<TccStudentsController>(TccStudentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
