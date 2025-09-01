import { useState } from 'react'
import { Menu, X, Shield, User, LogOut, BarChart3, Settings, Home } from 'lucide-react'
import { Button } from './button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './sheet'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

interface MobileNavProps {
  className?: string
}

export function MobileNav({ className }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleNavigation = (path: string) => {
    navigate(path)
    setIsOpen(false)
  }

  const handleSignOut = () => {
    signOut()
    setIsOpen(false)
  }

  const navigationItems = [
    { icon: <Home className="h-5 w-5" />, label: 'Dashboard', path: '/dashboard' },
    { icon: <BarChart3 className="h-5 w-5" />, label: 'Analysis History', path: '/history' },
    { icon: <Settings className="h-5 w-5" />, label: 'Settings', path: '/settings' },
  ]

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      
      <SheetContent side="left" className="w-80">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center space-x-3">
            <div className="p-2 bg-primary rounded-lg">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold">DeepGuard</h2>
              <p className="text-sm text-muted-foreground">AI-Powered Deepfake Detection</p>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* User Profile Section */}
          <div className="p-4 bg-secondary/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {profile?.full_name || user?.email}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors text-left"
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Sign Out Button */}
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full justify-start"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Mobile-friendly header component
interface MobileHeaderProps {
  title: string
  subtitle?: string
  showBackButton?: boolean
  onBack?: () => void
  rightContent?: React.ReactNode
  className?: string
}

export function MobileHeader({ 
  title, 
  subtitle, 
  showBackButton = false, 
  onBack,
  rightContent,
  className 
}: MobileHeaderProps) {
  return (
    <div className={`sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border/20 ${className}`}>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-2 h-9 w-9"
            >
              <X className="h-4 w-4 rotate-45" />
            </Button>
          )}
          
          <div>
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        
        {rightContent && (
          <div className="flex items-center space-x-2">
            {rightContent}
          </div>
        )}
      </div>
    </div>
  )
}
