import { Controller, Get, Post, Body, Param, Delete, Put, UploadedFiles, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Measure } from 'src/common/entities/measure.entity';
import { ResponsePageDto } from 'src/common/dto/response-page.dto';
import { ResponseDto } from 'src/common/dto/response.dto';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from 'src/common/entities/product.entity';


@Controller('products')
export class ProductsController {

  constructor(private readonly productsService: ProductsService) {}

  @Get('all')
    all() {
      return this.productsService.all();
    }

  @Post()
    @UseInterceptors(FileInterceptor('image'))
    create(
      @Body() createProductDto: CreateProductDto,
      @UploadedFile() image: Express.Multer.File) {
        const stringValue: string = String(createProductDto.status);

        return this.productsService.create({
          name: createProductDto.name, 
          price_sale_min: createProductDto.price_sale_min, 
          price_sale_max: createProductDto.price_sale_max,
          description: createProductDto.description, status: stringValue === 'true' ? true : false }, image);
    }


  @Post('page')
    findAll(
      @Body() { page, size, orderBy, sort, filters }: 
      { page: number, size: number,orderBy: string, sort: 'asc'|'desc', filters: Partial<Product> }): Promise<ResponsePageDto> {
      return this.productsService.page(page, size, orderBy, sort.toUpperCase() as 'ASC' | 'DESC', filters);
    }

  @Get(':id')
    findOne(@Param('id') id: number): Promise<ResponseDto> {
      return this.productsService.findOne(id);
    }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Body() updateProductDto: UpdateProductDto,
    @Param('id') id: number, 
    @UploadedFile() image: Express.Multer.File): Promise<ResponseDto> {
      const stringValue: string = String(updateProductDto.status);

    return this.productsService.update(id, {
      name: updateProductDto.name, 
      description: updateProductDto.description, 
      price_sale_min: updateProductDto.price_sale_min, 
      price_sale_max: updateProductDto.price_sale_max, 
      status: stringValue === 'true' ? true : false }, image);
  }

  @Delete(':id')
    remove(@Param('id') id: number): Promise<ResponseDto> {
      return this.productsService.remove(id);
    }
}
