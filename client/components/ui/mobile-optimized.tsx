import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp, Smartphone, Tablet, Monitor } from 'lucide-react'

interface MobileCardProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  collapsible?: boolean
  defaultExpanded?: boolean
  className?: string
}

export function MobileCard({ 
  title, 
  subtitle, 
  children, 
  collapsible = false, 
  defaultExpanded = true,
  className 
}: MobileCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <Card className={cn('glass-effect', className)}>
      <CardContent className="p-4">
        <div 
          className={cn(
            'flex items-center justify-between',
            collapsible && 'cursor-pointer'
          )}
          onClick={() => collapsible && setIsExpanded(!isExpanded)}
        >
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-base">{title}</h3>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          {collapsible && (
            <Button variant="ghost" size="sm" className="p-1">
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
        
        {isExpanded && (
          <div className="mt-4">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface MobileStatsProps {
  stats: {
    label: string
    value: string | number
    change?: {
      value: number
      isPositive: boolean
    }
    icon?: React.ReactNode
  }[]
  className?: string
}

export function MobileStats({ stats, className }: MobileStatsProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-3', className)}>
      {stats.map((stat, index) => (
        <Card key={index} className="glass-effect">
          <CardContent className="p-3">
            <div className="text-center space-y-1">
              {stat.icon && (
                <div className="flex justify-center">
                  {stat.icon}
                </div>
              )}
              <div className="text-lg font-bold text-foreground">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground">
                {stat.label}
              </div>
              {stat.change && (
                <div className={cn(
                  'text-xs font-medium',
                  stat.change.isPositive ? 'text-green-600' : 'text-red-600'
                )}>
                  {stat.change.isPositive ? '+' : ''}{stat.change.value}%
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

interface ResponsiveLayoutProps {
  children: React.ReactNode
  className?: string
}

export function ResponsiveLayout({ children, className }: ResponsiveLayoutProps) {
  return (
    <div className={cn(
      'min-h-screen gradient-bg',
      'px-4 py-6',
      'sm:px-6 sm:py-8',
      'md:px-8 md:py-10',
      'lg:px-12 lg:py-12',
      className
    )}>
      {children}
    </div>
  )
}

interface DeviceIndicatorProps {
  className?: string
}

export function DeviceIndicator({ className }: DeviceIndicatorProps) {
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  React.useEffect(() => {
    const updateDevice = () => {
      const width = window.innerWidth
      if (width < 768) setDevice('mobile')
      else if (width < 1024) setDevice('tablet')
      else setDevice('desktop')
    }

    updateDevice()
    window.addEventListener('resize', updateDevice)
    return () => window.removeEventListener('resize', updateDevice)
  }, [])

  const getDeviceIcon = () => {
    switch (device) {
      case 'mobile': return <Smartphone className="h-4 w-4" />
      case 'tablet': return <Tablet className="h-4 w-4" />
      case 'desktop': return <Monitor className="h-4 w-4" />
    }
  }

  return (
    <Badge variant="outline" className={cn('flex items-center space-x-1', className)}>
      {getDeviceIcon()}
      <span className="text-xs capitalize">{device}</span>
    </Badge>
  )
}

interface MobileFloatingActionProps {
  onAction: () => void
  icon: React.ReactNode
  label: string
  className?: string
}

export function MobileFloatingAction({ 
  onAction, 
  icon, 
  label, 
  className 
}: MobileFloatingActionProps) {
  return (
    <div className={cn(
      'fixed bottom-6 right-6 z-50',
      'md:hidden',
      className
    )}>
      <Button
        onClick={onAction}
        size="lg"
        className="rounded-full shadow-lg h-14 w-14 p-0"
      >
        {icon}
      </Button>
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
        <div className="bg-foreground text-background text-xs px-2 py-1 rounded">
          {label}
        </div>
      </div>
    </div>
  )
}

interface MobileTabProps {
  tabs: {
    id: string
    label: string
    icon?: React.ReactNode
    content: React.ReactNode
  }[]
  defaultTab?: string
  className?: string
}

export function MobileTab({ tabs, defaultTab, className }: MobileTabProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  return (
    <div className={cn('space-y-4', className)}>
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-secondary/20 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {tabs.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>
  )
}
