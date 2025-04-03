import { Module } from '@nestjs/common';
import { Client } from 'pg';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [
    {
      provide: 'PG_CONNECTION',
      useFactory: async () => {
        const host = process.env.POSTGRES_HOST;
        const portStr = process.env.POSTGRES_PORT;
        const user = process.env.POSTGRES_USER;
        const database = process.env.POSTGRES_DB;
        const password = process.env.POSTGRES_PASSWORD;

        if (!host || !portStr || !user || !password || !database) {
          throw new Error('Missing environment variables for Postgres configuration');
        }

        const port = parseInt(portStr, 10);

        console.log('🔍 [PG CONFIG]', { host, port, password, user, database });

        const client = new Client({
          host: host,
          port: port,
          user:user,
          password: password,
          database: database,
          ssl: false,
          connectionTimeoutMillis: 5000,
          keepAlive: true,
          connectionString: `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`,
          types: {
            getTypeParser: () => (val) => val
  }
        });

        client.on('error', (err) => {
          if (err.message.includes('SCRAM')) {
            console.log('🔒 Erro de handshake SCRAM:');
            console.log('1. Verifique a versão do OpenSSL no seu sistema');
            console.log('2. Atualize o Node.js para a versão LTS mais recente');
            console.log('3. Teste com clientes alternativos (psql, DBeaver)');
          }
        });

        await client.connect();
        console.log('✅ Conectado ao PostgreSQL com sucesso!');
        return client;
      },
    },
  ],
  exports: ['PG_CONNECTION'],
})
export class PostgresModule {}
