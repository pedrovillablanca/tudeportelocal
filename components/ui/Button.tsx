import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
        {
          'bg-blue-700 text-white hover:bg-blue-800': variant === 'primary',
          'bg-slate-100 text-slate-900 hover:bg-slate-200': variant === 'secondary',
          'border-2 border-slate-200 bg-transparent hover:bg-slate-50': variant === 'outline',
          'hover:bg-slate-100 hover:text-slate-900': variant === 'ghost',
          'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
        },
        {
          'h-8 px-3 text-sm rounded-lg': size === 'sm',
          'h-10 px-4 text-base rounded-xl': size === 'md',
          'h-12 px-6 text-lg rounded-xl': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
