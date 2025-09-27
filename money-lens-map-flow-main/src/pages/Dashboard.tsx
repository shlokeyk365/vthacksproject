import { motion } from "framer-motion";
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

export default function Dashboard() {
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

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <motion.div
        className="hero-gradient rounded-xl p-8 text-center"
        variants={itemVariants}
      >
        <h1 className="text-3xl font-bold mb-2">Welcome back to MoneyLens</h1>
        <p className="text-lg opacity-90">
          Track your financial journey with intelligent insights
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={itemVariants}
      >
        <StatsCard
          title="Total Spent This Month"
          value="$2,847"
          change="+12%"
          changeType="negative"
          icon={<DollarSign className="w-6 h-6" />}
          variant="primary"
        />
        
        <StatsCard
          title="Active Spending Caps"
          value="8"
          change="2 new"
          changeType="positive"
          icon={<Target className="w-6 h-6" />}
          variant="default"
        />
        
        <StatsCard
          title="Locked Cards"
          value="0"
          change="All active"
          changeType="positive"
          icon={<CheckCircle className="w-6 h-6" />}
          variant="success"
        />
        
        <StatsCard
          title="Top Category"
          value="Dining"
          change="$486 spent"
          changeType="neutral"
          icon={<TrendingUp className="w-6 h-6" />}
          variant="default"
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div className="lg:col-span-2 space-y-6" variants={itemVariants}>
          <SpendingChart />
          <RecentTransactions />
        </motion.div>
        
        <motion.div className="space-y-6" variants={itemVariants}>
          <QuickActions />
          
          {/* Budget Status */}
          <div className="card-gradient p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Budget Status</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Monthly Budget</span>
                <span className="font-semibold">$3,500</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: '81%' }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>$2,847 spent</span>
                <span>$653 remaining</span>
              </div>
            </div>
          </div>
          
          {/* Alerts */}
          <div className="card-gradient p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Smart Alerts
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                <p className="text-sm font-medium text-warning">
                  High Dining Spending
                </p>
                <p className="text-xs text-muted-foreground">
                  You've spent 150% more on dining this month
                </p>
              </div>
              <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                <p className="text-sm font-medium text-success">
                  Transportation Under Budget
                </p>
                <p className="text-xs text-muted-foreground">
                  You're $85 under your transportation budget
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}