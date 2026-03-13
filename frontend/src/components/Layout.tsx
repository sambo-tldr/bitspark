import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ScrollProgress } from "./ScrollProgress";
import { BackToTop } from "./BackToTop";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col relative">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-primary-foreground focus:text-body-sm focus:font-medium focus:shadow-lg focus:outline-none"
      >
        Skip to content
      </a>
      {/* Subtle fixed background texture */}
      <div className="fixed inset-0 bg-grid-pattern opacity-50 pointer-events-none z-0" />
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-background/50 pointer-events-none z-0" />
      <ScrollProgress />
      <Navbar />
      <main id="main-content" className="flex-1 pt-[72px] relative z-10">{children}</main>
      <Footer />
      <BackToTop />
    </div>
  );
}
