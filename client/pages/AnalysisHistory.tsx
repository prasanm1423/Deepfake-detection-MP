import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Eye, 
  Calendar,
  FileText,
  Camera,
  Zap,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  getUserAnalysisHistory, 
  getUserAnalysisStats, 
  deleteAnalysis, 
  searchAnalyses,
  type AnalysisHistory,
  type AnalysisStats
} from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'

export default function AnalysisHistory() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [analyses, setAnalyses] = useState<AnalysisHistory[]>([])
  const [stats, setStats] = useState<AnalysisStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterRisk, setFilterRisk] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const itemsPerPage = 12

  useEffect(() => {
    loadData()
  }, [currentPage, filterType, filterRisk])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load analysis history
      const offset = (currentPage - 1) * itemsPerPage
      const { data: historyData, error: historyError } = await getUserAnalysisHistory(itemsPerPage, offset)
      
      if (historyError) {
        console.error('Error loading analysis history:', historyError)
        toast({
          title: "Error",
          description: "Failed to load analysis history",
          variant: "destructive",
        })
      } else {
        setAnalyses(historyData || [])
      }

      // Load stats
      const { data: statsData, error: statsError } = await getUserAnalysisStats()
      
      if (statsError) {
        console.error('Error loading stats:', statsError)
      } else {
        setStats(statsData)
      }
    } catch (error) {
      console.error('Error in loadData:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadData()
      return
    }

    setLoading(true)
    try {
      const { data, error } = await searchAnalyses(searchQuery)
      
      if (error) {
        console.error('Error searching analyses:', error)
        toast({
          title: "Error",
          description: "Failed to search analyses",
          variant: "destructive",
        })
      } else {
        setAnalyses(data || [])
        setCurrentPage(1)
      }
    } catch (error) {
      console.error('Error in handleSearch:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (analysisId: string) => {
    if (!confirm('Are you sure you want to delete this analysis? This action cannot be undone.')) {
      return
    }

    setDeletingId(analysisId)
    try {
      const { error } = await deleteAnalysis(analysisId)
      
      if (error) {
        console.error('Error deleting analysis:', error)
        toast({
          title: "Error",
          description: "Failed to delete analysis",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Analysis deleted successfully",
        })
        loadData() // Reload data
      }
    } catch (error) {
      console.error('Error in handleDelete:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getAnalysisIcon = (type: string) => {
    switch (type) {
      case 'image': return <Camera className="h-4 w-4" />
      case 'video': return <FileText className="h-4 w-4" />
      case 'audio': return <Zap className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredAnalyses = analyses.filter(analysis => {
    if (filterType !== 'all' && analysis.analysis_type !== filterType) return false
    if (filterRisk !== 'all' && analysis.risk_level !== filterRisk) return false
    if (dateFrom) {
      const from = new Date(dateFrom)
      const created = new Date(analysis.created_at)
      if (created < from) return false
    }
    if (dateTo) {
      const to = new Date(dateTo)
      const created = new Date(analysis.created_at)
      // include end date full day
      const endOfDay = new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59, 999)
      if (created > endOfDay) return false
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      const name = (analysis.file_name || '').toLowerCase()
      if (!name.includes(q)) return false
    }
    return true
  })

  if (loading && analyses.length === 0) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading analysis history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg animate-in fade-in duration-500">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Analysis History</h1>
              <p className="text-muted-foreground">
                View all your deepfake detection analyses
              </p>
            </div>
          </div>
          <Button onClick={loadData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="glass-effect">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Analyses</p>
                    <p className="text-2xl font-bold text-foreground">{stats.total_analyses}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <div>
                    <p className="text-sm text-muted-foreground">Authentic</p>
                    <p className="text-2xl font-bold text-success">{stats.authentic_count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-danger" />
                  <div>
                    <p className="text-sm text-muted-foreground">Deepfakes</p>
                    <p className="text-2xl font-bold text-danger">{stats.deepfake_count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Confidence</p>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.avg_confidence ? (stats.avg_confidence * 100).toFixed(1) : '0'}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        <Card className="glass-effect mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by filename..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterRisk} onValueChange={setFilterRisk}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Risk Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risks</SelectItem>
                  <SelectItem value="LOW">Low Risk</SelectItem>
                  <SelectItem value="MEDIUM">Medium Risk</SelectItem>
                  <SelectItem value="HIGH">High Risk</SelectItem>
                  <SelectItem value="CRITICAL">Critical Risk</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-36"
                  />
                  <span className="text-sm text-muted-foreground">to</span>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-36"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Grid */}
        {filteredAnalyses.length === 0 ? (
          <Card className="glass-effect">
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Analyses Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || filterType !== 'all' || filterRisk !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Start by uploading a file for analysis'
                }
              </p>
              {!searchQuery && filterType === 'all' && filterRisk === 'all' && (
                <Button onClick={() => navigate('/dashboard')}>
                  Go to Dashboard
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {filteredAnalyses.map((analysis) => (
              <Card key={analysis.id} className="glass-effect hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getAnalysisIcon(analysis.analysis_type)}
                      <Badge variant="outline" className="text-xs">
                        {analysis.analysis_type.toUpperCase()}
                      </Badge>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getRiskLevelColor(analysis.risk_level || 'LOW')}`}
                    >
                      {analysis.risk_level || 'LOW'}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm truncate">
                    {analysis.file_name || `Analysis ${analysis.id.slice(0, 8)}`}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Result:</span>
                      <div className="flex items-center space-x-1">
                        {analysis.is_deepfake ? (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        <span className={analysis.is_deepfake ? 'text-red-600' : 'text-green-600'}>
                          {analysis.is_deepfake ? 'Deepfake' : 'Authentic'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Confidence:</span>
                      <span className="font-medium">
                        {(analysis.confidence * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">File Size:</span>
                      <span className="font-medium">
                        {formatFileSize(analysis.file_size)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">
                        {formatDate(analysis.created_at)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate('/results', { 
                          state: { 
                            results: [analysis], 
                            currentResult: analysis 
                          } 
                        })}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(analysis.id)}
                        disabled={deletingId === analysis.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
