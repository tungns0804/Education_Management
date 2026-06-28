import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('api/branches')
@UseGuards(JwtAuthGuard)
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  async findAll(@Query('departmentId') departmentId?: string) {
    const data = await this.branchesService.findAll(departmentId);
    return { success: true, message: 'success', metadata: data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.branchesService.findOne(id);
    return { success: true, message: 'success', metadata: data };
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async create(@Body() body: { code: string; nameBranch: string; departmentId: string }) {
    const data = await this.branchesService.create(body);
    return { success: true, message: 'Tạo ngành thành công', metadata: data };
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async update(@Param('id') id: string, @Body() body: any) {
    const data = await this.branchesService.update(id, body);
    return { success: true, message: 'Cập nhật thành công', metadata: data };
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    const data = await this.branchesService.remove(id);
    return { success: true, message: 'Xóa thành công', metadata: data };
  }
}
