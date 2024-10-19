import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { ResponsePageDto } from 'src/common/dto/response-page.dto';
import { Client } from 'src/common/entities/client.entity';
import { ResponseDto } from 'src/common/dto/response.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Controller('clients')
export class ClientsController {

  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

  @Post('page')
  findAll(
    @Body() { page, size, orderBy, sort, filters }: { page: number, size: number,orderBy: string, sort: 'asc'|'desc', filters: Partial<Client> }): Promise<ResponsePageDto> {
    return this.clientsService.page(page, size, orderBy, sort.toUpperCase() as 'ASC' | 'DESC', filters);
  }

  @Post('byname')
    async searchByName(@Body('client') client: string): Promise<ResponseDto> {
        return this.clientsService.searchByName(client);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<ResponseDto> {
    return this.clientsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateUserDto: UpdateClientDto): Promise<ResponseDto> {
    return this.clientsService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<ResponseDto> {
    return this.clientsService.remove(id);
  }

}
