import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password (minimum 6 characters)',
    minLength: 6
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'fan',
    description: 'User role',
    enum: ['celebrity', 'fan']
  })
  @IsEnum(['celebrity', 'fan'])
  role: 'celebrity' | 'fan';
}

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password'
  })
  @IsString()
  password: string;
}

export class AuthResponseDto {
  @ApiProperty()
  access_token: string;

  @ApiProperty()
  user: {
    id: string;
    email: string;
    role: string;
  };

  @ApiProperty()
  expires_in: number;
}