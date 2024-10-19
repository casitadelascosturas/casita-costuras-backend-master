import { Test, TestingModule } from '@nestjs/testing';
import { ResourcesRoleService } from './resources_role.service';

describe('ResourcesRoleService', () => {
  let service: ResourcesRoleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResourcesRoleService],
    }).compile();

    service = module.get<ResourcesRoleService>(ResourcesRoleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
