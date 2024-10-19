export class CreateUserDto {
    name: string;
    username: string; 
    password: string; 
    email: string; 
    roleId: number;
    reset: boolean;
    passwordTemp: boolean;
    view_own_data: boolean;
}
