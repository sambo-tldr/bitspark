import { Link } from "react-router-dom";
import { Zap, Github, Twitter, Mail, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";

const footerLinks = {
  Product: [
    { label: "Explore Campaigns", href: "/explore" },
    { label: "Create Campaign", href: "/create" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "How It Works", href: "/#how-it-works" },
  ],
  Resources: [
    { label: "Documentation", href: "#" },
    { label: "API Reference", href: "#" },
    { label: "Smart Contracts", href: "#" },
    { label: "Blog", href: "#" },
  ],
  Legal: [
    { label: "Terms of Service", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="relative border-t border-border/30 z-10" style={{ background: 'linear-gradient(180deg, hsl(0 0% 7%), hsl(0 0% 5%))' }}>
      <div className="container py-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-heading-3 font-bold gradient-text">BitSpark</span>
            </Link>
            <p className="text-body-sm text-muted-foreground mb-6 max-w-[280px]">
              The premier Bitcoin-native crowdfunding platform. Spark your ideas, fund the future.
            </p>
            
            {/* Newsletter */}
            <div className="mb-6">
              <p className="text-caption font-medium text-foreground mb-2">Stay in the loop</p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="you@email.com"
                    className="w-full h-9 rounded-lg bg-secondary border border-border/50 pl-9 pr-3 text-body-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <Button size="sm" className="gradient-primary text-primary-foreground btn-press shrink-0">
                  Join
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              {[
                { icon: Twitter, label: "Twitter" },
                { icon: Github, label: "GitHub" },
                { icon: MessageCircle, label: "Discord" },
              ].map(({ icon: Icon, label }) => (
                <a key={label} href="#" className="p-2.5 rounded-lg bg-secondary hover:bg-primary/15 text-muted-foreground hover:text-primary transition-all hover:scale-110 hover:shadow-[0_0_12px_hsl(25_95%_53%/0.2)]" aria-label={label}>
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-overline text-foreground mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-body-sm text-muted-foreground hover:text-primary transition-colors relative inline-block after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-px after:bottom-0 after:left-0 after:bg-primary after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Gradient divider */}
        <div className="mt-8 mb-6 h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, hsl(25 95% 53% / 0.3), hsl(43 96% 56% / 0.2), transparent)' }} />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-caption text-muted-foreground">
            © 2026 BitSpark. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-caption text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Stacks Testnet
            </span>
            <p className="text-caption text-muted-foreground flex items-center gap-1.5">
              Built on <span className="text-primary font-semibold">Bitcoin</span> ⚡
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
