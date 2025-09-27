import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse, AuthenticatedRequest, MapMerchant, HeatmapData } from '../types';
import { realMerchants, RealMerchant } from '../data/merchants';

const router = express.Router();
const prisma = new PrismaClient();

// Helper function to determine pricing level based on average spending
function getPricingLevel(averageSpent: number, category: string): 'low' | 'medium' | 'high' {
  // Category-specific thresholds
  const thresholds = {
    'Food & Dining': { low: 15, high: 35 },
    'Shopping': { low: 50, high: 150 },
    'Grocery': { low: 30, high: 80 },
    'Transportation': { low: 20, high: 60 },
    'Entertainment': { low: 25, high: 75 },
    'Healthcare': { low: 40, high: 120 },
    'Other': { low: 20, high: 60 }
  };

  const categoryThresholds = thresholds[category as keyof typeof thresholds] || thresholds['Other'];
  
  if (averageSpent <= categoryThresholds.low) {
    return 'low';
  } else if (averageSpent <= categoryThresholds.high) {
    return 'medium';
  } else {
    return 'high';
  }
}

// Get merchants with coordinates
router.get('/merchants', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { period = '30' } = req.query;

    const days = Number(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get transaction data grouped by merchant
    const transactionData = await prisma.transaction.groupBy({
      by: ['merchant', 'category'],
      where: {
        userId,
        date: { gte: startDate },
        status: 'COMPLETED'
      },
      _sum: { amount: true },
      _count: { merchant: true },
      orderBy: { _sum: { amount: 'desc' } }
    });

    // Create a map of merchant names to transaction data
    const merchantTransactionMap = new Map();
    transactionData.forEach((item: any) => {
      const merchantName = item.merchant.toLowerCase();
      if (!merchantTransactionMap.has(merchantName)) {
        merchantTransactionMap.set(merchantName, {
          totalSpent: 0,
          visits: 0,
          categories: new Set()
        });
      }
      const data = merchantTransactionMap.get(merchantName);
      data.totalSpent += Number(item._sum.amount || 0);
      data.visits += item._count.merchant;
      data.categories.add(item.category);
    });

    // Match transaction data with real merchant data
    const merchants: MapMerchant[] = [];
    
    // First, add all real merchants (with or without transaction data)
    realMerchants.forEach(realMerchant => {
      const merchantName = realMerchant.name.toLowerCase();
      const transactionData = merchantTransactionMap.get(merchantName);
      
      const totalSpent = transactionData?.totalSpent || 0;
      const visits = transactionData?.visits || 0;
      const averageSpent = visits > 0 ? totalSpent / visits : 0;
      const pricingLevel = getPricingLevel(averageSpent, realMerchant.category);
      
      // Always add real merchants, use transaction data if available
      merchants.push({
        id: realMerchant.id,
        name: realMerchant.name,
        address: realMerchant.address,
        totalSpent,
        visits,
        category: realMerchant.category,
        coordinates: realMerchant.coordinates,
        averageSpent,
        pricingLevel
      });
    });

    // Only add merchants from transactions that have real data or similar merchants
    // Skip unknown merchants to avoid "Address to be geocoded" placeholders
    for (const [merchantName, data] of merchantTransactionMap.entries()) {
      const hasRealData = realMerchants.some(m => m.name.toLowerCase() === merchantName);
      
      if (!hasRealData) {
        // Try to find a similar merchant name
        const similarMerchant = realMerchants.find(m => 
          m.name.toLowerCase().includes(merchantName) || 
          merchantName.includes(m.name.toLowerCase())
        );

        if (similarMerchant) {
          // Use similar merchant's data but with transaction amounts
          const averageSpent = data.visits > 0 ? data.totalSpent / data.visits : 0;
          const pricingLevel = getPricingLevel(averageSpent, similarMerchant.category);
          
          merchants.push({
            id: `${merchantName}-similar-${similarMerchant.id}`,
            name: merchantName,
            address: similarMerchant.address,
            totalSpent: data.totalSpent,
            visits: data.visits,
            category: similarMerchant.category,
            coordinates: similarMerchant.coordinates,
            averageSpent,
            pricingLevel
          });
        }
        // Skip unknown merchants entirely - no more "Address to be geocoded" merchants
      }
    }

    // Sort by total spent
    merchants.sort((a, b) => b.totalSpent - a.totalSpent);

    const response: ApiResponse = {
      success: true,
      data: merchants,
      message: 'Merchants retrieved successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
});

// Get heatmap data
router.get('/heatmap-data', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { period = '30' } = req.query;

    const days = Number(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get transactions with coordinates
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate },
        status: 'COMPLETED',
        latitude: { not: null },
        longitude: { not: null }
      },
      select: {
        latitude: true,
        longitude: true,
        amount: true
      }
    });

    // Group by location and calculate intensity
    const locationMap = new Map<string, { lat: number; lng: number; totalAmount: number; count: number }>();

    transactions.forEach((transaction: any) => {
      if (transaction.latitude && transaction.longitude) {
        const key = `${transaction.latitude.toFixed(4)}-${transaction.longitude.toFixed(4)}`;
        const existing = locationMap.get(key);
        
        if (existing) {
          existing.totalAmount += Number(transaction.amount);
          existing.count += 1;
        } else {
          locationMap.set(key, {
            lat: transaction.latitude,
            lng: transaction.longitude,
            totalAmount: Number(transaction.amount),
            count: 1
          });
        }
      }
    });

    // Convert to heatmap data
    const heatmapData: HeatmapData[] = Array.from(locationMap.values()).map(location => ({
      lat: location.lat,
      lng: location.lng,
      intensity: Math.min(location.totalAmount / 100, 1), // Normalize intensity
      amount: location.totalAmount
    }));

    const response: ApiResponse = {
      success: true,
      data: heatmapData,
      message: 'Heatmap data retrieved successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
});

// Get spending by location
router.get('/locations', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { period = '30' } = req.query;

    const days = Number(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get spending by location
    const locationData = await prisma.transaction.groupBy({
      by: ['location'],
      where: {
        userId,
        date: { gte: startDate },
        status: 'COMPLETED',
        location: { not: null }
      },
      _sum: { amount: true },
      _count: { location: true },
      orderBy: { _sum: { amount: 'desc' } }
    });

    const locations = locationData.map((item: any) => ({
      location: item.location,
      totalSpent: Number(item._sum.amount || 0),
      transactionCount: item._count.location,
      averageSpent: Number(item._sum.amount || 0) / item._count.location
    }));

    const response: ApiResponse = {
      success: true,
      data: locations,
      message: 'Location data retrieved successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
});

// Geocode address using Mapbox Geocoding API
router.post('/geocode', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { address } = req.body;

    if (!address) {
      throw new AppError('Address is required', 400);
    }

    const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN;
    
    if (!mapboxToken) {
      // Fallback to mock coordinates if no Mapbox token
      const mockCoordinates = {
        lat: 37.2296 + (Math.random() - 0.5) * 0.1,
        lng: -80.4139 + (Math.random() - 0.5) * 0.1
      };

      const response: ApiResponse = {
        success: true,
        data: {
          address,
          coordinates: mockCoordinates
        },
        message: 'Address geocoded successfully (mock)'
      };

      return res.status(200).json(response);
    }

    // Use Mapbox Geocoding API
    const encodedAddress = encodeURIComponent(address);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${mapboxToken}&limit=1`;

    const geocodeResponse = await fetch(url);
    
    if (!geocodeResponse.ok) {
      throw new AppError('Geocoding service unavailable', 503);
    }

    const geocodeData = await geocodeResponse.json() as any;

    if (geocodeData.features && geocodeData.features.length > 0) {
      const [lng, lat] = geocodeData.features[0].center;
      
      const response: ApiResponse = {
        success: true,
        data: {
          address: geocodeData.features[0].place_name,
          coordinates: { lat, lng }
        },
        message: 'Address geocoded successfully'
      };

      return res.status(200).json(response);
    } else {
      throw new AppError('Address not found', 404);
    }
  } catch (error) {
    return next(error);
  }
});

// Reverse geocode coordinates using Mapbox Geocoding API
router.post('/reverse-geocode', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { lat, lng } = req.body;

    if (!lat || !lng) {
      throw new AppError('Latitude and longitude are required', 400);
    }

    const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN;
    
    if (!mapboxToken) {
      // Fallback to mock address if no Mapbox token
      const mockAddress = `Mock Address for ${lat}, ${lng}`;

      const response: ApiResponse = {
        success: true,
        data: {
          address: mockAddress,
          coordinates: { lat: Number(lat), lng: Number(lng) }
        },
        message: 'Coordinates reverse geocoded successfully (mock)'
      };

      return res.status(200).json(response);
    }

    // Use Mapbox Reverse Geocoding API
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}&limit=1`;

    const reverseGeocodeResponse = await fetch(url);
    
    if (!reverseGeocodeResponse.ok) {
      throw new AppError('Reverse geocoding service unavailable', 503);
    }

    const reverseGeocodeData = await reverseGeocodeResponse.json() as any;

    if (reverseGeocodeData.features && reverseGeocodeData.features.length > 0) {
      const address = reverseGeocodeData.features[0].place_name;
      
      const response: ApiResponse = {
        success: true,
        data: {
          address,
          coordinates: { lat: Number(lat), lng: Number(lng) }
        },
        message: 'Coordinates reverse geocoded successfully'
      };

      return res.status(200).json(response);
    } else {
      throw new AppError('Location not found', 404);
    }
  } catch (error) {
    return next(error);
  }
});

export default router;
