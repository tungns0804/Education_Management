import { Controller, Get, Post, Put, Patch, Delete, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { SemestersService } from './semesters.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('api/semesters')
@UseGuards(JwtAuthGuard)
export class SemestersController {
  constructor(private readonly semestersService: SemestersService) {}

  @Get()
  findAll() {
    return this.semestersService.findAll();
  }

  @Get('active')
  findActive() {
    return this.semestersService.findActive();
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  create(@Body('name') name: string) {
    return this.semestersService.create(name);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: { name?: string; isActive?: boolean }) {
    return this.semestersService.update(id, body);
  }

  @Patch(':id/toggle-active')
  @UseGuards(RolesGuard)
  @Roles('admin')
  toggleActive(@Param('id', ParseIntPipe) id: number) {
    return this.semestersService.toggleActive(id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.semestersService.remove(id);
  }
}
