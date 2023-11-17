import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

@Controller('server')
@ApiTags('server')
export class ServerController {
  @ApiOperation({ summary: 'Health check', description: 'Health check' })
  @Get('ping')
  health() {
    return 'pong'
  }

  @ApiOperation({
    summary: 'Root, returns 204',
    description: 'Root, mostly used so if it gets pinged it would reply fast.',
  })
  @Get('/')
  @HttpCode(HttpStatus.NO_CONTENT)
  root() {
    return
  }

  @ApiOperation({
    summary: 'Favicon, returns 204',
    description:
      'Favicon, mostly used so if it gets pinged it would reply fast.',
  })
  @Get('/favicon.ico')
  @HttpCode(HttpStatus.NO_CONTENT)
  favicon() {
    return
  }
}
