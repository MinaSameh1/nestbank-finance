import { Param, ParseUUIDPipe } from '@nestjs/common';

export const IdParam = (name: string) => Param(name, new ParseUUIDPipe());
