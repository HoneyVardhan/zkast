import React, { Component, ErrorInfo, ReactNode } from "react";
import { ShieldAlert, RefreshCw, Home } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="glass-card p-8 max-w-md w-full text-center animate-fade-in">
            <div className="h-16 w-16 rounded-2xl bg-no/10 border border-no/20 flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="h-8 w-8 text-no" />
            </div>
            <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
            <p className="text-sm text-muted-foreground mb-8">
              An unexpected error occurred. We've been notified and are working on it.
            </p>
            
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => window.location.reload()} 
                className="rounded-xl h-11 gap-2 font-semibold"
              >
                <RefreshCw className="h-4 w-4" />
                Reload Application
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = "/"}
                className="rounded-xl h-11 gap-2 border-border"
              >
                <Home className="h-4 w-4" />
                Back to Home
              </Button>
            </div>

            {import.meta.env.DEV && (
              <div className="mt-8 p-4 rounded-xl bg-secondary/50 border border-border text-left overflow-auto max-h-40">
                <p className="text-[10px] font-mono text-no font-bold uppercase mb-1">Error Details</p>
                <p className="text-[10px] font-mono whitespace-pre-wrap">{this.state.error?.message}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
