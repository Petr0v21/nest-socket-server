import { Module } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { AuthModule } from '../auth/auth.module';
import { GatewayResolver } from './graphql/gateway.resolver';

@Module({
  imports: [AuthModule],
  providers: [GatewayService, GatewayResolver],
  exports: [GatewayService],
})
export class GatewayModule {}
