import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Users, TrendingUp, DollarSign, Crown, Medal, Award, UserPlus, Mail, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Leaderboard() {
  const [leaderboardType, setLeaderboardType] = useState<'savings' | 'spending'>('savings');
  const [period, setPeriod] = useState('30');
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  // Mock data for demonstration
  const mockLeaderboardData = [
    {
      userId: '1',
      name: 'You',
      email: 'you@example.com',
      budget: 3500,
      spent: 2847,
      savings: 653,
      savingsPercentage: 18.7,
      remaining: 653
    }
  ];

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">
          {index + 1}
        </span>;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 1:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 2:
        return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
      default:
        return 'bg-muted';
    }
  };

  const sendFriendRequest = () => {
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }
    toast.success('Friend request sent successfully!');
    setInviteEmail('');
    setIsInviteDialogOpen(false);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="w-8 h-8 text-primary" />
            Leaderboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Compete with friends and see who saves the most money
          </p>
        </div>
        
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Invite Friends
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite a Friend</DialogTitle>
              <DialogDescription>
                Send a friend request to compete on the leaderboard
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="friend@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={sendFriendRequest}>
                  Send Invite
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="leaderboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="friends">Friends (0)</TabsTrigger>
          <TabsTrigger value="requests">Requests (0)</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="space-y-6">
          <div className="flex gap-4 items-center">
            <Select value={leaderboardType} onValueChange={(value: 'savings' | 'spending') => setLeaderboardType(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="savings">Savings Leaderboard</SelectItem>
                <SelectItem value="spending">Spending Leaderboard</SelectItem>
              </SelectContent>
            </Select>

            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                {leaderboardType === 'savings' ? 'Savings Leaderboard' : 'Spending Leaderboard'}
              </CardTitle>
              <CardDescription>
                {leaderboardType === 'savings' 
                  ? 'Ranked by total savings (budget - spent)'
                  : 'Ranked by lowest spending (most frugal)'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockLeaderboardData.map((entry, index) => (
                  <div
                    key={entry.userId}
                    className={`flex items-center gap-4 p-4 border rounded-lg transition-all hover:shadow-md ${
                      index < 3 ? getRankColor(index) : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center justify-center w-8 h-8">
                      {getRankIcon(index)}
                    </div>
                    
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {entry.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{entry.name}</div>
                      <div className="text-sm opacity-75 truncate">{entry.email}</div>
                    </div>

                    <div className="text-right">
                      {leaderboardType === 'savings' ? (
                        <div>
                          <div className="font-bold text-lg">
                            ${entry.savings.toLocaleString()}
                          </div>
                          <div className="text-sm opacity-75">
                            {entry.savingsPercentage.toFixed(1)}% saved
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-bold text-lg">
                            ${entry.spent.toLocaleString()}
                          </div>
                          <div className="text-sm opacity-75">
                            ${entry.remaining?.toLocaleString()} remaining
                          </div>
                        </div>
                      )}
                    </div>

                    {index < 3 && (
                      <Badge variant="secondary" className="ml-2">
                        #{index + 1}
                      </Badge>
                    )}
                  </div>
                ))}

                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No friends to compare with yet.</p>
                  <p className="text-sm">Invite some friends to start competing!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="friends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Your Friends (0)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No friends yet.</p>
                <p className="text-sm">Send friend requests to start competing!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Friend Requests (0)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No pending friend requests.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}