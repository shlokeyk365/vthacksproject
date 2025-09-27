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

  // Create comprehensive spending caps
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
        limit: 600,
        period: 'MONTHLY',
        category: 'Food & Dining'
      }
    }),
    prisma.spendingCap.create({
      data: {
        userId: user.id,
        type: 'CATEGORY',
        name: 'Transportation',
        limit: 400,
        period: 'MONTHLY',
        category: 'Transportation'
      }
    }),
    prisma.spendingCap.create({
      data: {
        userId: user.id,
        type: 'CATEGORY',
        name: 'Shopping',
        limit: 500,
        period: 'MONTHLY',
        category: 'Shopping'
      }
    }),
    prisma.spendingCap.create({
      data: {
        userId: user.id,
        type: 'CATEGORY',
        name: 'Grocery',
        limit: 300,
        period: 'MONTHLY',
        category: 'Grocery'
      }
    }),
    prisma.spendingCap.create({
      data: {
        userId: user.id,
        type: 'CATEGORY',
        name: 'Entertainment',
        limit: 150,
        period: 'MONTHLY',
        category: 'Entertainment'
      }
    }),
    prisma.spendingCap.create({
      data: {
        userId: user.id,
        type: 'MERCHANT',
        name: 'Starbucks',
        limit: 80,
        period: 'MONTHLY',
        merchant: 'Starbucks'
      }
    }),
    prisma.spendingCap.create({
      data: {
        userId: user.id,
        type: 'MERCHANT',
        name: 'Amazon',
        limit: 200,
        period: 'MONTHLY',
        merchant: 'Amazon'
      }
    }),
    prisma.spendingCap.create({
      data: {
        userId: user.id,
        type: 'MERCHANT',
        name: 'Uber',
        limit: 100,
        period: 'MONTHLY',
        merchant: 'Uber'
      }
    })
  ]);

  console.log('✅ Spending caps created:', caps.length);

  // Create comprehensive transaction data for the last 6 months
  const now = new Date();
  const transactions = [];
  
  // Helper function to generate random amount within range
  const randomAmount = (min: number, max: number) => Math.round((Math.random() * (max - min) + min) * 100) / 100;
  
  // Helper function to get random date within range
  const randomDate = (daysAgo: number) => new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  
  // Food & Dining transactions (high frequency, small amounts)
  const foodMerchants = ['Starbucks', 'McDonald\'s', 'Subway', 'Pizza Hut', 'Domino\'s', 'Chipotle', 'Panera Bread', 'Dunkin\' Donuts', 'Taco Bell', 'KFC'];
  const foodLocations = [
    { lat: 37.235581, lng: -80.433307, address: '880 University City Blvd, Blacksburg, VA' },
    { lat: 37.234567, lng: -80.432109, address: '900 University City Blvd, Blacksburg, VA' },
    { lat: 37.228456, lng: -80.413789, address: '200 College Ave, Blacksburg, VA' },
    { lat: 37.233456, lng: -80.431234, address: '400 University City Blvd, Blacksburg, VA' },
    { lat: 37.226789, lng: -80.411567, address: '500 S Main St, Blacksburg, VA' }
  ];
  
  // Generate 60+ food transactions over 6 months
  for (let i = 0; i < 65; i++) {
    const merchant = foodMerchants[Math.floor(Math.random() * foodMerchants.length)];
    const location = foodLocations[Math.floor(Math.random() * foodLocations.length)];
    const daysAgo = Math.floor(Math.random() * 180) + 1; // Last 6 months
    
    transactions.push({
      userId: user.id,
      merchant,
      amount: randomAmount(3.50, 25.99),
      category: 'Food & Dining',
      description: ['Coffee', 'Lunch', 'Dinner', 'Snack', 'Breakfast', 'Takeout'][Math.floor(Math.random() * 6)],
      location: location.address,
      latitude: location.lat,
      longitude: location.lng,
      date: randomDate(daysAgo)
    });
  }
  
  // Transportation transactions
  const transportMerchants = ['Shell', 'Exxon', 'BP', 'Chevron', 'Uber', 'Lyft', 'Virginia Tech Parking', 'Blacksburg Transit'];
  const transportLocations = [
    { lat: 37.218901, lng: -80.401234, address: '1000 S Main St, Blacksburg, VA' },
    { lat: 37.2176, lng: -80.4118, address: '789 South Main St, Blacksburg, VA' },
    { lat: 37.216801, lng: -80.402687, address: '1322 S Main St, Blacksburg, VA' }
  ];
  
  for (let i = 0; i < 25; i++) {
    const merchant = transportMerchants[Math.floor(Math.random() * transportMerchants.length)];
    const location = transportLocations[Math.floor(Math.random() * transportLocations.length)];
    const daysAgo = Math.floor(Math.random() * 180) + 1;
    
    transactions.push({
      userId: user.id,
      merchant,
      amount: merchant.includes('Uber') || merchant.includes('Lyft') ? randomAmount(8, 35) : randomAmount(25, 65),
      category: 'Transportation',
      description: merchant.includes('Uber') || merchant.includes('Lyft') ? 'Ride share' : 'Gas fill-up',
      location: location.address,
      latitude: location.lat,
      longitude: location.lng,
      date: randomDate(daysAgo)
    });
  }
  
  // Shopping transactions
  const shoppingMerchants = ['Amazon', 'Target', 'Walmart', 'Best Buy', 'Home Depot', 'Lowe\'s', 'Costco', 'Sam\'s Club', 'Macy\'s', 'Nordstrom'];
  
  for (let i = 0; i < 40; i++) {
    const merchant = shoppingMerchants[Math.floor(Math.random() * shoppingMerchants.length)];
    const daysAgo = Math.floor(Math.random() * 180) + 1;
    const isOnline = merchant === 'Amazon' || Math.random() > 0.7;
    
    transactions.push({
      userId: user.id,
      merchant,
      amount: randomAmount(15, 299),
      category: 'Shopping',
      description: ['Electronics', 'Clothing', 'Home goods', 'Books', 'Tools', 'Furniture'][Math.floor(Math.random() * 6)],
      location: isOnline ? 'Online' : '195 Conston Ave NW, Christiansburg, VA 24073',
      latitude: isOnline ? null : 37.156681,
      longitude: isOnline ? null : -80.422609,
      date: randomDate(daysAgo)
    });
  }
  
  // Grocery transactions
  const groceryMerchants = ['Kroger', 'Food Lion', 'Harris Teeter', 'Whole Foods', 'Trader Joe\'s', 'Giant', 'Safeway'];
  
  for (let i = 0; i < 35; i++) {
    const merchant = groceryMerchants[Math.floor(Math.random() * groceryMerchants.length)];
    const daysAgo = Math.floor(Math.random() * 180) + 1;
    
    transactions.push({
      userId: user.id,
      merchant,
      amount: randomAmount(25, 150),
      category: 'Grocery',
      description: 'Grocery shopping',
      location: '1322 S Main St, Blacksburg, VA 24060',
      latitude: 37.216801,
      longitude: -80.402687,
      date: randomDate(daysAgo)
    });
  }
  
  // Entertainment transactions
  const entertainmentMerchants = ['Netflix', 'Spotify', 'Hulu', 'Disney+', 'AMC Theaters', 'Regal Cinemas', 'Steam', 'PlayStation Store', 'Xbox Live'];
  
  for (let i = 0; i < 20; i++) {
    const merchant = entertainmentMerchants[Math.floor(Math.random() * entertainmentMerchants.length)];
    const daysAgo = Math.floor(Math.random() * 180) + 1;
    const isOnline = ['Netflix', 'Spotify', 'Hulu', 'Disney+', 'Steam', 'PlayStation Store', 'Xbox Live'].includes(merchant);
    
    transactions.push({
      userId: user.id,
      merchant,
      amount: isOnline ? randomAmount(5, 20) : randomAmount(12, 45),
      category: 'Entertainment',
      description: isOnline ? 'Subscription' : 'Movie tickets',
      location: isOnline ? 'Online' : '123 Main St, Blacksburg, VA',
      latitude: isOnline ? null : 37.2296,
      longitude: isOnline ? null : -80.4139,
      date: randomDate(daysAgo)
    });
  }
  
  // Healthcare transactions
  const healthcareMerchants = ['CVS Pharmacy', 'Walgreens', 'Rite Aid', 'Blacksburg Medical Center', 'Virginia Tech Health Center'];
  
  for (let i = 0; i < 15; i++) {
    const merchant = healthcareMerchants[Math.floor(Math.random() * healthcareMerchants.length)];
    const daysAgo = Math.floor(Math.random() * 180) + 1;
    
    transactions.push({
      userId: user.id,
      merchant,
      amount: randomAmount(10, 85),
      category: 'Healthcare',
      description: ['Prescription', 'Over-the-counter', 'Medical supplies', 'Doctor visit'][Math.floor(Math.random() * 4)],
      location: '300 S Main St, Blacksburg, VA 24060',
      latitude: 37.227890,
      longitude: -80.412345,
      date: randomDate(daysAgo)
    });
  }
  
  // Utilities and bills
  const utilityMerchants = ['Dominion Energy', 'Verizon', 'AT&T', 'Comcast', 'Blacksburg Electric', 'Water Authority'];
  
  for (let i = 0; i < 18; i++) {
    const merchant = utilityMerchants[Math.floor(Math.random() * utilityMerchants.length)];
    const daysAgo = Math.floor(Math.random() * 180) + 1;
    
    transactions.push({
      userId: user.id,
      merchant,
      amount: randomAmount(25, 200),
      category: 'Utilities',
      description: ['Electric bill', 'Phone bill', 'Internet bill', 'Water bill'][Math.floor(Math.random() * 4)],
      location: 'Online',
      date: randomDate(daysAgo)
    });
  }
  
  // Education expenses
  const educationMerchants = ['Virginia Tech Bookstore', 'Amazon (Textbooks)', 'Chegg', 'Coursera', 'Udemy'];
  
  for (let i = 0; i < 12; i++) {
    const merchant = educationMerchants[Math.floor(Math.random() * educationMerchants.length)];
    const daysAgo = Math.floor(Math.random() * 180) + 1;
    
    transactions.push({
      userId: user.id,
      merchant,
      amount: randomAmount(15, 150),
      category: 'Education',
      description: ['Textbook', 'Online course', 'School supplies', 'Software license'][Math.floor(Math.random() * 4)],
      location: merchant === 'Virginia Tech Bookstore' ? 'Virginia Tech Campus, Blacksburg, VA' : 'Online',
      latitude: merchant === 'Virginia Tech Bookstore' ? 37.2296 : null,
      longitude: merchant === 'Virginia Tech Bookstore' ? -80.4139 : null,
      date: randomDate(daysAgo)
    });
  }
  
  // Travel expenses
  const travelMerchants = ['Southwest Airlines', 'Delta', 'American Airlines', 'Hilton', 'Marriott', 'Airbnb', 'Enterprise Rent-A-Car'];
  
  for (let i = 0; i < 8; i++) {
    const merchant = travelMerchants[Math.floor(Math.random() * travelMerchants.length)];
    const daysAgo = Math.floor(Math.random() * 180) + 1;
    
    transactions.push({
      userId: user.id,
      merchant,
      amount: randomAmount(50, 500),
      category: 'Travel',
      description: ['Flight', 'Hotel', 'Car rental', 'Vacation rental'][Math.floor(Math.random() * 4)],
      location: 'Online',
      date: randomDate(daysAgo)
    });
  }
  
  // Create all transactions in batches
  const batchSize = 50;
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    await Promise.all(batch.map(transaction => prisma.transaction.create({ data: transaction })));
  }

  console.log('✅ Sample transactions created:', transactions.length);

  // Create comprehensive merchant data
  const merchants = await Promise.all([
    // Food & Dining merchants
    prisma.merchant.create({
      data: {
        name: 'Starbucks',
        category: 'Food & Dining',
        address: '880 University City Blvd, Blacksburg, VA',
        latitude: 37.235581,
        longitude: -80.433307,
        averageSpent: 6.25,
        visitCount: 12
      }
    }),
    prisma.merchant.create({
      data: {
        name: 'McDonald\'s',
        category: 'Food & Dining',
        address: '900 University City Blvd, Blacksburg, VA',
        latitude: 37.234567,
        longitude: -80.432109,
        averageSpent: 8.50,
        visitCount: 8
      }
    }),
    prisma.merchant.create({
      data: {
        name: 'Chipotle',
        category: 'Food & Dining',
        address: '200 College Ave, Blacksburg, VA',
        latitude: 37.228456,
        longitude: -80.413789,
        averageSpent: 12.75,
        visitCount: 6
      }
    }),
    prisma.merchant.create({
      data: {
        name: 'Pizza Hut',
        category: 'Food & Dining',
        address: '400 University City Blvd, Blacksburg, VA',
        latitude: 37.233456,
        longitude: -80.431234,
        averageSpent: 18.99,
        visitCount: 4
      }
    }),
    
    // Transportation merchants
    prisma.merchant.create({
      data: {
        name: 'Shell',
        category: 'Transportation',
        address: '1000 S Main St, Blacksburg, VA',
        latitude: 37.218901,
        longitude: -80.401234,
        averageSpent: 42.50,
        visitCount: 15
      }
    }),
    prisma.merchant.create({
      data: {
        name: 'Uber',
        category: 'Transportation',
        address: 'Online',
        latitude: null,
        longitude: null,
        averageSpent: 18.75,
        visitCount: 8
      }
    }),
    
    // Shopping merchants
    prisma.merchant.create({
      data: {
        name: 'Amazon',
        category: 'Shopping',
        address: 'Online',
        latitude: null,
        longitude: null,
        averageSpent: 45.80,
        visitCount: 25
      }
    }),
    prisma.merchant.create({
      data: {
        name: 'Target',
        category: 'Shopping',
        address: '195 Conston Ave NW, Christiansburg, VA',
        latitude: 37.156681,
        longitude: -80.422609,
        averageSpent: 75.25,
        visitCount: 6
      }
    }),
    prisma.merchant.create({
      data: {
        name: 'Walmart',
        category: 'Shopping',
        address: '2400 N Franklin St, Christiansburg, VA',
        latitude: 37.145123,
        longitude: -80.408456,
        averageSpent: 65.40,
        visitCount: 8
      }
    }),
    
    // Grocery merchants
    prisma.merchant.create({
      data: {
        name: 'Kroger',
        category: 'Grocery',
        address: '1322 S Main St, Blacksburg, VA',
        latitude: 37.216801,
        longitude: -80.402687,
        averageSpent: 85.75,
        visitCount: 12
      }
    }),
    prisma.merchant.create({
      data: {
        name: 'Whole Foods',
        category: 'Grocery',
        address: '1500 S Main St, Blacksburg, VA',
        latitude: 37.214567,
        longitude: -80.401234,
        averageSpent: 125.50,
        visitCount: 4
      }
    }),
    
    // Entertainment merchants
    prisma.merchant.create({
      data: {
        name: 'Netflix',
        category: 'Entertainment',
        address: 'Online',
        latitude: null,
        longitude: null,
        averageSpent: 15.99,
        visitCount: 6
      }
    }),
    prisma.merchant.create({
      data: {
        name: 'Spotify',
        category: 'Entertainment',
        address: 'Online',
        latitude: null,
        longitude: null,
        averageSpent: 9.99,
        visitCount: 6
      }
    }),
    
    // Healthcare merchants
    prisma.merchant.create({
      data: {
        name: 'CVS Pharmacy',
        category: 'Healthcare',
        address: '300 S Main St, Blacksburg, VA',
        latitude: 37.227890,
        longitude: -80.412345,
        averageSpent: 35.25,
        visitCount: 5
      }
    }),
    
    // Utilities
    prisma.merchant.create({
      data: {
        name: 'Dominion Energy',
        category: 'Utilities',
        address: 'Online',
        latitude: null,
        longitude: null,
        averageSpent: 125.75,
        visitCount: 6
      }
    }),
    prisma.merchant.create({
      data: {
        name: 'Verizon',
        category: 'Utilities',
        address: 'Online',
        latitude: null,
        longitude: null,
        averageSpent: 85.50,
        visitCount: 6
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
