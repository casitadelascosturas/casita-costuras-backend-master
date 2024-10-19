import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseDto } from 'src/common/dto/response.dto';
import { User } from 'src/common/entities/user.entity';
import { ResponsePageDto } from 'src/common/dto/response-page.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  
  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<ResponseDto> {
    return this.usersService.create(createUserDto);
  }

  @Get('all')
  all(): Promise<ResponseDto> {
    return this.usersService.all();
  }

  @Post('page')
  findAll(@Body() { page, size, orderBy, sort, filters }: { page: number, size: number,orderBy: string, sort: 'asc'|'desc', filters: Partial<User> }): Promise<ResponsePageDto> {
    return this.usersService.findAll(page, size, orderBy, sort.toUpperCase() as 'ASC' | 'DESC', filters);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<ResponseDto> {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto): Promise<ResponseDto> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<ResponseDto> {
    return this.usersService.delete(id);
  }

  @Post('verify-email')
  verifyEmail(@Body('email') email: string): Promise<ResponseDto> {
    return this.usersService.verifyUserEmail(email);
  }
}
