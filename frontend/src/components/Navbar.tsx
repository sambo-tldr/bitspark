import { useState, useRef, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Menu, X, Zap, LogOut, Copy, Wallet } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useRM } from "@/lib/motion";
import { useWallet } from "@/context/WalletContext";
import { useDebounce } from "@/hooks/useDebounce";
import { campaigns } from "@/data/mockData";
import { Badge } from "./ui/badge";
import { EmptyStateIllustration } from "./EmptyStateIllustration";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "./ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const navLinks = [
  { label: "Explore", href: "/explore" },
  { label: "Create", href: "/create" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "About", href: "/about" },
];

function SearchResults({
  results,
  query,
  onSelect,
}: {
  results: typeof campaigns;
  query: string;
  onSelect: () => void;
}) {
  if (!query.trim()) return null;

  const rm = useRM();

  return (
    <motion.div
      initial={rm(false, { opacity: 0, y: -8, scale: 0.98 })}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={rm({ opacity: 0 }, { opacity: 0, y: -8, scale: 0.98 })}
      transition={{ duration: rm(0, 0.2) }}
      className="absolute top-full right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl bg-popover/95 backdrop-blur-xl border border-border shadow-2xl z-50 overflow-hidden"
    >
      {results.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
          <EmptyStateIllustration variant="search" className="w-8 h-8 mb-2" />
          No campaigns found
        </div>
      ) : (
        <div className="py-1">
          {results.map((c, i) => (
            <motion.div
              key={c.id}
              initial={rm(false, { opacity: 0, x: -10 })}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: rm(0, i * 0.05), duration: rm(0, 0.2) }}
            >
              <Link
                to={`/campaign/${c.id}`}
                onClick={onSelect}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-secondary/80 transition-colors"
              >
                <img
                  src={c.imageUrl}
                  alt={c.title}
                  className="w-10 h-10 rounded-lg object-cover shrink-0 ring-1 ring-border"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {c.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {c.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {c.raised} / {c.goal} BTC
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export function Navbar() {
  const rm = useRM();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { connected, disconnect, setShowConnectModal, walletType } = useWallet();
  const location = useLocation();
  const { toast } = useToast();

  const { scrollY } = useScroll();
  const headerHeight = useTransform(scrollY, [0, 100], [72, 60]);
  const headerBlur = useTransform(scrollY, [0, 100], [12, 24]);
  const headerBg = useTransform(scrollY, [0, 100], [0.6, 0.85]);

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const unsub = scrollY.on("change", (v) => setScrolled(v > 20));
    return unsub;
  }, [scrollY]);

  const filteredResults = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    const q = debouncedQuery.toLowerCase();
    return campaigns
      .filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.shortDescription.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [debouncedQuery]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      closeSearch();
    } else if (e.key === "Enter" && filteredResults.length === 1) {
      navigate(`/campaign/${filteredResults[0].id}`);
      closeSearch();
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast({ title: "Wallet disconnected", description: "You have been safely disconnected." });
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText("SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7");
    toast({ title: "Address copied", description: "Wallet address copied to clipboard." });
  };

  return (
    <>
      <motion.header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-shadow duration-300",
          scrolled ? "shadow-lg shadow-background/20" : ""
        )}
        style={{
          height: headerHeight,
          backdropFilter: `blur(${headerBlur}px)`,
          backgroundColor: `hsl(var(--card) / ${headerBg})`,
          borderBottom: "1px solid hsl(var(--border) / 0.5)",
          boxShadow: scrolled ? '0 1px 0 hsl(25 95% 53% / 0.1)' : 'none',
        } as any}
      >
        <div className="container h-full flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-heading-3 font-bold gradient-text hidden sm:block">BitSpark</span>
            <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-primary/15 text-primary border border-primary/30">Testnet</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 relative">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "relative px-4 py-2 rounded-lg text-body-sm font-medium transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-primary/10 rounded-lg"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div ref={searchRef} className="relative flex items-center">
              <AnimatePresence>
                {searchOpen && (
                  <motion.input
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 220, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="h-9 rounded-lg bg-secondary border-0 px-3 text-body-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:shadow-[0_0_12px_hsl(25_95%_53%/0.15)] transition-shadow"
                    placeholder="Search campaigns..."
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                  />
                )}
              </AnimatePresence>
              <Button variant="ghost" size="icon" onClick={() => { if (searchOpen && !searchQuery) closeSearch(); else setSearchOpen(true); }} className="text-muted-foreground hover:text-foreground">
                <Search className="w-4 h-4" />
              </Button>
              <AnimatePresence>
                {searchOpen && debouncedQuery.trim() && (
                  <SearchResults results={filteredResults} query={debouncedQuery} onSelect={closeSearch} />
                )}
              </AnimatePresence>
            </div>

            {connected ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="hidden sm:flex gap-2 rounded-full px-5 btn-press bg-secondary text-foreground hover:bg-secondary/80"
                  >
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-mono text-body-sm">SP2J6...9EJ7</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    {walletType || "Wallet"}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled className="text-xs font-mono text-muted-foreground">
                    SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyAddress}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Address
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                    Balance: 0.5 BTC
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDisconnect} className="text-destructive focus:text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => setShowConnectModal(true)}
                className="hidden sm:flex gap-2 rounded-full px-5 btn-press gradient-primary text-primary-foreground"
              >
                Connect Wallet
              </Button>
            )}

            <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground" onClick={() => setMobileOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={rm(false, { opacity: 0 })} animate={{ opacity: 1 }} exit={rm({ opacity: 0 }, { opacity: 0 })} transition={{ duration: rm(0, 0.2) }} className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-xl">
            <div className="flex flex-col h-full p-6">
              <div className="flex justify-between items-center mb-8">
                <Link to="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                  <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="text-heading-3 font-bold gradient-text">BitSpark</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Mobile search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  className="w-full h-10 rounded-lg bg-secondary border-0 pl-10 pr-3 text-body-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && filteredResults.length === 1) {
                      navigate(`/campaign/${filteredResults[0].id}`);
                      setMobileOpen(false);
                      setSearchQuery("");
                    }
                  }}
                />
                {debouncedQuery.trim() && (
                  <div className="mt-2 rounded-xl bg-popover border border-border shadow-lg overflow-hidden">
                    {filteredResults.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-muted-foreground">No campaigns found</div>
                    ) : (
                      filteredResults.map((c) => (
                        <Link
                          key={c.id}
                          to={`/campaign/${c.id}`}
                          onClick={() => { setMobileOpen(false); setSearchQuery(""); }}
                          className="flex items-center gap-3 px-3 py-2.5 hover:bg-secondary transition-colors"
                        >
                          <img src={c.imageUrl} alt={c.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground truncate">{c.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{c.category}</Badge>
                              <span className="text-xs text-muted-foreground">{c.raised} / {c.goal} BTC</span>
                            </div>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>

              <nav className="flex flex-col gap-2">
                {navLinks.map((link, i) => (
                  <motion.div key={link.href} initial={rm(false, { opacity: 0, x: 20 })} animate={{ opacity: 1, x: 0 }} transition={{ delay: rm(0, i * 0.08), duration: rm(0, 0.2) }}>
                    <Link
                      to={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "block px-4 py-4 rounded-xl text-heading-2 font-semibold transition-colors",
                        location.pathname === link.href ? "text-primary bg-primary/10" : "text-foreground hover:bg-secondary"
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="mt-auto">
                <Button
                  onClick={() => {
                    if (connected) { handleDisconnect(); } else { setShowConnectModal(true); }
                    setMobileOpen(false);
                  }}
                  className={cn(
                    "w-full rounded-full py-4 text-body-lg btn-press",
                    connected ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "gradient-primary text-primary-foreground"
                  )}
                >
                  {connected ? "Disconnect Wallet" : "Connect Wallet"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
