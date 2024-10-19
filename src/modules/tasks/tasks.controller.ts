import { Body, Controller, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ResponsePageDto } from 'src/common/dto/response-page.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ResponseDto } from 'src/common/dto/response.dto';
import { TasksEntity } from 'src/common/entities/tasks.entity';

@Controller('tasks')
export class TasksController {

  constructor(private readonly tasksService: TasksService) {}

  @Post('page')
    findAll(
      @Body() { page, size, orderBy, sort, filters }: 
      { page: number, size: number,orderBy: string, sort: 'asc'|'desc', filters: Partial<TasksEntity> }): Promise<ResponsePageDto> {
      return this.tasksService.page(page, size, orderBy, sort.toUpperCase() as 'ASC' | 'DESC', filters);
  }

  @Get(':id')
  async getTaskById(@Param('id') id: number): Promise<ResponseDto> {
    return this.tasksService.getTaskById(id);
  }

  @Put(':id')
  async updateTask(@Param('id') id: number, @Body() updateTaskDto: UpdateTaskDto): Promise<ResponseDto> {
    return this.tasksService.updateTask(id, updateTaskDto);
  }

}
