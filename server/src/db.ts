import * as Database from 'duckdb';
import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';
import { Merchant, Transaction, Rule, CardLock } from './types';

export class DatabaseManager {
  private db: Database.Database;
  private connection: Database.Connection;

  constructor() {
    this.db = new Database.Database(':memory:');
    this.connection = this.db.connect();
    this.initializeTables();
  }

  private initializeTables() {
    // Create merchants table
    this.connection.exec(`
      CREATE TABLE merchants (
        merchant_id INTEGER PRIMARY KEY,
        name TEXT,
        category TEXT,
        lat DOUBLE,
        lng DOUBLE
      )
    `);

    // Create transactions table
    this.connection.exec(`
      CREATE TABLE transactions (
        txn_id INTEGER PRIMARY KEY,
        merchant_id INTEGER,
        amount DOUBLE,
        ts TIMESTAMP,
        category TEXT
      )
    `);

    // Create rules table
    this.connection.exec(`
      CREATE TABLE rules (
        rule_id INTEGER PRIMARY KEY,
        type TEXT CHECK (type IN ('merchant_cap', 'category_cap')),
        target_id INTEGER,
        category TEXT,
        cap_amount DOUBLE,
        window TEXT DEFAULT 'month',
        active BOOLEAN DEFAULT true
      )
    `);

    // Create card_locks table
    this.connection.exec(`
      CREATE TABLE card_locks (
        merchant_id INTEGER PRIMARY KEY,
        locked BOOLEAN DEFAULT false,
        locked_at TIMESTAMP
      )
    `);
  }

  async seedData() {
    console.log('Seeding database...');
    
    // Seed merchants
    await this.seedMerchants();
    
    // Seed transactions
    await this.seedTransactions();
    
    console.log('Database seeded successfully');
  }

  private async seedMerchants(): Promise<void> {
    const merchantsData = [
      { merchant_id: 1, name: 'Blacksburg Coffee', category: 'Dining', lat: 37.2296, lng: -80.4139 },
      { merchant_id: 2, name: 'Corner Bar', category: 'Bars', lat: 37.2298, lng: -80.4142 },
      { merchant_id: 3, name: 'VT Grocers', category: 'Groceries', lat: 37.2301, lng: -80.4135 },
      { merchant_id: 4, name: 'Pizza House', category: 'Dining', lat: 37.2292, lng: -80.4129 },
      { merchant_id: 5, name: 'Green Market', category: 'Groceries', lat: 37.2310, lng: -80.4150 },
      { merchant_id: 6, name: 'Tech Store', category: 'Electronics', lat: 37.2305, lng: -80.4145 },
      { merchant_id: 7, name: 'Gas Station', category: 'Transportation', lat: 37.2315, lng: -80.4160 },
      { merchant_id: 8, name: 'Bookstore', category: 'Education', lat: 37.2285, lng: -80.4120 },
      { merchant_id: 9, name: 'Gym', category: 'Health', lat: 37.2320, lng: -80.4155 },
      { merchant_id: 10, name: 'Pharmacy', category: 'Health', lat: 37.2290, lng: -80.4130 }
    ];

    for (const merchant of merchantsData) {
      this.connection.exec(`
        INSERT INTO merchants (merchant_id, name, category, lat, lng)
        VALUES (${merchant.merchant_id}, '${merchant.name}', '${merchant.category}', ${merchant.lat}, ${merchant.lng})
      `);
    }
  }

  private async seedTransactions(): Promise<void> {
    // Generate realistic transaction data for the last 90 days
    const merchants = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const categories = ['Dining', 'Bars', 'Groceries', 'Electronics', 'Transportation', 'Education', 'Health'];
    const merchantCategories = {
      1: 'Dining', 2: 'Bars', 3: 'Groceries', 4: 'Dining', 5: 'Groceries',
      6: 'Electronics', 7: 'Transportation', 8: 'Education', 9: 'Health', 10: 'Health'
    };

    const now = new Date();
    const transactions = [];

    // Generate ~150 transactions over 90 days
    for (let i = 0; i < 150; i++) {
      const merchantId = merchants[Math.floor(Math.random() * merchants.length)];
      const category = merchantCategories[merchantId as keyof typeof merchantCategories];
      
      // Generate random amount based on category
      let amount: number;
      switch (category) {
        case 'Dining':
          amount = Math.random() * 25 + 5; // $5-30
          break;
        case 'Bars':
          amount = Math.random() * 40 + 10; // $10-50
          break;
        case 'Groceries':
          amount = Math.random() * 80 + 20; // $20-100
          break;
        case 'Electronics':
          amount = Math.random() * 200 + 50; // $50-250
          break;
        case 'Transportation':
          amount = Math.random() * 60 + 20; // $20-80
          break;
        case 'Education':
          amount = Math.random() * 100 + 20; // $20-120
          break;
        case 'Health':
          amount = Math.random() * 50 + 10; // $10-60
          break;
        default:
          amount = Math.random() * 30 + 5;
      }

      // Generate random timestamp within last 90 days
      const daysAgo = Math.floor(Math.random() * 90);
      const hoursAgo = Math.floor(Math.random() * 24);
      const minutesAgo = Math.floor(Math.random() * 60);
      const timestamp = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000) - (minutesAgo * 60 * 1000));

      transactions.push({
        txn_id: i + 1,
        merchant_id: merchantId,
        amount: Math.round(amount * 100) / 100,
        ts: timestamp.toISOString(),
        category
      });
    }

    // Insert transactions
    for (const txn of transactions) {
      this.connection.exec(`
        INSERT INTO transactions (txn_id, merchant_id, amount, ts, category)
        VALUES (${txn.txn_id}, ${txn.merchant_id}, ${txn.amount}, '${txn.ts}', '${txn.category}')
      `);
    }
  }

  getConnection(): Database.Connection {
    return this.connection;
  }

  close() {
    this.connection.close();
    this.db.close();
  }
}

export const dbManager = new DatabaseManager();
