import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser = this.usersRepository.create({
      email: dto.email,
      password: hashedPassword,
      fullName: dto.fullName,
    });

    return this.usersRepository.save(newUser);
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.generateRefreshToken(user);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  private async generateRefreshToken(user: User): Promise<string> {
    const payload = { sub: user.id };

    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
    });

    const expiresInDays = parseInt(
      this.configService.get('JWT_REFRESH_EXPIRES_IN').replace('d', ''),
      10,
    );
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const refreshTokenEntity = this.refreshTokenRepository.create({
      token,
      user,
      expiresAt,
    });

    await this.refreshTokenRepository.save(refreshTokenEntity);

    return token;
  }

  async refreshAccessToken(oldRefreshToken: string) {
      const storedToken = await this.refreshTokenRepository.findOne({
      where: { token: oldRefreshToken },
      relations: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (storedToken.isRevoked) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    if (new Date() > storedToken.expiresAt) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = storedToken.user;
    const payload = { sub: user.id, email: user.email, role: user.role };
    const newAccessToken = this.jwtService.sign(payload);

    return { accessToken: newAccessToken };
  }

  async logout(refreshToken: string) {
    const storedToken = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
    });

    if (storedToken) {
      storedToken.isRevoked = true;
      await this.refreshTokenRepository.save(storedToken);
    }

    return { message: 'Logged out successfully' };
  }
}