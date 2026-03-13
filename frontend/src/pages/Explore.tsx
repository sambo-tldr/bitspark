import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, Grid3X3, List, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRM } from "@/lib/motion";
import { Layout } from "@/components/Layout";
import { CampaignCard } from "@/components/CampaignCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { campaigns, categories } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { EmptyStateIllustration } from "@/components/EmptyStateIllustration";

type SortOption = "most-funded" | "newest" | "ending-soon" | "most-backed";

// Category dot colors
const catDots: Record<string, string> = {
  technology: "bg-blue-500",
  creative: "bg-purple-500",
  community: "bg-green-500",
  games: "bg-orange-500",
  science: "bg-teal-500",
  other: "bg-yellow-500",
};

export default function Explore() {
  const rm = useRM();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "";

  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategory ? [initialCategory] : []);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [goalRange, setGoalRange] = useState([0, 10]);
  const [sortBy, setSortBy] = useState<SortOption>("most-funded");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showCount, setShowCount] = useState(8);

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
  };

  const toggleStatus = (status: string) => {
    setStatusFilter((prev) => prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]);
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategories([]);
    setStatusFilter([]);
    setGoalRange([0, 10]);
  };

  const filtered = useMemo(() => {
    let result = campaigns.filter((c) => {
      if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedCategories.length && !selectedCategories.includes(c.category.toLowerCase())) return false;
      if (statusFilter.length && !statusFilter.includes(c.status)) return false;
      if (c.goal < goalRange[0] || c.goal > goalRange[1]) return false;
      return true;
    });

    switch (sortBy) {
      case "most-funded": result.sort((a, b) => b.raised - a.raised); break;
      case "newest": result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      case "ending-soon": result.sort((a, b) => a.daysLeft - b.daysLeft); break;
      case "most-backed": result.sort((a, b) => b.backers - a.backers); break;
    }
    return result;
  }, [search, selectedCategories, statusFilter, goalRange, sortBy]);

  const hasFilters = search || selectedCategories.length || statusFilter.length || goalRange[0] > 0 || goalRange[1] < 10;

  const FilterContent = () => (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search campaigns..."
          className="pl-10 bg-secondary border-border/50"
        />
      </div>

      <div>
        <h4 className="text-overline text-muted-foreground mb-3">Categories</h4>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-3 cursor-pointer py-1 text-body-sm">
              <Checkbox
                checked={selectedCategories.includes(cat.id)}
                onCheckedChange={() => toggleCategory(cat.id)}
              />
              <span className={cn("w-2 h-2 rounded-full", catDots[cat.id] || "bg-muted")} />
              <span className="text-foreground">{cat.name}</span>
              <span className="ml-auto text-caption text-muted-foreground">{cat.count}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-overline text-muted-foreground mb-3">Status</h4>
        <div className="space-y-2">
          {["active", "funded", "failed"].map((status) => (
            <label key={status} className="flex items-center gap-3 cursor-pointer py-1 text-body-sm">
              <Checkbox
                checked={statusFilter.includes(status)}
                onCheckedChange={() => toggleStatus(status)}
              />
              <span className="capitalize text-foreground">{status}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-overline text-muted-foreground mb-3">Goal Range (BTC)</h4>
        <Slider
          value={goalRange}
          onValueChange={setGoalRange}
          min={0}
          max={10}
          step={0.5}
          className="my-4"
        />
        <div className="flex justify-between text-caption text-muted-foreground">
          <span>{goalRange[0]} BTC</span>
          <span>{goalRange[1]} BTC</span>
        </div>
      </div>

      {hasFilters && (
        <Button variant="ghost" onClick={clearFilters} className="w-full text-destructive hover:text-destructive/80 btn-press">
          <X className="w-4 h-4 mr-1" /> Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <Layout>
      <section className="py-12">
        <div className="container">
          <div className="mb-10 relative">
            <div className="absolute -top-12 left-0 w-[400px] h-[200px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
            <p className="text-overline text-primary mb-2 relative">Discover</p>
            <h1 className="text-display relative">Explore Campaigns</h1>
            <p className="text-body-lg text-muted-foreground mt-2 relative">Find and support the projects shaping the future of Bitcoin.</p>
          </div>

          {/* Active filter chips */}
          <AnimatePresence>
            {hasFilters && (
              <motion.div
                initial={rm(false, { opacity: 0, height: 0 })}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 flex flex-wrap gap-2"
              >
                {selectedCategories.map((cat) => (
                  <motion.button
                    key={cat}
                    initial={rm(false, { scale: 0.8, opacity: 0 })}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={rm({ opacity: 0 }, { scale: 0.8, opacity: 0 })}
                    onClick={() => toggleCategory(cat)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-caption font-medium hover:bg-primary/20 transition-colors"
                  >
                    <span className={cn("w-2 h-2 rounded-full", catDots[cat])} />
                    <span className="capitalize">{cat}</span>
                    <X className="w-3 h-3" />
                  </motion.button>
                ))}
                {statusFilter.map((s) => (
                  <motion.button
                    key={s}
                    initial={rm(false, { scale: 0.8, opacity: 0 })}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={rm({ opacity: 0 }, { scale: 0.8, opacity: 0 })}
                    onClick={() => toggleStatus(s)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-foreground text-caption font-medium hover:bg-secondary/80 transition-colors"
                  >
                    <span className="capitalize">{s}</span>
                    <X className="w-3 h-3" />
                  </motion.button>
                ))}
                {search && (
                  <motion.button
                    initial={rm(false, { scale: 0.8, opacity: 0 })}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={rm({ opacity: 0 }, { scale: 0.8, opacity: 0 })}
                    onClick={() => setSearch("")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-foreground text-caption font-medium hover:bg-secondary/80 transition-colors"
                  >
                    "{search}" <X className="w-3 h-3" />
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-8">
            {/* Desktop sidebar */}
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-[96px] glass-strong rounded-xl p-6">
                <FilterContent />
              </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="flex items-center justify-between gap-4 mb-6">
                <p className="text-body-sm text-muted-foreground">
                  {filtered.length} campaign{filtered.length !== 1 ? "s" : ""}
                </p>
                <div className="flex items-center gap-2">
                  {/* Mobile filter trigger */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="lg:hidden gap-2 btn-press">
                        <SlidersHorizontal className="w-4 h-4" /> Filters
                        {hasFilters && <span className="w-2 h-2 rounded-full bg-primary" />}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80 bg-card">
                      <SheetHeader>
                        <SheetTitle>Filter Campaigns</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">
                        <FilterContent />
                      </div>
                    </SheetContent>
                  </Sheet>

                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                    <SelectTrigger className="w-[160px] bg-secondary border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="most-funded">Most Funded</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="ending-soon">Ending Soon</SelectItem>
                      <SelectItem value="most-backed">Most Backed</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="hidden sm:flex border border-border/50 rounded-lg overflow-hidden">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn("rounded-none h-9 w-9", viewMode === "grid" && "bg-secondary")}
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn("rounded-none h-9 w-9", viewMode === "list" && "bg-secondary")}
                      onClick={() => setViewMode("list")}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Campaigns */}
              {filtered.length === 0 ? (
                <motion.div
                  initial={rm(false, { opacity: 0, scale: 0.95 })}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20 glass rounded-xl"
                >
                  <EmptyStateIllustration variant="search" className="mb-4" />
                  <h3 className="text-heading-2 mb-2">No campaigns found</h3>
                  <p className="text-muted-foreground mb-6">Try adjusting your filters or search terms.</p>
                  <Button variant="outline" onClick={clearFilters} className="btn-press">Clear Filters</Button>
                </motion.div>
              ) : (
                <>
                  <div className={cn(
                    "grid gap-6",
                    viewMode === "grid" ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
                  )}>
                    {filtered.slice(0, showCount).map((campaign, i) => (
                      <motion.div
                        key={campaign.id}
                        initial={rm(false, { opacity: 0, y: 20 })}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: rm(0, i * 0.05), duration: rm(0, 0.4) }}
                      >
                        <CampaignCard campaign={campaign} />
                      </motion.div>
                    ))}
                  </div>

                  {showCount < filtered.length && (
                    <div className="text-center mt-10">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setShowCount((c) => c + 8)}
                        className="rounded-full px-8 btn-press"
                      >
                        Load More ({filtered.length - showCount} remaining)
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
