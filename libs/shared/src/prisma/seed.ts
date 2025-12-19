import { PrismaClient, users_role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS);
}

async function main() {
    console.log('Starting database seeding...');

    console.log('Clearing existing data...');

    await prisma.users.deleteMany();

    const adminId = uuidv4();
    const adminPassword = await hashPassword('admin123');
    const admin = await prisma.users.create({
        data: {
            id: adminId,
            email: 'admin@dexa.com',
            password: adminPassword,
            name: 'Admin User',
            role: users_role.ADMIN,
        },
    });
    console.log(`Created Admin: ${admin.email}`);

    // Create 20 Dummy Employees
    for (let i = 1; i <= 20; i++) {
        const empId = uuidv4();
        const empPassword = await hashPassword('employee123'); // Default password for all
        const name = `Employee ${i}`;
        const email = `employee${i}@dexa.com`;

        const user = await prisma.users.create({
            data: {
                id: empId,
                email,
                password: empPassword,
                name,
                role: users_role.EMPLOYEE,
            },
        });
        console.log(`Created Employee: ${user.email}`);
    }

    // specific dummy users matching login credentials
    const specificUsers = [
        { name: 'John Doe', email: 'john.doe@dexa.com' },
        { name: 'Jane Smith', email: 'jane.smith@dexa.com' },
        { name: 'Bob Wilson', email: 'bob.wilson@dexa.com' },
    ];

    for (const u of specificUsers) {
        await prisma.users.create({
            data: {
                id: uuidv4(),
                email: u.email,
                password: await hashPassword('employee123'),
                name: u.name,
                role: users_role.EMPLOYEE,
            },
        });
        console.log(`Created Specific Employee: ${u.email}`);
    }

    console.log('\nSeeding completed successfully!');
    console.log('\n--- Login Credentials ---');
    console.log('Admin:    admin@dexa.com / admin123');
    console.log('Employee: john.doe@dexa.com / employee123');
    console.log('Employee: jane.smith@dexa.com / employee123');
    console.log('Employee: bob.wilson@dexa.com / employee123');
}

main()
    .catch((e) => {
        console.error('Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

