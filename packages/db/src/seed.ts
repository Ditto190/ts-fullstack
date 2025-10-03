import { prisma } from './client.js';

async function main(): Promise<void> {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Create test users
  const alice = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      name: 'Alice Developer',
      posts: {
        create: [
          {
            title: 'Getting Started with PERN Stack',
            content: 'A comprehensive guide to building modern web applications...',
            published: true,
          },
          {
            title: 'Advanced TypeScript Patterns',
            content: 'Deep dive into type safety and runtime validation...',
            published: false,
          },
        ],
      },
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      name: 'Bob Engineer',
      posts: {
        create: [
          {
            title: 'Building Scalable APIs',
            content: 'Best practices for API design and implementation...',
            published: true,
          },
        ],
      },
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log({ alice, bob });
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
