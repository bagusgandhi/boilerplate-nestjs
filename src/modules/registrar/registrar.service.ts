import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Env } from 'src/config/env-loader';
import { RegisterDomainDto } from './dto/register-domain.dto';
const { REGISTRAR_TOKEN, REGISTRAR_URL } = Env();
import { UpdateNsDto } from './dto/update-ns.dto';
@Injectable()
export class RegistrarService {
  constructor(private readonly httpService: HttpService) {}

  async checkDomainAvailability(domain: string) {
    try {
      const response = await this.httpService.axiosRef.get(
        `${REGISTRAR_URL}/domains/availability?domain=${domain}`,
        {
          headers: {
            Authorization: `Basic ${REGISTRAR_TOKEN}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to get domain availability');
    }
  }

  async searchDomain(domain: string) {
    try {
      // if domain has dot remove it
      const domainName = domain.replace(/\./g, '');
      const extensions = ['.com'];
      const promised = extensions.map((extension) =>
        this.checkDomainAvailability(`${domainName}${extension}`),
      );
      const results = await Promise.all(promised);

      console.info(results);
      return results.filter((result) => result.available);
    } catch (error) {
      console.error(error);
      throw new Error('Failed to search domain');
    }
  }

  async registerDomain(body: RegisterDomainDto) {
    try {
      const response = await this.httpService.axiosRef.post(
        `${REGISTRAR_URL}/domains`,
        {
          name: body.name,
          period: body.period,
          buy_whois_protection: body.buy_whois_protection,
          include_premium_domains: body.include_premium_domains,
          customer_id: body.customer_id,
        },
        {
          headers: {
            Authorization: `Basic ${REGISTRAR_TOKEN}`,
            Accept: 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to register domain');
    }
  }

  async updateNS(customer_id: number, domain_id: string, body: UpdateNsDto) {
    try {
      const params = new URLSearchParams();
      params.append('customer_id', customer_id.toString());
      params.append('nameserver[0]', body?.nameservers[0]);
      params.append('nameserver[1]', body?.nameservers[1]);

      // Optional fields (only append if provided)
      if (body?.nameservers[2])
        params.append('nameserver[2]', body?.nameservers[2]);
      if (body?.nameservers[3])
        params.append('nameserver[3]', body?.nameservers[3]);
      if (body?.nameservers[5])
        params.append('nameserver[5]', body?.nameservers[5]);

      const response = await this.httpService.axiosRef.post(
        `${REGISTRAR_URL}/domains/${domain_id}/ns`,
        params.toString(),
        {
          headers: {
            Authorization: `Basic ${REGISTRAR_TOKEN}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to update NS');
    }
  }
}
