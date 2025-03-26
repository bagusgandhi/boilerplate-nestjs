import { Module } from '@nestjs/common';
import { CloudflareService } from './cloudflare.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [CloudflareService],
  exports: [CloudflareService],
})
export class CloudflareModule {}
