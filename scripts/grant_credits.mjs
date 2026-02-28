import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const ADMIN_EMAIL = 'him55710@gmail.com';
const AMOUNT = 100000;

async function main() {
    console.log(`Looking for user: ${ADMIN_EMAIL}...`);

    // 이메일로 사용자 찾기
    const user = await prisma.user.findUnique({
        where: { email: ADMIN_EMAIL }
    });

    if (!user) {
        console.error(`User with email ${ADMIN_EMAIL} not found. They might need to sign in first.`);
        return;
    }

    console.log(`Found user: ${user.name} (Current credits: ${user.credits})`);

    // 크레딧 증정 기록(Ledger) 추가 및 유저 크레딧 업데이트 (Transaction)
    await prisma.$transaction([
        prisma.user.update({
            where: { email: ADMIN_EMAIL },
            data: { credits: { increment: AMOUNT } }
        }),
        prisma.creditLedger.create({
            data: {
                userId: user.id,
                delta: AMOUNT,
                reason: "ADMIN_GRANT",
            }
        })
    ]);

    const updatedUser = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
    console.log(`\n✅ Success! User ${ADMIN_EMAIL} now has ${updatedUser?.credits} credits.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
