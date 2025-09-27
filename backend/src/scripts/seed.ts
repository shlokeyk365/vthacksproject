import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a test user
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const user = await prisma.user.upsert({
    where: { email: 'test@moneylens.com' },
    update: {},
    create: {
      email: 'test@moneylens.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      monthlyBudgetGoal: 3500,
      preferences: JSON.stringify({
        notifications: {
          capAlerts: true,
          weeklyReports: true,
          budgetWarnings: true,
          transactionAlerts: false
        },
        map: {
          defaultLocation: 'Blacksburg, VA',
          showHeatmap: true,
          showMerchantPins: true
        },
        theme: 'light'
      })
    }
  });

  console.log('✅ User created:', user.email);

  // Create sample spending caps
  const caps = await Promise.all([
    prisma.spendingCap.create({
      data: {
        userId: user.id,
        type: 'GLOBAL',
        name: 'Monthly Budget',
        limit: 3500,
        period: 'MONTHLY'
      }
    }),
    prisma.spendingCap.create({
      data: {
        userId: user.id,
        type: 'CATEGORY',
        name: 'Food & Dining',
        limit: 500,
        period: 'MONTHLY',
        category: 'Food & Dining'
      }
    }),
    prisma.spendingCap.create({
      data: {
        userId: user.id,
        type: 'MERCHANT',
        name: 'Starbucks Coffee',
        limit: 100,
        period: 'MONTHLY',
        merchant: 'Starbucks Coffee'
      }
    })
  ]);

  console.log('✅ Spending caps created:', caps.length);

  // Create sample transactions
  const transactions = await Promise.all([
    prisma.transaction.create({
      data: {
        userId: user.id,
        merchant: 'Starbucks Coffee',
        amount: 5.47,
        category: 'Food & Dining',
        description: 'Morning coffee',
        location: 'Main St, Blacksburg',
        latitude: 37.2296,
        longitude: -80.4139,
        date: new Date('2024-01-15T08:30:00Z')
      }
    }),
    prisma.transaction.create({
      data: {
        userId: user.id,
        merchant: 'Amazon',
        amount: 129.99,
        category: 'Shopping',
        description: 'Online purchase',
        location: 'Online',
        date: new Date('2024-01-14T14:20:00Z')
      }
    }),
    prisma.transaction.create({
      data: {
        userId: user.id,
        merchant: 'Shell Gas Station',
        amount: 45.20,
        category: 'Transportation',
        description: 'Gas fill-up',
        location: 'University Blvd, Blacksburg',
        latitude: 37.2431,
        longitude: -80.4242,
        date: new Date('2024-01-14T16:45:00Z')
      }
    }),
    prisma.transaction.create({
      data: {
        userId: user.id,
        merchant: 'Electric Company',
        amount: 156.78,
        category: 'Utilities',
        description: 'Monthly electric bill',
        location: 'Monthly Bill',
        date: new Date('2024-01-13T09:00:00Z')
      }
    }),
    prisma.transaction.create({
      data: {
        userId: user.id,
        merchant: 'McDonald\'s',
        amount: 12.34,
        category: 'Food & Dining',
        description: 'Lunch',
        location: 'South Main St, Blacksburg',
        latitude: 37.2176,
        longitude: -80.4118,
        date: new Date('2024-01-13T12:15:00Z')
      }
    }),
    prisma.transaction.create({
      data: {
        userId: user.id,
        merchant: 'Target',
        amount: 89.45,
        category: 'Shopping',
        description: 'Groceries and household items',
        location: 'University Blvd, Blacksburg',
        latitude: 37.2431,
        longitude: -80.4242,
        date: new Date('2024-01-12T15:30:00Z')
      }
    })
  ]);

  console.log('✅ Sample transactions created:', transactions.length);

  // Create sample merchants
  const merchants = await Promise.all([
    prisma.merchant.create({
      data: {
        name: 'Starbucks Coffee',
        category: 'Food & Dining',
        address: '123 Main St, Blacksburg, VA',
        latitude: 37.2296,
        longitude: -80.4139,
        averageSpent: 5.47,
        visitCount: 1
      }
    }),
    prisma.merchant.create({
      data: {
        name: 'Shell Gas Station',
        category: 'Transportation',
        address: '789 South Main St, Blacksburg, VA',
        latitude: 37.2176,
        longitude: -80.4118,
        averageSpent: 45.20,
        visitCount: 1
      }
    }),
    prisma.merchant.create({
      data: {
        name: 'Target',
        category: 'Shopping',
        address: '456 University Blvd, Blacksburg, VA',
        latitude: 37.2431,
        longitude: -80.4242,
        averageSpent: 89.45,
        visitCount: 1
      }
    })
  ]);

  console.log('✅ Sample merchants created:', merchants.length);

  // Create sample notifications
  const notifications = await Promise.all([
    prisma.notification.create({
      data: {
        userId: user.id,
        type: 'CAP_ALERT',
        title: 'Spending Cap Alert',
        message: 'You\'ve spent 85% of your Food & Dining budget this month'
      }
    }),
    prisma.notification.create({
      data: {
        userId: user.id,
        type: 'BUDGET_WARNING',
        title: 'Budget Warning',
        message: 'You\'re approaching your monthly budget limit'
      }
    })
  ]);

  console.log('✅ Sample notifications created:', notifications.length);

  console.log('🎉 Database seeded successfully!');
  console.log('\nTest user credentials:');
  console.log('Email: test@moneylens.com');
  console.log('Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
