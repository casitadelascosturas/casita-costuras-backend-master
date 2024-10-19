import { Test, TestingModule } from '@nestjs/testing';
import { ResourcesRoleController } from './resources_role.controller';
import { ResourcesRoleService } from './resources_role.service';

describe('ResourcesRoleController', () => {
  let controller: ResourcesRoleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResourcesRoleController],
      providers: [ResourcesRoleService],
    }).compile();

    controller = module.get<ResourcesRoleController>(ResourcesRoleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
