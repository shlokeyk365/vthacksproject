import { motion } from "framer-motion";
import { useRef } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  Target, 
  CreditCard, 
  AlertTriangle,
  CheckCircle 
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { SpendingChart } from "@/components/dashboard/SpendingChart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { BudgetStatus } from "@/components/dashboard/BudgetStatus";
import { SmartAlerts } from "@/components/dashboard/SmartAlerts";
import { DemoNotificationTrigger } from "@/components/agents/DemoNotificationTrigger";
import { useDashboardStats } from "@/hooks/useApi";
import { useFontScaling } from "@/hooks/useFontScaling";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: dashboardData, isLoading, error } = useDashboardStats();
  const statsGridRef = useRef<HTMLDivElement>(null);
  const scale = useFontScaling(statsGridRef);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="hero-gradient rounded-xl p-8 text-center">
          <Skeleton className="h-8 w-64 mx-auto mb-2" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card-gradient p-6 rounded-lg">
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="hero-gradient rounded-xl p-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Welcome back to MoneyLens</h1>
          <p className="text-lg opacity-90">
            Unable to load dashboard data. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const stats = dashboardData || {
    totalSpent: 0,
    monthlyBudget: 3500,
    budgetRemaining: 3500,
    activeCaps: 0,
    lockedCards: 0,
    topCategory: 'None',
    recentTransactions: [],
    spendingTrend: []
  };

  return (
    <motion.div
      className="h-full min-h-screen space-y-4 sm:space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <motion.div
        className="hero-gradient rounded-xl p-6 sm:p-8 text-center"
        variants={itemVariants}
      >
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back to MoneyLens</h1>
        <p className="text-base sm:text-lg opacity-90">
          Track your financial journey with intelligent insights
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        ref={statsGridRef}
        className="overflow-x-auto stats-grid-scroll relative"
        variants={itemVariants}
        style={{ fontSize: `${scale}rem` }}
      >
        <div className="@container grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 lg:gap-6 w-full">
          <div className="w-full">
            <StatsCard
              title="Total Spent This Month"
              value={`$${stats.totalSpent.toLocaleString()}`}
              change={`${((stats.totalSpent / stats.monthlyBudget) * 100).toFixed(0)}% of budget`}
              changeType={stats.totalSpent > stats.monthlyBudget ? "negative" : "positive"}
              icon={<DollarSign className="w-6 h-6" />}
              variant="primary"
            />
          </div>
          
          <div className="w-full">
            <StatsCard
              title="Active Spending Caps"
              value={stats.activeCaps.toString()}
              change="Active limits"
              changeType="positive"
              icon={<Target className="w-6 h-6" />}
              variant="default"
            />
          </div>
          
          <div className="w-full">
            <StatsCard
              title="Locked Cards"
              value={stats.lockedCards.toString()}
              change="All active"
              changeType="positive"
              icon={<CheckCircle className="w-6 h-6" />}
              variant="primary"
            />
          </div>
          
          <div className="w-full">
            <StatsCard
              title="Top Category"
              value={stats.topCategory}
              change="This month"
              changeType="neutral"
              icon={<TrendingUp className="w-6 h-6" />}
              variant="default"
            />
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div className="xl:col-span-2 space-y-6" variants={itemVariants}>
          <SpendingChart />
          
          {/* Budget Status and Smart Alerts side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BudgetStatus 
              monthlyBudget={stats.monthlyBudget} 
              totalSpent={stats.totalSpent} 
            />
            <SmartAlerts />
          </div>
          
          <RecentTransactions />
        </motion.div>
        
        <motion.div className="space-y-6" variants={itemVariants}>
          <QuickActions />
          
          {/* Demo Notification Trigger */}
          <DemoNotificationTrigger />
          
        </motion.div>
      </div>
    </motion.div>
  );
}