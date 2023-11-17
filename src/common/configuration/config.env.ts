import { Expose, plainToInstance } from 'class-transformer'
import {
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator'

export const APP_ENV = {
  DEV: 'DEV',
  PROD: 'PROD',
} as const

// create a class transformer to transform the config object
class EnvTransformer {
  //// App Env ////
  @IsEnum(APP_ENV)
  @Expose({ name: 'APP_ENV' })
  APP_ENV: 'DEV' | 'PROD'

  @Expose()
  @IsNumberString()
  @IsOptional()
  PORT: string

  //// Database ////
  @Expose()
  @IsString()
  @IsNotEmpty()
  DB_HOST: string
  @Expose()
  @IsNumberString()
  @IsNotEmpty()
  DB_PORT: string
  @Expose()
  @IsString()
  @IsNotEmpty()
  DB_USERNAME: string
  @Expose()
  @IsString()
  @IsOptional() // make it optional for dev env
  DB_PASSWORD: string
  @Expose()
  @IsString()
  @IsNotEmpty()
  DB_NAME: string
  @Expose()
  @IsString()
  @IsNotEmpty()
  DB_SCHEMA: string
}

export function validate(config: Record<string, unknown>) {
  // Only allow the properties that are defined in the EnvTransformer class
  const validatedConfig = plainToInstance(EnvTransformer, config, {
    excludeExtraneousValues: true,
  })

  const errors = validateSync(validatedConfig)
  if (errors.length) {
    throw new Error(errors.toString())
  }

  return validatedConfig
}
