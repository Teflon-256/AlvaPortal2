interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  showProgress?: boolean;
  progress?: number;
  text?: string;
}

export function LoadingSpinner({ 
  size = "md", 
  showProgress = false, 
  progress = 0,
  text 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16 md:w-24 md:h-24"
  };

  const progressBarWidth = {
    sm: "w-32",
    md: "w-48",
    lg: "w-48 md:w-64"
  };

  const textSize = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-2xl md:text-4xl"
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative mb-4">
        <svg 
          className={`${sizeClasses[size]} animate-spin`}
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle 
            cx="50" 
            cy="50" 
            r="40" 
            stroke="hsl(217,100%,70%)" 
            strokeWidth="3" 
            fill="none" 
            opacity="0.2" 
          />
          <path 
            d="M 50 10 A 40 40 0 0 1 90 50" 
            stroke="hsl(217,100%,70%)" 
            strokeWidth="3" 
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>
      
      {text && (
        <div className={`${textSize[size]} font-mono font-bold mb-2 text-cyan-400 text-center`}>
          {text}
        </div>
      )}
      
      {showProgress && (
        <div className={`${progressBarWidth[size]} h-1 bg-zinc-900 rounded-full overflow-hidden`}>
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
