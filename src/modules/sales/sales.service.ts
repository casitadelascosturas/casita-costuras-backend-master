import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from 'src/common/entities/sales.entity';
import { Injectable } from '@nestjs/common';
import { ResponseDto } from 'src/common/dto/response.dto';
import { HttpCode } from 'src/common/enums/HttpCode.enum';
import { HttpMessage } from 'src/common/enums/HttpMessage.enum';

@Injectable()
export class SalesService {
    constructor(
        @InjectRepository(Sale)
        private readonly salesRepository: Repository<Sale>) {}
    
    async getTopProducts(filters: { month?: number, quarter?: number, year?: number, startDate?: string, endDate?: string }): Promise<ResponseDto> {
        const query = this.salesRepository.createQueryBuilder('sale')
          .leftJoinAndSelect('sale.product', 'product')
          .select('product.name', 'productName')
          .addSelect('SUM(sale.quantity)', 'totalQuantity')
          .where('sale.product IS NOT NULL')
          .groupBy('product.name')
          .orderBy('totalQuantity', 'DESC')
          .limit(10); 
    
        // Aplicar filtros
        if (filters.year) {
          query.andWhere('YEAR(sale.sale_date) = :year', { year: filters.year });
        }
        if (filters.month) {
          query.andWhere('MONTH(sale.sale_date) = :month', { month: filters.month });
        }
        if (filters.quarter) {
          query.andWhere('QUARTER(sale.sale_date) = :quarter', { quarter: filters.quarter });
        }
        if (filters.startDate && filters.endDate) {
          query.andWhere('sale.sale_date BETWEEN :startDate AND :endDate', {
            startDate: filters.startDate,
            endDate: filters.endDate,
          });
        }
    
        const data = await query.getRawMany();
        return {
            code: HttpCode.OK,
            message: HttpMessage.OK,
            data: data
        }
    }

    async getTopServices(filters: { month?: number, quarter?: number, year?: number, startDate?: string, endDate?: string }): Promise<ResponseDto> {
        const query = this.salesRepository.createQueryBuilder('sale')
          .leftJoinAndSelect('sale.service', 'service')
          .select('service.name', 'serviceName')
          .addSelect('COUNT(sale.id)', 'totalServices')
          .where('sale.service IS NOT NULL')
          .groupBy('service.name')
          .orderBy('totalServices', 'DESC')
          .limit(10); 
    
        // Aplicar filtros
        if (filters.year) {
          query.andWhere('YEAR(sale.sale_date) = :year', { year: filters.year });
        }
        if (filters.month) {
          query.andWhere('MONTH(sale.sale_date) = :month', { month: filters.month });
        }
        if (filters.quarter) {
          query.andWhere('QUARTER(sale.sale_date) = :quarter', { quarter: filters.quarter });
        }
        if (filters.startDate && filters.endDate) {
          query.andWhere('sale.sale_date BETWEEN :startDate AND :endDate', {
            startDate: filters.startDate,
            endDate: filters.endDate,
          });
        }
    
        const data = await query.getRawMany();
        return {
            code: HttpCode.OK,
            message: HttpMessage.OK,
            data: data
        };
    }

    async getQuarterlySales(year?: number): Promise<ResponseDto> {
        const currentYear = year || new Date().getFullYear(); // Usar el año actual si no se proporciona
        
        // Consulta para agrupar por trimestre y mes
        const query = this.salesRepository.createQueryBuilder('sale')
          .select('QUARTER(sale.sale_date)', 'quarter') // Agrupar por trimestre
          .addSelect('MONTH(sale.sale_date)', 'month') // Agrupar también por mes
          .addSelect('SUM(sale.total_amount)', 'totalSales') // Sumar el total de ventas
          .where('YEAR(sale.sale_date) = :year', { year: currentYear }) // Filtrar por el año
          .groupBy('quarter, month') // Agrupar por trimestre y mes
          .orderBy('quarter', 'ASC') // Ordenar por trimestre
          .addOrderBy('month', 'ASC'); // Ordenar también por mes
    
        const rawData = await query.getRawMany();
    
        // Definir los trimestres con los meses en español
        const allQuarters = [
          { quarter: 'ENE-MAR', months: [{ month: 'Enero', totalSales: 0 }, { month: 'Febrero', totalSales: 0 }, { month: 'Marzo', totalSales: 0 }] },
          { quarter: 'ABR-JUN', months: [{ month: 'Abril', totalSales: 0 }, { month: 'Mayo', totalSales: 0 }, { month: 'Junio', totalSales: 0 }] },
          { quarter: 'JUL-SEP', months: [{ month: 'Julio', totalSales: 0 }, { month: 'Agosto', totalSales: 0 }, { month: 'Septiembre', totalSales: 0 }] },
          { quarter: 'OCT-DIC', months: [{ month: 'Octubre', totalSales: 0 }, { month: 'Noviembre', totalSales: 0 }, { month: 'Diciembre', totalSales: 0 }] },
        ];
    
        // Asignar las ventas a los meses y trimestres correspondientes
        rawData.forEach(item => {
          const quarterIndex = parseInt(item.quarter, 10) - 1;  // Obtener el índice del trimestre (0-3)
          const monthIndex = parseInt(item.month, 10) - 1; // Mes (1-12)
    
          if (quarterIndex >= 0 && quarterIndex <= 3) {
            // Encontrar el mes en el trimestre correspondiente
            const monthsInQuarter = allQuarters[quarterIndex].months;
            const monthName = this.getMonthName(monthIndex);
    
            // Buscar y actualizar el mes dentro del trimestre
            const monthData = monthsInQuarter.find(m => m.month === monthName);
            if (monthData) {
              monthData.totalSales = Number(item.totalSales);
            }
          }
        });
    
        return {
          code: HttpCode.OK,
          message: HttpMessage.OK,
          data: allQuarters,
        };
    }
    
    private getMonthName(monthIndex: number): string {
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return monthNames[monthIndex];
    }

    async getMonthlySales(filters: { year?: number, month?: number }): Promise<ResponseDto> {
        const currentYear = filters.year || new Date().getFullYear();  // Si no se pasa año, usar el actual
        const currentMonth = filters.month || new Date().getMonth() + 1; // Si no se pasa mes, usar el actual (0-based index)
        
        // Verificar si estamos en el mes y año actuales
        const today = new Date();
        const isCurrentMonth = currentYear === today.getFullYear() && currentMonth === today.getMonth() + 1;
    
        // Obtener el límite de días según si es el mes actual o un mes anterior
        const daysInMonth = isCurrentMonth ? today.getDate() : new Date(currentYear, currentMonth, 0).getDate();
    
        // Consulta para obtener las ventas agrupadas por día
        const query = this.salesRepository.createQueryBuilder('sale')
          .select('DAY(sale.sale_date)', 'day')  // Agrupar por día del mes
          .addSelect('SUM(sale.total_amount)', 'totalSales')  // Sumar total de ventas del día
          .where('YEAR(sale.sale_date) = :year', { year: currentYear })  // Filtrar por año
          .andWhere('MONTH(sale.sale_date) = :month', { month: currentMonth })  // Filtrar por mes
          .groupBy('day')  // Agrupar por día
          .orderBy('day', 'ASC');  // Ordenar por día
        
        const rawData = await query.getRawMany();
    
        // Crear un arreglo con todos los días del mes hasta el límite definido (actual o completo)
        const result = [];
        for (let day = 1; day <= daysInMonth; day++) {
          result.push({
            day: `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`,  // Formato YYYY-MM-DD
            totalSales: 0
          });
        }
    
        // Llenar los días con las ventas reales de los datos obtenidos
        rawData.forEach(item => {
          const dayIndex = parseInt(item.day, 10) - 1;  // Convertir día a índice (0-based)
          if (dayIndex >= 0 && dayIndex < daysInMonth) {
            result[dayIndex].totalSales = Number(item.totalSales);  // Actualizar con el total de ventas del día
          }
        });
    
        return {
          code: HttpCode.OK,
          message: HttpMessage.OK,
          data: result,
        };
    }
}
