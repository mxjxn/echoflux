import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create demo user
  const user = await prisma.user.upsert({
    where: { username: 'demo' },
    update: {},
    create: {
      username: 'demo',
    },
  });

  // Create demo sequences
  const sequence1 = await prisma.sequence.create({
    data: {
      name: 'House Beat',
      synthName: 'beep',
      bpm: 128,
      notes: JSON.stringify([
        { step: 0, pitch: 60, velocity: 100, duration: 1 },
        { step: 4, pitch: 60, velocity: 80, duration: 1 },
        { step: 8, pitch: 60, velocity: 100, duration: 1 },
        { step: 12, pitch: 60, velocity: 80, duration: 1 },
      ]),
      synthParams: JSON.stringify({ amp: 0.8, release: 0.3 }),
      authorId: user.id,
    },
  });

  const sequence2 = await prisma.sequence.create({
    data: {
      name: 'Ambient Pad',
      synthName: 'dark_ambience',
      bpm: 90,
      notes: JSON.stringify([
        { step: 0, pitch: 48, velocity: 60, duration: 4 },
        { step: 4, pitch: 52, velocity: 60, duration: 4 },
        { step: 8, pitch: 55, velocity: 60, duration: 4 },
        { step: 12, pitch: 52, velocity: 60, duration: 4 },
      ]),
      synthParams: JSON.stringify({ amp: 0.6, release: 2.0 }),
      authorId: user.id,
    },
  });

  console.log('Seeded:', { user, sequence1, sequence2 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
