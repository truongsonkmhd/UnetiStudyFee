import { Card, CardContent } from "@/components/ui/card"
import { 
  Building, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Users
} from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  icon: React.ElementType
  trend?: 'up' | 'down' | 'neutral'
  color?: string
}

function StatCard({ title, value, change, icon: Icon, trend, color = "text-primary" }: StatCardProps) {
  const trendColor = trend === 'up' ? 'text-accent' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
  
  return (
    <Card className="hover:shadow-construction transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-foreground">
                {value}
              </h3>
              {change && (
                <span className={`text-sm font-medium ${trendColor} flex items-center gap-1`}>
                  {trend === 'up' && <TrendingUp className="w-3 h-3" />}
                  {change}
                </span>
              )}
            </div>
          </div>
          <div className={`${color} bg-muted rounded-lg p-3`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface DashboardStatsProps {
  stats: {
    totalProjects: number
    activeProjects: number
    completedProjects: number
    delayedProjects: number
    teamMembers: number
    avgProgress: number
  }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <StatCard
        title="Tổng Dự Án"
        value={stats.totalProjects}
        icon={Building}
        color="text-primary"
      />
      
      <StatCard
        title="Dự Án Đang Hoạt Động"
        value={stats.activeProjects}
        change="+12%"
        trend="up"
        icon={Clock}
        color="text-status-active"
      />
      
      <StatCard
        title="Đã Hoàn Thành"
        value={stats.completedProjects}
        change="+8%"
        trend="up"
        icon={CheckCircle}
        color="text-status-completed"
      />
      
      <StatCard
        title="Bị Trễ"
        value={stats.delayedProjects}
        change="-3%"
        trend="down"
        icon={AlertTriangle}
        color="text-status-delayed"
      />
      
      <StatCard
        title="Thành Viên Nhóm"
        value={stats.teamMembers}
        icon={Users}
        color="text-secondary"
      />
      
      <StatCard
        title="Tiến Độ TB"
        value={`${stats.avgProgress}%`}
        change="+5%"
        trend="up"
        icon={TrendingUp}
        color="text-accent"
      />
    </div>
  )
}