import { Query, Resolver } from '@nestjs/graphql';
import { GatewayService } from '../gateway.service';
import { ActiveClientsDto } from './dto/ActiveClients.dto';

@Resolver()
export class GatewayResolver {
  constructor(private readonly gatewayService: GatewayService) {}

  @Query(() => ActiveClientsDto)
  getActiveClients(): ActiveClientsDto {
    return {
      activeCliets: this.gatewayService.activeClients.length,
    };
  }
}
