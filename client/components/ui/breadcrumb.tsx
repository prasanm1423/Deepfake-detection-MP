import { ChevronRight, Home } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  className?: string
  showHome?: boolean
}

export function Breadcrumb({ items = [], className, showHome = true }: BreadcrumbProps) {
  const location = useLocation()
  
  // Auto-generate breadcrumbs from current path if no items provided
  const autoItems = items.length === 0 ? generateBreadcrumbs(location.pathname) : items
  
  const allItems = showHome ? [
    { label: 'Home', href: '/', icon: <Home className="h-4 w-4" /> },
    ...autoItems
  ] : autoItems

  return (
    <nav className={cn('flex items-center space-x-1 text-sm', className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {allItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
            )}
            
            {item.href && index < allItems.length - 1 ? (
              <Link
                to={item.href}
                className={cn(
                  'flex items-center space-x-1 px-2 py-1 rounded-md transition-colors',
                  'hover:bg-secondary/50 hover:text-foreground',
                  'text-muted-foreground'
                )}
              >
                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            ) : (
              <span className="flex items-center space-x-1 px-2 py-1 text-foreground font-medium">
                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                <span className="hidden sm:inline">{item.label}</span>
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

// Auto-generate breadcrumbs from pathname
function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)
  
  return segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join('/')}`
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
    
    return {
      label,
      href: index < segments.length - 1 ? href : undefined // Last item has no href
    }
  })
}

// Compact breadcrumb for mobile
interface CompactBreadcrumbProps {
  currentPage: string
  backTo?: string
  onBack?: () => void
  className?: string
}

export function CompactBreadcrumb({ currentPage, backTo, onBack, className }: CompactBreadcrumbProps) {
  return (
    <div className={cn('flex items-center space-x-2 text-sm', className)}>
      {(backTo || onBack) && (
        <>
          <button
            onClick={onBack || (() => window.history.back())}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
          </button>
          <span className="text-muted-foreground">Back</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </>
      )}
      <span className="text-foreground font-medium truncate">{currentPage}</span>
    </div>
  )
}

// Breadcrumb with actions
interface BreadcrumbWithActionsProps {
  items: BreadcrumbItem[]
  actions?: React.ReactNode
  className?: string
}

export function BreadcrumbWithActions({ items, actions, className }: BreadcrumbWithActionsProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <Breadcrumb items={items} />
      {actions && (
        <div className="flex items-center space-x-2">
          {actions}
        </div>
      )}
    </div>
  )
}
