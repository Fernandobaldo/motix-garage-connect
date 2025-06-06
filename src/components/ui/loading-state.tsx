
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

interface LoadingStateProps {
  isLoading: boolean
  children: React.ReactNode
  loadingText?: string
  overlay?: boolean
  className?: string
}

const LoadingState = ({ 
  isLoading, 
  children, 
  loadingText = "Loading...",
  overlay = false,
  className 
}: LoadingStateProps) => {
  if (!isLoading) {
    return <>{children}</>
  }

  if (overlay) {
    return (
      <div className="relative">
        {children}
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-md">
          <div className="flex flex-col items-center space-y-2">
            <Spinner size="lg" className="text-blue-600" />
            <p className="text-sm text-gray-600">{loadingText}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center justify-center py-8", className)}>
      <div className="flex flex-col items-center space-y-2">
        <Spinner size="lg" className="text-blue-600" />
        <p className="text-sm text-gray-600">{loadingText}</p>
      </div>
    </div>
  )
}

export { LoadingState }
