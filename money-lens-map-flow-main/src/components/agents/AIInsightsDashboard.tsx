import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  Target,
  Zap,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  Eye,
  BrainCircuit
} from 'lucide-react';

interface AIInsight {
  id: string;
  type: 'spending_trend' | 'risk_alert' | 'pattern_anomaly' | 'recommendation' | 'prediction';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  timestamp: number;
  actionable: boolean;
  suggestedAction?: string;
}

interface AIPrediction {
  type: 'spending_forecast' | 'risk_prediction' | 'merchant_visit_probability';
  value: number;
  confidence: number;
  timeframe: string;
  factors: string[];
}

interface AutonomousAction {
  id: string;
  type: 'auto_block' | 'auto_approve' | 'auto_alert' | 'auto_geofence' | 'auto_limit_adjust';
  description: string;
  executed: boolean;
  timestamp: number;
  parameters: any;
}

export const AIInsightsDashboard: React.FC = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [predictions, setPredictions] = useState<AIPrediction[]>([]);
  const [autonomousActions, setAutonomousActions] = useState<AutonomousAction[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockInsights: AIInsight[] = [
      {
        id: '1',
        type: 'spending_trend',
        title: 'High Daily Spending Detected',
        description: 'Average daily spending is $85.50, which is 25% above your normal levels.',
        severity: 'high',
        confidence: 85,
        timestamp: Date.now() - 300000,
        actionable: true,
        suggestedAction: 'Consider setting daily spending limits or reviewing recent purchases.'
      },
      {
        id: '2',
        type: 'pattern_anomaly',
        title: 'Unusual Spending Pattern at Starbucks',
        description: 'High average spending of $12.50 with 8 visits this week.',
        severity: 'medium',
        confidence: 75,
        timestamp: Date.now() - 600000,
        actionable: true,
        suggestedAction: 'Review spending at this merchant and consider setting spending caps.'
      },
      {
        id: '3',
        type: 'recommendation',
        title: 'Food Spending Optimization',
        description: 'Food spending represents 45% of total spending this month.',
        severity: 'medium',
        confidence: 80,
        timestamp: Date.now() - 900000,
        actionable: true,
        suggestedAction: 'Consider meal planning or cooking at home to reduce food expenses.'
      }
    ];

    const mockPredictions: AIPrediction[] = [
      {
        type: 'spending_forecast',
        value: 450,
        confidence: 70,
        timeframe: 'next_week',
        factors: ['Historical patterns', 'Seasonal trends', 'Recent behavior']
      },
      {
        type: 'merchant_visit_probability',
        value: 0.6,
        confidence: 65,
        timeframe: 'next_3_days',
        factors: ['Visit frequency', 'Location proximity', 'Spending patterns']
      }
    ];

    const mockActions: AutonomousAction[] = [
      {
        id: '1',
        type: 'auto_alert',
        description: 'Autonomous alert triggered for high Starbucks spending',
        executed: true,
        timestamp: Date.now() - 120000,
        parameters: { merchant: 'Starbucks', amount: 45.67 }
      },
      {
        id: '2',
        type: 'auto_geofence',
        description: 'Auto-created geofence for high-risk shopping area',
        executed: true,
        timestamp: Date.now() - 300000,
        parameters: { location: 'downtown', radius: 200 }
      }
    ];

    setInsights(mockInsights);
    setPredictions(mockPredictions);
    setAutonomousActions(mockActions);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <AlertTriangle className="w-4 h-4" />;
      case 'low': return <Eye className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'spending_trend': return <TrendingUp className="w-4 h-4" />;
      case 'risk_alert': return <AlertTriangle className="w-4 h-4" />;
      case 'pattern_anomaly': return <BarChart3 className="w-4 h-4" />;
      case 'recommendation': return <Lightbulb className="w-4 h-4" />;
      case 'prediction': return <Target className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'auto_block': return <XCircle className="w-4 h-4" />;
      case 'auto_approve': return <CheckCircle className="w-4 h-4" />;
      case 'auto_alert': return <AlertTriangle className="w-4 h-4" />;
      case 'auto_geofence': return <Target className="w-4 h-4" />;
      case 'auto_limit_adjust': return <BarChart3 className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const runAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      // Add new insight
      const newInsight: AIInsight = {
        id: Date.now().toString(),
        type: 'recommendation',
        title: 'AI Analysis Complete',
        description: 'Deep analysis completed. New patterns and insights have been generated.',
        severity: 'low',
        confidence: 90,
        timestamp: Date.now(),
        actionable: false
      };
      setInsights(prev => [newInsight, ...prev]);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BrainCircuit className="w-8 h-8 text-purple-600" />
          <div>
            <h2 className="text-2xl font-bold">AI Insights Dashboard</h2>
            <p className="text-muted-foreground">Advanced agentic AI analysis and autonomous actions</p>
          </div>
        </div>
        <Button
          onClick={runAnalysis}
          disabled={isAnalyzing}
          className="flex items-center gap-2"
        >
          {isAnalyzing ? (
            <Activity className="w-4 h-4 animate-spin" />
          ) : (
            <Brain className="w-4 h-4" />
          )}
          {isAnalyzing ? 'Analyzing...' : 'Run AI Analysis'}
        </Button>
      </div>

      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="actions">Autonomous Actions</TabsTrigger>
        </TabsList>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {insights.map((insight) => (
              <Card key={`insight-${insight.id}`} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(insight.type)}
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getSeverityColor(insight.severity)} text-white`}>
                        {insight.severity}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatTimestamp(insight.timestamp)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Confidence:</span>
                    <Progress value={insight.confidence} className="flex-1" />
                    <span className="text-sm">{insight.confidence}%</span>
                  </div>

                  {insight.actionable && insight.suggestedAction && (
                    <Alert>
                      <Lightbulb className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Suggested Action:</strong> {insight.suggestedAction}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          <div className="grid gap-4">
            {predictions.map((prediction, index) => (
              <Card key={`prediction-${prediction.type}-${index}`}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    <CardTitle className="text-lg">
                      {prediction.type.replace('_', ' ').toUpperCase()}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-2xl font-bold">
                    {prediction.type === 'merchant_visit_probability' 
                      ? `${(prediction.value * 100).toFixed(0)}%`
                      : `$${prediction.value.toFixed(2)}`
                    }
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Confidence:</span>
                    <Progress value={prediction.confidence} className="flex-1" />
                    <span className="text-sm">{prediction.confidence}%</span>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <strong>Timeframe:</strong> {prediction.timeframe.replace('_', ' ')}
                  </div>

                  <div className="space-y-1">
                    <span className="text-sm font-medium">Factors:</span>
                    <ul className="text-sm text-muted-foreground list-disc list-inside">
                      {prediction.factors.map((factor, i) => (
                        <li key={i}>{factor}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Autonomous Actions Tab */}
        <TabsContent value="actions" className="space-y-4">
          <div className="grid gap-4">
            {autonomousActions.map((action) => (
              <Card key={`action-${action.id}`} className="border-gray-700 bg-gray-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getActionIcon(action.type)}
                      <CardTitle className="text-lg text-white">
                        {action.type.replace('auto_', '').toUpperCase()} Action
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      {action.executed ? (
                        <Badge className="bg-green-600 text-white border-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Executed
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-600 text-white border-yellow-700">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                      <span className="text-sm text-white">
                        {formatTimestamp(action.timestamp)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white mb-3">{action.description}</p>
                  
                  {action.parameters && (
                    <div className="text-xs text-white bg-gray-700 p-2 rounded">
                      <strong className="text-white">Parameters:</strong> {JSON.stringify(action.parameters, null, 2)}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
