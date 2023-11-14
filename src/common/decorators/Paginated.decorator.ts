import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Paginate = createParamDecorator(
  (_options, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const gotPage = parseInt(request.query?.page);
    const page = isNaN(gotPage) || gotPage < 1 ? 0 : gotPage - 1;
    const gotLimit = parseInt(request.query?.limit);
    const limit = isNaN(gotLimit) || gotLimit < 1 ? 10 : gotLimit;
    const skip = page * limit;
    return {
      page,
      skip,
      limit,
    };
  },
);
