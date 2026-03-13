import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";

export function NetworkError() {
  return (
    <Layout>
      <section className="py-20">
        <div className="container max-w-lg text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <WifiOff className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-display">Connection Lost</h1>
          <p className="text-body-lg text-muted-foreground">
            We can't reach the network right now. Please check your connection and try again.
          </p>
          <Button onClick={() => window.location.reload()} size="lg" className="gap-2 gradient-primary text-primary-foreground rounded-full px-8">
            <RefreshCw className="w-4 h-4" /> Try Again
          </Button>
        </div>
      </section>
    </Layout>
  );
}
