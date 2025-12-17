import { PrismaClient, users_role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS);
}

async function main() {
    console.log('🌱 Starting database seeding...');

    // Clear existing data (optional, comment out if you want to preserve data)
    console.log('🗑️  Clearing existing data...');
    await prisma.attendances.deleteMany();
    await prisma.users.deleteMany();

    // Create Admin User
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
    console.log(`✅ Created Admin: ${admin.email}`);

    // Create Employee Users
    const employees = [
        { name: 'John Doe', email: 'john.doe@dexa.com' },
        { name: 'Jane Smith', email: 'jane.smith@dexa.com' },
        { name: 'Bob Wilson', email: 'bob.wilson@dexa.com' },
    ];

    for (const emp of employees) {
        const empId = uuidv4();
        const empPassword = await hashPassword('employee123');
        const user = await prisma.users.create({
            data: {
                id: empId,
                email: emp.email,
                password: empPassword,
                name: emp.name,
                role: users_role.EMPLOYEE,
            },
        });
        console.log(`✅ Created Employee: ${user.email}`);

        // Create sample attendance for this employee (yesterday and today)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(8, 30, 0, 0);

        await prisma.attendances.create({
            data: {
                id: uuidv4(),
                userId: empId,
                checkInTime: yesterday,
                photoUrl: 'uploads/sample-checkin.jpg',
                checkOutTime: new Date(yesterday.getTime() + 8 * 60 * 60 * 1000), // 8 hours later
            },
        });
        console.log(`  📅 Added attendance record for ${emp.name} (yesterday)`);
    }

    console.log('\n🎉 Seeding completed successfully!');
    console.log('\n--- Login Credentials ---');
    console.log('Admin:    admin@dexa.com / admin123');
    console.log('Employee: john.doe@dexa.com / employee123');
    console.log('Employee: jane.smith@dexa.com / employee123');
    console.log('Employee: bob.wilson@dexa.com / employee123');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
