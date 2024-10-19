import { Module } from '@nestjs/common';
import { ResourcesRoleService } from './resources_role.service';
import { ResourcesRoleController } from './resources_role.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourceRole } from 'src/common/entities/resource-role.entity';
import { RolesModule } from '../roles/roles.module';
import { ResourcesModule } from '../resources/resources.module';
import { Resource } from 'src/common/entities/resource.entity';
import { ResourcesGroup } from 'src/common/entities/resources_group.entity';
import { Role } from 'src/common/entities/role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ResourceRole, Role, Resource, ResourcesGroup]),
    RolesModule,
    ResourcesModule,
    ],
  controllers: [ResourcesRoleController],
  providers: [ResourcesRoleService],
})
export class ResourcesRoleModule {}
