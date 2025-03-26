import { Module } from '@nestjs/common';
import { RegistrarService } from './registrar.service';
import { HttpModule } from '@nestjs/axios';
@Module({
  imports: [HttpModule],
  providers: [RegistrarService],
  exports: [RegistrarService],
})
export class RegistrarModule {}
