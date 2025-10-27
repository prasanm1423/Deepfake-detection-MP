import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, PieChart, TrendingUp, Activity } from 'lucide-react'
import { AnalysisResult } from '@shared/api'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface DashboardAnalyticsProps {
  results: AnalysisResult[]
}

export function DashboardAnalytics({ results }: DashboardAnalyticsProps) {
  // Generate mock trend data (last 7 days)
  const generateTrendData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return days.map((day, index) => {
      const dayResults = results.slice(index * 2, (index * 2) + 2)
      const deepfakes = dayResults.filter(r => r.isDeepfake).length
      const authentic = dayResults.filter(r => !r.isDeepfake).length
      
      return {
        name: day,
        deepfakes: deepfakes + Math.floor(Math.random() * 3),
        authentic: authentic + Math.floor(Math.random() * 5),
        total: deepfakes + authentic + Math.floor(Math.random() * 7)
      }
    })
  }

  // Media type distribution
  const getMediaDistribution = () => {
    const distribution = {
      image: results.filter(r => r.type === 'image').length,
      video: results.filter(r => r.type === 'video').length,
      audio: results.filter(r => r.type === 'audio').length,
    }
    
    return [
      { name: 'Images', value: distribution.image || 15, color: '#3b82f6' },
      { name: 'Videos', value: distribution.video || 8, color: '#10b981' },
      { name: 'Audio', value: distribution.audio || 3, color: '#f59e0b' },
    ]
  }

  // Confidence score distribution
  const getConfidenceDistribution = () => {
    const ranges = [
      { name: '0-20%', min: 0, max: 0.2, count: 0, color: '#10b981' },
      { name: '21-40%', min: 0.21, max: 0.4, count: 0, color: '#84cc16' },
      { name: '41-60%', min: 0.41, max: 0.6, count: 0, color: '#f59e0b' },
      { name: '61-80%', min: 0.61, max: 0.8, count: 0, color: '#f97316' },
      { name: '81-100%', min: 0.81, max: 1.0, count: 0, color: '#ef4444' },
    ]

    results.forEach(result => {
      const confidence = result.confidence
      const range = ranges.find(r => confidence >= r.min && confidence <= r.max)
      if (range) range.count++
    })

    // Add sample data if no results
    if (results.length === 0) {
      return [
        { name: '0-20%', count: 12, color: '#10b981' },
        { name: '21-40%', count: 8, color: '#84cc16' },
        { name: '41-60%', count: 5, color: '#f59e0b' },
        { name: '61-80%', count: 7, color: '#f97316' },
        { name: '81-100%', count: 10, color: '#ef4444' },
      ]
    }

    return ranges
  }

  // Risk level distribution
  const getRiskDistribution = () => {
    const riskCounts = {
      LOW: results.filter(r => r.riskLevel === 'LOW').length || 18,
      MEDIUM: results.filter(r => r.riskLevel === 'MEDIUM').length || 9,
      HIGH: results.filter(r => r.riskLevel === 'HIGH').length || 5,
      CRITICAL: results.filter(r => r.riskLevel === 'CRITICAL').length || 3,
    }

    return [
      { name: 'Low Risk', value: riskCounts.LOW, color: '#10b981' },
      { name: 'Medium Risk', value: riskCounts.MEDIUM, color: '#f59e0b' },
      { name: 'High Risk', value: riskCounts.HIGH, color: '#f97316' },
      { name: 'Critical', value: riskCounts.CRITICAL, color: '#ef4444' },
    ]
  }

  const trendData = generateTrendData()
  const mediaData = getMediaDistribution()
  const confidenceData = getConfidenceDistribution()
  const riskData = getRiskDistribution()

  const RADIAN = Math.PI / 180
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center space-x-2 mb-4">
        <Activity className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Analytics Overview</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <Card className="glass-effect hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span>Detection Trends (7 Days)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorDeepfakes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorAuthentic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                    color: 'hsl(var(--foreground))'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="deepfakes" 
                  stroke="#ef4444" 
                  fillOpacity={1} 
                  fill="url(#colorDeepfakes)"
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="authentic" 
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#colorAuthentic)"
                  strokeWidth={2}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '10px', color: 'hsl(var(--foreground))' }}
                  iconType="circle"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Media Type Distribution */}
        <Card className="glass-effect hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center space-x-2">
              <PieChart className="h-4 w-4 text-primary" />
              <span>Media Type Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPie>
                <Pie
                  data={mediaData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {mediaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                    color: 'hsl(var(--foreground))'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ color: 'hsl(var(--foreground))' }}
                />
              </RechartsPie>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Confidence Distribution */}
        <Card className="glass-effect hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span>Confidence Score Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={confidenceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                    color: 'hsl(var(--foreground))'
                  }}
                  cursor={{ fill: 'hsl(var(--primary) / 0.1)' }}
                />
                <Bar 
                  dataKey="count" 
                  radius={[8, 8, 0, 0]}
                  animationBegin={0}
                  animationDuration={800}
                >
                  {confidenceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Level Distribution */}
        <Card className="glass-effect hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center space-x-2">
              <Activity className="h-4 w-4 text-primary" />
              <span>Risk Level Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPie>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                    color: 'hsl(var(--foreground))'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ color: 'hsl(var(--foreground))' }}
                />
              </RechartsPie>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

