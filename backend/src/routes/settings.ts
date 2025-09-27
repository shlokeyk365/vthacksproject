import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse, AuthenticatedRequest, UserSettings } from '../types';

const router = express.Router();
const prisma = new PrismaClient();

// Get user settings
router.get('/', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        preferences: true,
        monthlyBudgetGoal: true
      }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const preferences = user.preferences as any || {};

    const settings: UserSettings = {
      notifications: {
        capAlerts: preferences.notifications?.capAlerts ?? true,
        weeklyReports: preferences.notifications?.weeklyReports ?? true,
        budgetWarnings: preferences.notifications?.budgetWarnings ?? true,
        transactionAlerts: preferences.notifications?.transactionAlerts ?? false
      },
      map: {
        defaultLocation: preferences.map?.defaultLocation ?? 'Blacksburg, VA',
        mapboxToken: preferences.map?.mapboxToken,
        showHeatmap: preferences.map?.showHeatmap ?? true,
        showMerchantPins: preferences.map?.showMerchantPins ?? true
      },
      theme: preferences.theme ?? 'light'
    };

    const response: ApiResponse = {
      success: true,
      data: settings,
      message: 'Settings retrieved successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// Update user settings
router.put('/', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const settings: UserSettings = req.body;

    // Validate settings structure
    if (!settings.notifications || !settings.map) {
      throw new AppError('Invalid settings structure', 400);
    }

    // Get current user preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const currentPreferences = user.preferences as any || {};

    // Merge with new settings
    const updatedPreferences = {
      ...currentPreferences,
      notifications: {
        ...currentPreferences.notifications,
        ...settings.notifications
      },
      map: {
        ...currentPreferences.map,
        ...settings.map
      },
      theme: settings.theme
    };

    // Update user preferences
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { preferences: updatedPreferences },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        monthlyBudgetGoal: true,
        preferences: true,
        updatedAt: true
      }
    });

    const response: ApiResponse = {
      success: true,
      data: updatedUser,
      message: 'Settings updated successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// Get notification preferences
router.get('/notifications', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const preferences = user.preferences as any || {};
    const notifications = preferences.notifications || {
      capAlerts: true,
      weeklyReports: true,
      budgetWarnings: true,
      transactionAlerts: false
    };

    const response: ApiResponse = {
      success: true,
      data: notifications,
      message: 'Notification preferences retrieved successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// Update notification preferences
router.put('/notifications', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { capAlerts, weeklyReports, budgetWarnings, transactionAlerts } = req.body;

    // Validate notification settings
    if (typeof capAlerts !== 'boolean' || 
        typeof weeklyReports !== 'boolean' || 
        typeof budgetWarnings !== 'boolean' || 
        typeof transactionAlerts !== 'boolean') {
      throw new AppError('All notification settings must be boolean values', 400);
    }

    // Get current user preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const currentPreferences = user.preferences as any || {};

    // Update notification preferences
    const updatedPreferences = {
      ...currentPreferences,
      notifications: {
        ...currentPreferences.notifications,
        capAlerts,
        weeklyReports,
        budgetWarnings,
        transactionAlerts
      }
    };

    // Update user preferences
    await prisma.user.update({
      where: { id: userId },
      data: { preferences: updatedPreferences }
    });

    const response: ApiResponse = {
      success: true,
      data: {
        capAlerts,
        weeklyReports,
        budgetWarnings,
        transactionAlerts
      },
      message: 'Notification preferences updated successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// Get map settings
router.get('/map', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const preferences = user.preferences as any || {};
    const mapSettings = preferences.map || {
      defaultLocation: 'Blacksburg, VA',
      showHeatmap: true,
      showMerchantPins: true
    };

    const response: ApiResponse = {
      success: true,
      data: mapSettings,
      message: 'Map settings retrieved successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// Update map settings
router.put('/map', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { defaultLocation, mapboxToken, showHeatmap, showMerchantPins } = req.body;

    // Validate map settings
    if (typeof showHeatmap !== 'boolean' || typeof showMerchantPins !== 'boolean') {
      throw new AppError('showHeatmap and showMerchantPins must be boolean values', 400);
    }

    // Get current user preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const currentPreferences = user.preferences as any || {};

    // Update map settings
    const updatedPreferences = {
      ...currentPreferences,
      map: {
        ...currentPreferences.map,
        defaultLocation: defaultLocation || currentPreferences.map?.defaultLocation || 'Blacksburg, VA',
        mapboxToken: mapboxToken || currentPreferences.map?.mapboxToken,
        showHeatmap,
        showMerchantPins
      }
    };

    // Update user preferences
    await prisma.user.update({
      where: { id: userId },
      data: { preferences: updatedPreferences }
    });

    const response: ApiResponse = {
      success: true,
      data: {
        defaultLocation: updatedPreferences.map.defaultLocation,
        mapboxToken: updatedPreferences.map.mapboxToken,
        showHeatmap,
        showMerchantPins
      },
      message: 'Map settings updated successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// Export user data
router.get('/export', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;

    // Get all user data
    const [user, transactions, caps, notifications] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          monthlyBudgetGoal: true,
          preferences: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { date: 'desc' }
      }),
      prisma.spendingCap.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const exportData = {
      user,
      transactions,
      spendingCaps: caps,
      notifications,
      exportedAt: new Date().toISOString()
    };

    const response: ApiResponse = {
      success: true,
      data: exportData,
      message: 'Data exported successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
