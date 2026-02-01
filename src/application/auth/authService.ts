import type { PrismaClient } from "../../generated/prisma/client.js";
import bcrypt from "bcrypt";
import { env } from "@shared/config/env.js";
import { AppError } from "@shared/errors/AppError.js";
import { signAccessToken } from "@shared/auth/jwt.js";
import { generateRefreshToken, hashRefreshToken } from "@shared/auth/refreshToken.js";

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  tokenType: string;
}

export interface RefreshInput {
  refreshToken: string;
}

export class AuthService {
  constructor(private readonly prisma: PrismaClient) {}

  async login(input: LoginInput): Promise<AuthTokens> {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email.toLowerCase().trim(), isActive: true },
      include: { role: true },
    });

    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
      throw new AppError("Invalid credentials", 401);
    }

    const refreshTokenPlain = generateRefreshToken();
    const refreshTokenHash = hashRefreshToken(refreshTokenPlain);
    const expiresAt = this.parseExpiresIn(env.JWT_REFRESH_EXPIRES_IN);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshTokenHash,
        expiresAt,
      },
    });

    const accessToken = signAccessToken({
      sub: user.id,
      role: user.role.name,
    });

    return {
      accessToken,
      refreshToken: refreshTokenPlain,
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
      tokenType: "Bearer",
    };
  }

  async refresh(input: RefreshInput): Promise<AuthTokens> {
    const tokenHash = hashRefreshToken(input.refreshToken);
    const record = await this.prisma.refreshToken.findFirst({
      where: { tokenHash, revokedAt: null },
      include: { user: { include: { role: true } } },
    });

    if (!record || record.expiresAt < new Date() || !record.user.isActive) {
      throw new AppError("Invalid or expired refresh token", 401);
    }

    await this.prisma.refreshToken.update({
      where: { id: record.id },
      data: { revokedAt: new Date() },
    });

    const refreshTokenPlain = generateRefreshToken();
    const newHash = hashRefreshToken(refreshTokenPlain);
    const expiresAt = this.parseExpiresIn(env.JWT_REFRESH_EXPIRES_IN);

    await this.prisma.refreshToken.create({
      data: {
        userId: record.userId,
        tokenHash: newHash,
        expiresAt,
      },
    });

    const accessToken = signAccessToken({
      sub: record.user.id,
      role: record.user.role.name,
    });

    return {
      accessToken,
      refreshToken: refreshTokenPlain,
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
      tokenType: "Bearer",
    };
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = hashRefreshToken(refreshToken);
    const record = await this.prisma.refreshToken.findFirst({
      where: { tokenHash, revokedAt: null },
    });

    if (record) {
      await this.prisma.refreshToken.update({
        where: { id: record.id },
        data: { revokedAt: new Date() },
      });
    }
  }

  private parseExpiresIn(value: string): Date {
    const match = value.match(/^(\d+)([smhd])$/);
    if (!match) {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
    const num = Number(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return new Date(Date.now() + num * (multipliers[unit] ?? 0));
  }
}
