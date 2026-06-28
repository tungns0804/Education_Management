import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '../src/constants/auth.constants';
import { DEMO_ADMIN, DEMO_TEACHER, DEMO_STUDENT } from '../src/constants/seed.constants';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma  = new PrismaClient({ adapter });

async function main() {
  const users = [
    { ...DEMO_ADMIN,   password: await bcrypt.hash(DEMO_ADMIN.password,   BCRYPT_SALT_ROUNDS) },
    { ...DEMO_TEACHER, password: await bcrypt.hash(DEMO_TEACHER.password,  BCRYPT_SALT_ROUNDS) },
    { ...DEMO_STUDENT, password: await bcrypt.hash(DEMO_STUDENT.password,  BCRYPT_SALT_ROUNDS) },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where:  { email: u.email },
      update: { personalEmail: (u as any).personalEmail },
      create: u,
    });
    console.log(`✔ Seeded: ${u.email}`);
  }

  console.log('\nDemo credentials:');
  console.log(`  Admin:   ${DEMO_ADMIN.email}   / ${DEMO_ADMIN.password}`);
  console.log(`  Teacher: ${DEMO_TEACHER.email}  / ${DEMO_TEACHER.password}`);
  console.log(`  Student: ${DEMO_STUDENT.email} / ${DEMO_STUDENT.password}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
