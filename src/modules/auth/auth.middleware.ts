import {
  BadRequestException,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { SelectionNode, parse, visit } from 'graphql';
import { AuthService } from '../auth/auth.service';
import { ContextCustomRequestType } from 'src/common/graphql/context/ContextRequestType';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  private supportMethods: string[] = ['__schema'];

  async use(req: ContextCustomRequestType, res: Response, next: NextFunction) {
    if (req.body?.query) {
      const ast = parse(req.body.query);

      let methodName: string | undefined;

      visit(ast, {
        OperationDefinition(node) {
          methodName = (
            node.selectionSet.selections[0] as SelectionNode & {
              name: { value: string };
            }
          ).name.value;
        },
      });

      if (!methodName) {
        throw new BadRequestException();
      }

      if (this.supportMethods.includes(methodName)) {
        return next();
      }

      const query = req.headers['key-token']?.toString();

      req.user = await this.authService.validateUserHash(query);

      return next();
    }

    return next();
  }
}
