export interface GroupPage {
    id: number;
    group: string; // el nombre del grupo
    label: string;
    separator: boolean;
    items: Array<Item>;
  }
  

export interface Permissions {
    create: boolean;
    delete: boolean;
    update: boolean;
    read: boolean;
  }
  
  export interface Item {
    icon: string;
    label: string;
    route: string;
    footer: boolean;
    permissions: Permissions;
  }
  