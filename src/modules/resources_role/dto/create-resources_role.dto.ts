import { IsNumber } from 'class-validator';

export class CreateResourcesRoleDto {
  @IsNumber()
  readonly roleId: number;  // ID del rol

  @IsNumber()
  readonly resourcesGroupId: number;  // ID del grupo de recursos
}
