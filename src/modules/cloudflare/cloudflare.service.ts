import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { Env } from 'src/config/env-loader';
import { CreateDnsDto } from './dto/create-dns.dto';
const {
  CLOUDFLARE_URL,
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_EMAIL,
  CLOUDFLARE_API_KEY,
} = Env();

@Injectable()
export class CloudflareService {
  private readonly logger = new Logger(CloudflareService.name);
  constructor(private readonly httpService: HttpService) {}

  async addDomain(domain: string) {
    try {
      const response = await this.httpService.axiosRef.post(
        `${CLOUDFLARE_URL}/client/v4/zones`,
        {
          account: {
            id: CLOUDFLARE_ACCOUNT_ID,
          },
          name: domain,
          type: 'full',
        },
        {
          headers: {
            'X-Auth-Email': CLOUDFLARE_EMAIL,
            'X-Auth-Key': CLOUDFLARE_API_KEY,
          },
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error(error);
      throw new Error(error);
    }
  }

  async addDnsRecord(body: CreateDnsDto) {
    try {
      const response = await this.httpService.axiosRef.post(
        `${CLOUDFLARE_URL}/client/v4/zones/${body.zoneId}/dns_records`,
        {
          type: body.type,
          name: body.name,
          content: body.content,
          ttl: body.ttl,
          proxied: body.proxied,
          comment: body.comment,
        },
        {
          headers: {
            'X-Auth-Email': CLOUDFLARE_EMAIL,
            'X-Auth-Key': CLOUDFLARE_API_KEY,
          },
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error(error);
      throw new Error(error);
    }
  }

  async getZone(zoneId: string) {
    try {
      const response = await this.httpService.axiosRef.get(
        `${CLOUDFLARE_URL}/client/v4/zones/${zoneId}`,
        {
          headers: {
            'X-Auth-Email': CLOUDFLARE_EMAIL,
            'X-Auth-Key': CLOUDFLARE_API_KEY,
          },
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error(error);
      throw new Error(error);
    }
  }
}
