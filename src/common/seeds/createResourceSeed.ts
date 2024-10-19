import { Seeder } from "typeorm-extension";
import { Resource } from "../entities/resource.entity";
import { ResourcesGroup } from "../entities/resources_group.entity";
import { DataSource, In } from "typeorm"; // Asegúrate de importar In
import { RolePermission } from "../entities/permission.entity";
import { ResourceRole } from "../entities/resource-role.entity";
import { Role } from "../entities/role.entity";
import { User } from "../entities/user.entity";

export default class CreateResourceSeed implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const resourceRepository = dataSource.getRepository(Resource);
    const resourcesGroupRepository = dataSource.getRepository(ResourcesGroup);
    const roleRepository = dataSource.getRepository(Role);
    const userRepository = dataSource.getRepository(User);
    const rolePermissionRepository = dataSource.getRepository(RolePermission);
    const resourceRoleRepository = dataSource.getRepository(ResourceRole);

    // Crear los recursos
    const resources = [
      { id: 1, icon: 'group', label: 'Usuarios', path: 'usuarios', footer: false },
      { id: 2, icon: 'pending_actions', label: 'Pedidos', path: 'pedidos', footer: true },
      { id: 3, icon: 'groups', label: 'Clientes', path: 'clientes', footer: false },
      { id: 4, icon: 'notifications', label: 'Notificaciones', path: 'notificaciones', footer: false },
      { id: 5, icon: 'point_of_sale', label: 'Ventas', path: 'ventas', footer: false },
      { id: 6, icon: 'query_stats', label: 'KPI', path: 'kpi', footer: false },
      { id: 7, icon: 'inventory_2', label: 'Productos', path: 'productos', footer: false },
      { id: 8, icon: 'design_services', label: 'Servicios', path: 'servicios', footer: false },
      { id: 9, icon: 'straighten', label: 'Detalles de servicios', path: 'detalles-servicios', footer: false },
      { id: 10, icon: 'checklist_rtl', label: 'Reportes y recibos', path: 'reportes', footer: true },
      { id: 11, icon: 'local_mall', label: 'Reservas', path: 'reservas', footer: false },
      { id: 12, icon: 'sell', label: 'Ofertas', path: 'ofertas', footer: false },
      { id: 13, icon: 'task_alt', label: 'Tareas', path: 'tareas', footer: true },
      { id: 14, icon: 'settings', label: 'Ajustes', path: 'ajustes', footer: false },
    ];

    const savedResources = await resourceRepository.save(resources);
    console.log('Resources have been seeded.');

    // Crear los grupos de recursos (modificar Configuraciones a ID 99)
    const groups = [
      { id: 1,  label: 'Gestión General', name: 'general-management', separator: true },
      { id: 2,  label: 'Notificaciones y Reportes', name: 'notifications-reports', separator: true },
      { id: 99, label: 'Configuraciones', name: 'settings', separator: true },
      { id: 4,  label: 'Producción general', name: 'employee-pending', separator: true },
      { id: 5,  label: 'Reportes Operativos', name: 'employee-reports', separator: true },
      { id: 6,  label: 'Recepción y ventas', name: 'reception-sales', separator: true },
    ];

    const savedGroups = await resourcesGroupRepository.save(groups);
    console.log('Resource Groups have been seeded.');

    // Asociar resources con grupos específicos (modificar el grupo con ID 99)
    const groupAssignments = [
      { groupId: 1, resourceIds: [1, 2, 3, 5, 7, 8, 9, 11, 12, 13] },
      { groupId: 2, resourceIds: [4, 6, 10] },
      { groupId: 99, resourceIds: [14] },
      { groupId: 4, resourceIds: [13] },
      { groupId: 5, resourceIds: [10] },
      { groupId: 6, resourceIds: [2, 3, 7, 8, 10, 11, 12] },
    ];

    for (const assignment of groupAssignments) {
      const group = savedGroups.find(g => g.id === assignment.groupId);
      if (group) {
        group.resources = savedResources.filter(r => assignment.resourceIds.includes(r.id));
        await resourcesGroupRepository.save(group);
        console.log(`Resources have been associated with ${group.label}.`);
      }
    }

    // Crear los roles
    const adminRole = roleRepository.create({ id: 1, name: 'Administrador', description: 'Rol con todos los permisos' });
    const savedAdminRole = await roleRepository.save(adminRole);

    const operarioRole = roleRepository.create({ id: 2, name: 'Operario', description: 'Visualizar tareas relacionadas a costuras' });
    const savedOperarioRole = await roleRepository.save(operarioRole);

    const receptionSalesRole = roleRepository.create({ id: 3, name: 'Recepción y ventas', description: 'Encargado de recibir costuras y ventas' });
    const savedReceptionSalesRole = await roleRepository.save(receptionSalesRole);

    console.log('Roles have been created.');

    // Asignar permisos a los grupos asignados a cada rol (modificar para usar ID 99)
    await this.assignPermissionsToRole(savedAdminRole, [1, 2, 99], resourcesGroupRepository, rolePermissionRepository); // ID 99 en lugar de 3
    await this.assignPermissionsToRole(savedOperarioRole, [4, 5, 99], resourcesGroupRepository, rolePermissionRepository); // ID 99 en lugar de 3
    await this.assignPermissionsToRole(savedReceptionSalesRole, [6,99], resourcesGroupRepository, rolePermissionRepository); // ID 99 en lugar de 3

    // Asociar roles con sus grupos específicos, evitando duplicados (modificar para usar ID 99)
    await this.assignGroupsToRole(savedAdminRole, [1, 2, 99], savedGroups, resourceRoleRepository); // ID 99 en lugar de 3
    await this.assignGroupsToRole(savedOperarioRole, [4, 5, 99], savedGroups, resourceRoleRepository); // ID 99 en lugar de 3
    await this.assignGroupsToRole(savedReceptionSalesRole, [6, 99], savedGroups, resourceRoleRepository); // ID 99 en lugar de 3

    console.log('Resource groups have been associated with the roles.');

    // Crear usuarios con sus roles correspondientes
    const adminUser = userRepository.create({
      id: 1,
      name: 'Claudia Xoyon',
      username: 'admin',
      password: '$2b$10$mRsak/SmBXNgDVCz4KMfk.QUwu82QizoKGQGjSEuW5gZYSTGXDzZ.',
      email: 'claudiapatricia@gmail.com',
      verifyEmail: true,
      reset: false,
      passwordTemp: false,
      role: savedAdminRole,
    });
    await userRepository.save(adminUser);
    console.log('Admin user has been created.');

    const operativeUser = userRepository.create({
      id: 2,
      name: 'Alberto hernandez',
      username: 'eleljose',
      password: '$2b$10$mRsak/SmBXNgDVCz4KMfk.QUwu82QizoKGQGjSEuW5gZYSTGXDzZ.',
      email: 'eleljose88@gmail.com',
      verifyEmail: true,
      reset: false,
      passwordTemp: false,
      role: savedOperarioRole,
    });
    await userRepository.save(operativeUser);
    console.log('Operative user has been created.');

    const salesUser = userRepository.create({
      id: 3,
      name: 'aide',
      username: 'aide',
      password: '$2b$10$mRsak/SmBXNgDVCz4KMfk.QUwu82QizoKGQGjSEuW5gZYSTGXDzZ.',
      email: 'elizabethernandez2011@gmail.com',
      verifyEmail: true,
      reset: false,
      passwordTemp: false,
      role: savedReceptionSalesRole,
    });
    await userRepository.save(salesUser);
    console.log('Sales user has been created.');
  }

  // Función para asignar permisos a un rol
  async assignPermissionsToRole(role, groupIds, resourcesGroupRepository, rolePermissionRepository) {
    const groupsWithResources = await resourcesGroupRepository.find({
      where: { id: In(groupIds) },
      relations: ['resources']
    });

    if (!groupsWithResources || groupsWithResources.length === 0) {
      console.log(`No se encontraron grupos con recursos para los IDs: ${groupIds}`);
      return;
    }

    const rolePermissions = [];

    groupsWithResources.forEach(group => {
      group.resources.forEach(resource => {
        rolePermissions.push({
          role,
          resource,
          canRead: true,
          canCreate: true, 
          canUpdate: true,
          canDelete: true,
        });
      });
    });

    if (rolePermissions.length > 0) {
      await rolePermissionRepository.save(rolePermissions);
      console.log(`Permisos asignados al rol ${role.name} para los recursos en los grupos ${groupIds}`);
    } else {
      console.log(`No se encontraron recursos para los grupos ${groupIds}`);
    }
  }

  // Evitar duplicados al asignar grupos a roles
  async assignGroupsToRole(role, groupIds, groups, resourceRoleRepository) {
    for (const groupId of groupIds) {
      const existingRoleGroup = await resourceRoleRepository.findOne({
        where: { role: { id: role.id }, resourcesGroup: { id: groupId } },
      });
      if (!existingRoleGroup) {
        const group = groups.find(g => g.id === groupId);
        const resourceRole = resourceRoleRepository.create({
          role,
          resourcesGroup: group,
        });
        await resourceRoleRepository.save(resourceRole);
      }
    }
  }
}
