import { Link } from "react-router-dom"
import { AlertTriangle } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="w-10 h-10" />
      </div>
      <div className="text-7xl font-bold text-foreground mb-4 tracking-tighter">403</div>
      <h1 className="text-2xl font-semibold mb-3 text-foreground">Unauthorized Access</h1>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        You don't have the necessary permissions to access this page. Please contact your administrator if you believe this is a mistake.
      </p>
      <Link 
        to="/dashboard" 
        className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-all duration-300 shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/30"
      >
        Return to Dashboard
      </Link>
    </div>
  )
}
