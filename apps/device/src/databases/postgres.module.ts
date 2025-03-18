// apps/device/src/database/postgres.module.ts

import { Module } from '@nestjs/common';
import { Client } from 'pg';
import { ConfigService } from '@nestjs/config';


@Module({
    providers: [
      {
        provide: 'PG_CONNECTION',
        useFactory: async (configService: ConfigService) => {
            const client = new Client({
              host: configService.get<string>('POSTGRES_HOST'),
              port: configService.get<number>('POSTGRES_PORT'),
              user: configService.get<string>('POSTGRES_USER'),
              password: configService.get<string>('POSTGRES_PASSWORD'),
              database: configService.get<string>('POSTGRES_DB'),
            });
  
          await client.connect();
          return client;
        },
      },
    ],
    exports: ['PG_CONNECTION'],
  })
  export class PostgresModule{

  }
