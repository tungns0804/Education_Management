import { Module } from '@nestjs/common';
import { SubjectClassesController } from './subject-classes.controller';
import { SubjectClassesService } from './subject-classes.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [SubjectClassesController],
  providers: [SubjectClassesService],
  exports: [SubjectClassesService],
})
export class SubjectClassesModule {}
