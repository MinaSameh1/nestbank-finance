import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Patch,
  Post,
} from '@nestjs/common'
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger'
import { ID } from 'src/common/db'
import {
  IdParam,
  Paginate,
  SwaggerDocumentation,
  SwaggerDocumentationPaginationQuery,
} from 'src/common/decorators'
import { PaginatedDto, Pagination } from 'src/common/types'
import { User } from '../../entities/user.entity'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UsersService } from './users.service'

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @SwaggerDocumentation({
    summary: 'Create user',
    badRequestDescription: 'Invalid Data',
    okDescription: 'user created',
    status: HttpStatus.CREATED,
    okType: User,
  })
  @ApiBody({ type: CreateUserDto })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto)
  }

  @SwaggerDocumentation({
    summary: 'Find all users',
    okDescription: 'Return all users',
    badRequestDescription: 'Invalid pagination query',
    paginated: true,
    okType: User,
  })
  @SwaggerDocumentationPaginationQuery()
  @Get()
  findAll(@Paginate() pagination: Pagination): Promise<PaginatedDto<User>> {
    return this.usersService.findAll(pagination)
  }

  @SwaggerDocumentation({
    summary: 'Find one user',
    okDescription: 'Return one user',
    badRequestDescription: 'Invalid user id',
    okType: User,
  })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @Get(':id')
  findOne(@IdParam('id') id: ID) {
    return this.usersService.findOne(id)
  }

  @SwaggerDocumentation({
    summary: 'Update one user',
    okDescription: 'Return updated user',
    badRequestDescription: 'Invalid user id',
    okType: User,
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @Patch(':id')
  update(@IdParam('id') id: ID, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto)
  }

  @SwaggerDocumentation({
    summary: 'Remove one user',
    okDescription: 'Return removed user',
    badRequestDescription: 'Invalid user id',
    okType: User,
  })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @Delete(':id')
  remove(@IdParam('id') id: ID) {
    return this.usersService.remove(id)
  }
}
