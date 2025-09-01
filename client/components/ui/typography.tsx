import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

// Heading components with proper semantic hierarchy
interface HeadingProps {
  children: ReactNode
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export function Heading({ children, className, as = 'h2' }: HeadingProps) {
  const baseClasses = 'font-bold text-foreground tracking-tight'
  
  const sizeClasses = {
    h1: 'text-3xl md:text-4xl lg:text-5xl',
    h2: 'text-2xl md:text-3xl lg:text-4xl',
    h3: 'text-xl md:text-2xl lg:text-3xl',
    h4: 'text-lg md:text-xl lg:text-2xl',
    h5: 'text-base md:text-lg lg:text-xl',
    h6: 'text-sm md:text-base lg:text-lg'
  }

  const Component = as
  return (
    <Component className={cn(baseClasses, sizeClasses[as], className)}>
      {children}
    </Component>
  )
}

// Page title component
interface PageTitleProps {
  children: ReactNode
  subtitle?: ReactNode
  className?: string
}

export function PageTitle({ children, subtitle, className }: PageTitleProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Heading as="h1" className="text-2xl md:text-3xl lg:text-4xl">
        {children}
      </Heading>
      {subtitle && (
        <p className="text-lg text-muted-foreground max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  )
}

// Section title component
interface SectionTitleProps {
  children: ReactNode
  description?: ReactNode
  className?: string
}

export function SectionTitle({ children, description, className }: SectionTitleProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <Heading as="h2" className="text-xl md:text-2xl lg:text-3xl">
        {children}
      </Heading>
      {description && (
        <p className="text-base text-muted-foreground max-w-3xl">
          {description}
        </p>
      )}
    </div>
  )
}

// Card title component
interface CardTitleProps {
  children: ReactNode
  className?: string
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3 className={cn('font-semibold text-lg text-foreground', className)}>
      {children}
    </h3>
  )
}

// Text components with consistent sizing
interface TextProps {
  children: ReactNode
  className?: string
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  color?: 'default' | 'muted' | 'primary' | 'success' | 'warning' | 'error'
}

export function Text({ 
  children, 
  className, 
  size = 'base',
  weight = 'normal',
  color = 'default'
}: TextProps) {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  }

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  }

  const colorClasses = {
    default: 'text-foreground',
    muted: 'text-muted-foreground',
    primary: 'text-primary',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600'
  }

  return (
    <p className={cn(
      sizeClasses[size],
      weightClasses[weight],
      colorClasses[color],
      className
    )}>
      {children}
    </p>
  )
}

// Label component with consistent styling
interface LabelProps {
  children: ReactNode
  className?: string
  required?: boolean
}

export function Label({ children, className, required }: LabelProps) {
  return (
    <label className={cn('text-sm font-medium text-foreground', className)}>
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  )
}

// Caption component for small helper text
interface CaptionProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'muted' | 'success' | 'warning' | 'error'
}

export function Caption({ children, className, variant = 'default' }: CaptionProps) {
  const variantClasses = {
    default: 'text-xs text-foreground',
    muted: 'text-xs text-muted-foreground',
    success: 'text-xs text-green-600',
    warning: 'text-xs text-yellow-600',
    error: 'text-xs text-red-600'
  }

  return (
    <span className={cn(variantClasses[variant], className)}>
      {children}
    </span>
  )
}

// List components for better content organization
interface ListProps {
  children: ReactNode
  className?: string
  ordered?: boolean
}

export function List({ children, className, ordered = false }: ListProps) {
  const Component = ordered ? 'ol' : 'ul'
  return (
    <Component className={cn('space-y-2', className)}>
      {children}
    </Component>
  )
}

interface ListItemProps {
  children: ReactNode
  className?: string
  icon?: ReactNode
}

export function ListItem({ children, className, icon }: ListItemProps) {
  return (
    <li className={cn('flex items-start space-x-2', className)}>
      {icon && <span className="flex-shrink-0 mt-0.5">{icon}</span>}
      <span className="text-sm text-foreground">{children}</span>
    </li>
  )
}
