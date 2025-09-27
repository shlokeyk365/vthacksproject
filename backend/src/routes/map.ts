import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse, AuthenticatedRequest, MapMerchant, HeatmapData } from '../types';

const router = express.Router();
const prisma = new PrismaClient();

// Get merchants with coordinates
router.get('/merchants', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { period = '30' } = req.query;

    const days = Number(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get merchants with spending data
    const merchantData = await prisma.transaction.groupBy({
      by: ['merchant', 'latitude', 'longitude'],
      where: {
        userId,
        date: { gte: startDate },
        status: 'COMPLETED',
        latitude: { not: null },
        longitude: { not: null }
      },
      _sum: { amount: true },
      _count: { merchant: true },
      orderBy: { _sum: { amount: 'desc' } }
    });

    const merchants: MapMerchant[] = merchantData.map((item: any) => ({
      id: `${item.merchant}-${item.latitude}-${item.longitude}`,
      name: item.merchant,
      address: 'Address not available', // This would be enriched with geocoding
      totalSpent: Number(item._sum.amount || 0),
      visits: item._count.merchant,
      category: 'Unknown', // This would be determined from transaction categories
      coordinates: {
        lat: Number(item.latitude),
        lng: Number(item.longitude)
      }
    }));

    const response: ApiResponse = {
      success: true,
      data: merchants,
      message: 'Merchants retrieved successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
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
    next(error);
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
    next(error);
  }
});

// Geocode address (placeholder for Mapbox integration)
router.post('/geocode', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { address } = req.body;

    if (!address) {
      throw new AppError('Address is required', 400);
    }

    // This is a placeholder - in production, you'd integrate with Mapbox Geocoding API
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
      message: 'Address geocoded successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// Reverse geocode coordinates (placeholder for Mapbox integration)
router.post('/reverse-geocode', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { lat, lng } = req.body;

    if (!lat || !lng) {
      throw new AppError('Latitude and longitude are required', 400);
    }

    // This is a placeholder - in production, you'd integrate with Mapbox Geocoding API
    const mockAddress = `Mock Address for ${lat}, ${lng}`;

    const response: ApiResponse = {
      success: true,
      data: {
        address: mockAddress,
        coordinates: { lat: Number(lat), lng: Number(lng) }
      },
      message: 'Coordinates reverse geocoded successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
