import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { Role } from 'src/common/entities/role.entity';
import { RolePermission } from 'src/common/entities/permission.entity';
import { Resource } from 'src/common/entities/resource.entity';
import { ResourcesGroup } from 'src/common/entities/resources_group.entity';
import { ResourceRole } from 'src/common/entities/resource-role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Resource, ResourcesGroup, RolePermission, ResourceRole])],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [TypeOrmModule, RolesService],
})
export class RolesModule {}
