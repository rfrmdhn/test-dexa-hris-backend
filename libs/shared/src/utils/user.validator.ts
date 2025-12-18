import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserValidator {
    static async validateEmailDoesNotExist(prisma: PrismaService, email: string): Promise<void> {
        const existingUser = await prisma.users.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }
    }
}
