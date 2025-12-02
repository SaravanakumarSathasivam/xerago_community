"use client"

import { AwaitedReactNode, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Trophy, Medal, Award, Star, TrendingUp, Users, Calendar, Crown } from "lucide-react"

import { getLeaderboard, getLeaderboardSummary, getAchievements, getCommunityStats, getMyLeaderboardSummary, LeaderboardResponse, LeaderboardSummaryResponse, AchievementsResponse, CommunityStatsResponse, MyLeaderboardSummaryResponse } from "@/lib/api"
import { IUser } from '@/models/user';
import { IAchievement } from '@/models/achievement';
import { ILeaderboardUser, IEarnedAchievement } from '@/models/leaderboard';

interface LeaderboardProps {
  currentUser?: IUser | null;
}

export function Leaderboard({ currentUser }: LeaderboardProps) {
  const [activeTab, setActiveTab] = useState("overall")
  const [users, setUsers] = useState<ILeaderboardUser[]>([]);
  const [weekly, setWeekly] = useState<LeaderboardSummaryResponse['data']>({ period: '', leaderboard: [], metrics: { totalPoints: 0, totalUsers: 0, totalAchievements: 0 } })
  const [monthly, setMonthly] = useState<LeaderboardSummaryResponse['data']>({ period: '', leaderboard: [], metrics: { totalPoints: 0, totalUsers: 0, totalAchievements: 0 } })
  const [availableAchievements, setAvailableAchievements] = useState<IAchievement[]>([])
  const [communityStats, setCommunityStats] = useState<CommunityStatsResponse['data'] | undefined>()
  const [mySummary, setMySummary] = useState<MyLeaderboardSummaryResponse['data'] | undefined>()

  useEffect(() => {
    ;(async () => {
      try {
        const [leaderboardRes, weeklyRes, monthlyRes, achievementsRes, communityStatsRes, mySummaryRes] = await Promise.all([
          getLeaderboard(),
          getLeaderboardSummary('weekly'),
          getLeaderboardSummary('monthly'),
          getAchievements(),
          getCommunityStats(),
          getMyLeaderboardSummary(),
        ])
        setUsers(leaderboardRes.data?.leaderboard?.map((u: ILeaderboardUser) => ({
          ...u,
          id: u._id,
        })) || []);
        setWeekly(weeklyRes.data)
        setMonthly(monthlyRes.data)
        setAvailableAchievements(achievementsRes.data.achievements || [])
        setCommunityStats(communityStatsRes.data)
        setMySummary(mySummaryRes.data)
      } catch (error: unknown) {
        console.error("Error fetching leaderboard data:", error);
      }
    })()
  }, [])

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />
    return (
      <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">#{rank}</span>
    )
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-100 text-gray-700 border-gray-200"
      case "uncommon":
        return "bg-green-100 text-green-700 border-green-200"
      case "rare":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "epic":
        return "bg-purple-100 text-purple-700 border-purple-200"
      case "legendary":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const currentUserRank = currentUser ? users.findIndex((user: ILeaderboardUser) => user._id === currentUser._id) + 1 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Leaderboard & Achievements</h2>
          <p className="text-muted-foreground">See how you stack up against your colleagues</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Your Rank</p>
          <div className="flex items-center gap-2">
            {getRankIcon(currentUserRank || 999)}
            <span className="text-2xl font-bold">#{currentUserRank > 0 ? currentUserRank : "N/A"}</span>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overall">Overall</TabsTrigger>
          <TabsTrigger value="weekly">This Week</TabsTrigger>
          <TabsTrigger value="monthly">This Month</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overall" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Top Contributors - All Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user: ILeaderboardUser, index: number) => (
                  <div
                    key={user._id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      user._id === currentUser?._id ? "bg-blue-50 border-blue-200 dark:bg-blue-950/20" : "bg-card"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8">{getRankIcon(index + 1)}</div>
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback>
                          {user.name
                            ?.split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{user.name}</h3>
                          {user._id === currentUser?._id && (
                            <Badge variant="secondary" className="text-xs">
                              You
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{user.department}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            Level {user.gamification?.level}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="w-3 h-3" />
                            {user.gamification?.streak || 0} day streak
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{(user.gamification?.points || 0).toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">points</div>
                      <div className="flex gap-1 mt-2 justify-end">
                        {user.gamification?.badges?.slice(0, 2).map((badge: string, badgeIndex: number) => (
                          <Badge key={badgeIndex} variant="secondary" className="text-xs">
                            {badge}
                          </Badge>
                        ))}
                        {user.gamification?.badges && user.gamification.badges.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{user.gamification.badges.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-500" />
                This Week's Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weekly.leaderboard
                  .map((user: ILeaderboardUser, index: number) => (
                    <div
                      key={user._id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        user._id === currentUser?._id ? "bg-green-50 border-green-200 dark:bg-green-950/20" : "bg-card"
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8">{getRankIcon(index + 1)}</div>
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                          <AvatarFallback>
                            {user.name
                              ?.split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{user.name}</h3>
                            {user._id === currentUser?._id && (
                              <Badge variant="secondary" className="text-xs">
                                You
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{user.department}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600">+{user.weeklyPoints}</div>
                        <div className="text-sm text-muted-foreground">this week</div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                Monthly Leaders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthly.leaderboard?.map((user: ILeaderboardUser, index: number) => (
                    <div
                      key={user._id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        user._id === currentUser?._id
                          ? "bg-purple-50 border-purple-200 dark:bg-purple-950/20"
                          : "bg-card"
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8">{getRankIcon(index + 1)}</div>
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                          <AvatarFallback>
                            {user.name
                              ?.split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{user.name}</h3>
                            {user._id === currentUser?._id && (
                              <Badge variant="secondary" className="text-xs">
                                You
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{user.department}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-purple-600">+{user.monthlyPoints}</div>
                        <div className="text-sm text-muted-foreground">this month</div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-500" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Level Progress</span>
                    <span>Level {(mySummary?.level ?? currentUser?.gamification?.level) || 1}</span>
                  </div>
                  <Progress value={mySummary?.progressPercent ?? 0} className="h-2" />
                  <p className="text-xs text-muted-foreground">{(mySummary?.pointsToNext ?? 0)} points to next level</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{(mySummary?.points ?? currentUser?.gamification?.points) || 0}</div>
                    <div className="text-sm text-muted-foreground">Total Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{(mySummary?.earnedAchievements?.length ?? currentUser?.gamification?.achievements?.length) || 0}</div>
                    <div className="text-sm text-muted-foreground">Badges Earned</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-500" />
                  Community Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{communityStats?.activeMembers ?? 0}</div>
                    <div className="text-sm text-muted-foreground">Active Members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{communityStats?.totalPosts ?? 0}</div>
                    <div className="text-sm text-muted-foreground">Total Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{communityStats?.totalArticles ?? 0}</div>
                    <div className="text-sm text-muted-foreground">Knowledge Articles</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-teal-600">{communityStats?.helpfulAnswers ?? 0}</div>
                    <div className="text-sm text-muted-foreground">Helpful Answers</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Available Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableAchievements.map((achievement: IAchievement) => (
                  <div
                    key={achievement._id}
                    className={`p-4 rounded-lg border-2 ${getRarityColor(achievement.rarity)} ${
                      (mySummary?.earnedAchievements || []).some((ea: IEarnedAchievement) => ea.achievement._id === achievement._id)
                        ? "opacity-100"
                        : "opacity-60"
                    }`}
                  >
                    <div className="text-center space-y-2">
                      <div className="text-3xl">{achievement.icon}</div>
                      <h3 className="font-semibold">{achievement.name}</h3>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      <Badge variant="outline" className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                        {achievement.rarity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
