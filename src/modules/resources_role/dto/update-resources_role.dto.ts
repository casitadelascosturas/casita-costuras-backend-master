import { PartialType } from '@nestjs/mapped-types';
import { CreateResourcesRoleDto } from './create-resources_role.dto';

export class UpdateResourcesRoleDto extends PartialType(CreateResourcesRoleDto) {}
