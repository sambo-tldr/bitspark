import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Search, Home } from "lucide-react";
import { motion } from "framer-motion";
import { useRM } from "@/lib/motion";

export default function NotFound() {
  const rm = useRM();

  return (
    <Layout>
      <section className="py-20">
        <div className="container max-w-lg text-center">
          <motion.div initial={rm(false, { opacity: 0, y: 20 })} animate={{ opacity: 1, y: 0 }} transition={{ duration: rm(0, 0.5) }} className="space-y-6">
            <div className="text-[120px] leading-none font-extrabold gradient-text">404</div>
            <h1 className="text-heading-1">Page Not Found</h1>
            <p className="text-body-lg text-muted-foreground">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="gap-2 gradient-primary text-primary-foreground rounded-full px-8">
                <Link to="/"><Home className="w-4 h-4" /> Go Home</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2 rounded-full px-8">
                <Link to="/explore"><Search className="w-4 h-4" /> Explore Campaigns</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
