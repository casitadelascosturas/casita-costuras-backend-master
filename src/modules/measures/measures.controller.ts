import { Controller, Get, Post, Body, Param, Delete, Put, UploadedFiles, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { MeasuresService } from './measures.service';
import { Measure } from 'src/common/entities/measure.entity';
import { ResponsePageDto } from 'src/common/dto/response-page.dto';
import { ResponseDto } from 'src/common/dto/response.dto';
import { UpdateMeasureDto } from './dto/update-measure.dto';
import { CreateMeasureDto } from './dto/create-measure.dto';

@Controller('measures')
export class MeasuresController {

  constructor(private readonly measuresService: MeasuresService) {}


  @Get('all')
    all() {
      return this.measuresService.all();
    }

  @Post()
    @UseInterceptors(FileInterceptor('image'))
    create(
      @Body() createMeasureDto: CreateMeasureDto,
      @UploadedFile() image: Express.Multer.File) {
        return this.measuresService.create(createMeasureDto, image);
    }


  @Post('page')
    findAll(
      @Body() { page, size, orderBy, sort, filters }: 
      { page: number, size: number,orderBy: string, sort: 'asc'|'desc', filters: Partial<Measure> }): Promise<ResponsePageDto> {
      return this.measuresService.page(page, size, orderBy, sort.toUpperCase() as 'ASC' | 'DESC', filters);
    }

  @Get(':id')
    findOne(@Param('id') id: number): Promise<ResponseDto> {
      return this.measuresService.findOne(id);
    }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Body() updateUserDto: UpdateMeasureDto,
    @Param('id') id: number, 
    @UploadedFile() image: Express.Multer.File): Promise<ResponseDto> {
    return this.measuresService.update(id, updateUserDto, image);
  }

  @Delete(':id')
    remove(@Param('id') id: number): Promise<ResponseDto> {
      return this.measuresService.remove(id);
    }
}
