"use client"

export default function BackButton({ className, children }) {
  const handleClick = () => {
    // Check if we can go back in history
    if (window.history.length > 1) {
      window.history.back()
    } else {
      // Fallback - go to home page with parameter indicating payment was cancelled
      window.location.href = "/?payment_cancelled=true"
    }
  }
  
  return (
    <button 
      onClick={handleClick} 
      className={className}
    >
      {children}
    </button>
  )
} 