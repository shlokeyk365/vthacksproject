import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a test user
  const hashedPassword = await bcrypt.hash('password1234', 12);
  
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

  // Create sample transactions with recent dates and location data
  const now = new Date();
  const transactions = await Promise.all([
    // Recent transactions with location data
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
        date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
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
        date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
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
        date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
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
        date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      }
    }),
    prisma.transaction.create({
      data: {
        userId: user.id,
        merchant: 'Chipotle',
        amount: 15.67,
        category: 'Food & Dining',
        description: 'Burrito bowl',
        location: 'North Main St, Blacksburg',
        latitude: 37.2350,
        longitude: -80.4200,
        date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
      }
    }),
    prisma.transaction.create({
      data: {
        userId: user.id,
        merchant: 'Walmart',
        amount: 67.89,
        category: 'Shopping',
        description: 'Household supplies',
        location: 'South Main St, Blacksburg',
        latitude: 37.2176,
        longitude: -80.4118,
        date: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000) // 12 days ago
      }
    }),
    prisma.transaction.create({
      data: {
        userId: user.id,
        merchant: 'Subway',
        amount: 8.99,
        category: 'Food & Dining',
        description: 'Sandwich',
        location: 'University Blvd, Blacksburg',
        latitude: 37.2431,
        longitude: -80.4242,
        date: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
      }
    }),
    prisma.transaction.create({
      data: {
        userId: user.id,
        merchant: 'CVS Pharmacy',
        amount: 23.45,
        category: 'Healthcare',
        description: 'Prescription and toiletries',
        location: 'Main St, Blacksburg',
        latitude: 37.2296,
        longitude: -80.4139,
        date: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000) // 18 days ago
      }
    }),
    prisma.transaction.create({
      data: {
        userId: user.id,
        merchant: 'Pizza Hut',
        amount: 24.99,
        category: 'Food & Dining',
        description: 'Pizza delivery',
        location: 'North Main St, Blacksburg',
        latitude: 37.2350,
        longitude: -80.4200,
        date: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000) // 20 days ago
      }
    }),
    prisma.transaction.create({
      data: {
        userId: user.id,
        merchant: 'Best Buy',
        amount: 299.99,
        category: 'Shopping',
        description: 'Electronics',
        location: 'University Blvd, Blacksburg',
        latitude: 37.2431,
        longitude: -80.4242,
        date: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000) // 25 days ago
      }
    }),
    // Online transactions without location data
    prisma.transaction.create({
      data: {
        userId: user.id,
        merchant: 'Amazon',
        amount: 129.99,
        category: 'Shopping',
        description: 'Online purchase',
        location: 'Online',
        date: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
      }
    }),
    prisma.transaction.create({
      data: {
        userId: user.id,
        merchant: 'Netflix',
        amount: 15.99,
        category: 'Entertainment',
        description: 'Monthly subscription',
        location: 'Online',
        date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
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
  console.log('Password: password1234');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
