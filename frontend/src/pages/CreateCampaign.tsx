import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, ArrowRight, ArrowLeft, Check, Zap, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRM } from "@/lib/motion";
import { Layout } from "@/components/Layout";
import { PageTransition } from "@/components/PageTransition";
import { CelebrationEffect } from "@/components/CelebrationEffect";
import { BitSparkProgress } from "@/components/BitSparkProgress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { categories } from "@/data/mockData";
import { cn } from "@/lib/utils";

const steps = ["Basics", "Details", "Review"];

export default function CreateCampaign() {
  const rm = useRM();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "",
    image: null as string | null,
    description: "",
    goal: "",
    duration: "30",
    termsAccepted: false,
  });

  const update = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleImageUpload = () => {
    update("image", "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80");
  };

  const handleLaunch = () => setShowSuccess(true);
  const goalUsd = form.goal ? (parseFloat(form.goal) * 97500).toLocaleString() : "0";
  const goalNum = form.goal ? parseFloat(form.goal) : 0;

  return (
    <Layout>
      <PageTransition>
        <section className="py-12">
          <div className="container max-w-3xl">
            <div className="mb-10">
              <p className="text-overline text-primary mb-2">Launch</p>
              <h1 className="text-display">Create Campaign</h1>
            </div>

            {/* Animated progress indicator */}
            <div className="flex items-center gap-2 mb-12 relative">
              {/* Connecting line */}
              <div className="absolute top-4 left-4 right-4 h-px bg-border z-0" />
              <motion.div
                className="absolute top-4 left-4 h-px gradient-primary z-0"
                animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ maxWidth: "calc(100% - 2rem)" }}
              />
              
              {steps.map((step, i) => (
                <div key={step} className="flex items-center gap-2 flex-1 relative z-10">
                  <motion.div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-caption font-bold transition-all",
                      i <= currentStep ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground border border-border"
                    )}
                    animate={i === currentStep ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {i < currentStep ? <Check className="w-4 h-4" /> : i + 1}
                  </motion.div>
                  <span className={cn("text-body-sm hidden sm:block", i <= currentStep ? "text-foreground font-medium" : "text-muted-foreground")}>{step}</span>
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {currentStep === 0 && (
                <motion.div key="step1" initial={rm(false, { opacity: 0, x: 20 })} animate={{ opacity: 1, x: 0 }} exit={rm({ opacity: 0 }, { opacity: 0, x: -20 })} transition={{ duration: rm(0, 0.3) }} className="space-y-6">
                  <div className="glass rounded-xl p-6 space-y-6">
                    <div>
                      <label className="text-body-sm font-medium mb-2 block">Campaign Title</label>
                      <Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Give your campaign a compelling title" className="bg-secondary border-border/50" />
                    </div>
                    <div>
                      <label className="text-body-sm font-medium mb-2 block">Category</label>
                      <Select value={form.category} onValueChange={(v) => update("category", v)}>
                        <SelectTrigger className="bg-secondary border-border/50"><SelectValue placeholder="Select a category" /></SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-body-sm font-medium mb-2 block">Cover Image</label>
                      {form.image ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative rounded-xl overflow-hidden"
                        >
                          <img src={form.image} alt="Cover" className="w-full h-48 object-cover" />
                          <Button variant="ghost" size="sm" className="absolute top-2 right-2 bg-background/50 btn-press" onClick={() => update("image", null)}>Remove</Button>
                        </motion.div>
                      ) : (
                        <button
                          onClick={handleImageUpload}
                          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                          onDragLeave={() => setDragActive(false)}
                          onDrop={(e) => { e.preventDefault(); setDragActive(false); handleImageUpload(); }}
                          className={cn(
                            "w-full h-48 rounded-xl border-2 border-dashed bg-secondary/50 flex flex-col items-center justify-center gap-3 transition-all",
                            dragActive ? "border-primary bg-primary/5 scale-[1.02]" : "border-border/50 hover:border-primary/50"
                          )}
                        >
                          <Upload className={cn("w-8 h-8 transition-colors", dragActive ? "text-primary" : "text-muted-foreground")} />
                          <span className="text-body-sm text-muted-foreground">
                            {dragActive ? "Drop your image here" : "Click or drag to upload cover image"}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 1 && (
                <motion.div key="step2" initial={rm(false, { opacity: 0, x: 20 })} animate={{ opacity: 1, x: 0 }} exit={rm({ opacity: 0 }, { opacity: 0, x: -20 })} transition={{ duration: rm(0, 0.3) }} className="space-y-6">
                  <div className="glass rounded-xl p-6 space-y-6">
                    <div>
                      <label className="text-body-sm font-medium mb-2 block">Description</label>
                      <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Describe your campaign, its goals, and why people should back it..." rows={8} className="bg-secondary border-border/50" />
                    </div>
                    <div>
                      <label className="text-body-sm font-medium mb-2 block">Funding Goal</label>
                      <div className="relative">
                        <Input value={form.goal} onChange={(e) => update("goal", e.target.value)} type="number" step="0.01" placeholder="0.00" className="bg-secondary border-border/50 pr-16" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-body-sm text-muted-foreground font-mono-display">BTC</span>
                      </div>
                      <p className="text-caption text-muted-foreground mt-1 flex items-center gap-1"><Info className="w-3 h-3" /> ≈ ${goalUsd} USD at current rates</p>
                      {/* Live goal preview */}
                      {goalNum > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-3 glass rounded-lg p-3 space-y-2"
                        >
                          <p className="text-caption text-muted-foreground">Goal preview</p>
                          <BitSparkProgress value={35} size="sm" showLabel />
                          <p className="text-caption text-muted-foreground">
                            <span className="text-primary font-mono-display">{(goalNum * 0.35).toFixed(2)}</span> / {goalNum} BTC (example at 35%)
                          </p>
                        </motion.div>
                      )}
                    </div>
                    <div>
                      <label className="text-body-sm font-medium mb-2 block">Campaign Duration</label>
                      <Select value={form.duration} onValueChange={(v) => update("duration", v)}>
                        <SelectTrigger className="bg-secondary border-border/50"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 days</SelectItem>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="45">45 days</SelectItem>
                          <SelectItem value="60">60 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div key="step3" initial={rm(false, { opacity: 0, x: 20 })} animate={{ opacity: 1, x: 0 }} exit={rm({ opacity: 0 }, { opacity: 0, x: -20 })} transition={{ duration: rm(0, 0.3) }} className="space-y-6">
                  <div className="glass rounded-xl p-6 space-y-6">
                    <h2 className="text-heading-2">Review Your Campaign</h2>
                    
                    {/* Live preview card */}
                    <div className="glass rounded-xl overflow-hidden border border-primary/20">
                      {form.image && (
                        <img src={form.image} alt="Cover" className="w-full h-40 object-cover" />
                      )}
                      <div className="p-4 space-y-3">
                        <span className="text-caption text-primary font-medium capitalize">{form.category || "Category"}</span>
                        <h3 className="text-heading-3">{form.title || "Your Campaign Title"}</h3>
                        <p className="text-body-sm text-muted-foreground line-clamp-2">{form.description || "Your campaign description..."}</p>
                        <BitSparkProgress value={0} size="sm" />
                        <div className="flex justify-between text-caption text-muted-foreground">
                          <span className="font-mono-display">0.00 / {form.goal || "0"} BTC</span>
                          <span>{form.duration} days</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-body-sm">
                      <div><p className="text-muted-foreground">Title</p><p className="font-medium">{form.title || "—"}</p></div>
                      <div><p className="text-muted-foreground">Category</p><p className="font-medium capitalize">{form.category || "—"}</p></div>
                      <div><p className="text-muted-foreground">Goal</p><p className="font-medium font-mono-display">{form.goal || "0"} BTC</p></div>
                      <div><p className="text-muted-foreground">Duration</p><p className="font-medium">{form.duration} days</p></div>
                    </div>

                    <div className="glass rounded-lg p-4 flex items-center gap-2 text-body-sm">
                      <Info className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">Estimated gas fee: <span className="text-foreground font-mono-display">~0.0001 STX</span></span>
                    </div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <Checkbox checked={form.termsAccepted} onCheckedChange={(v) => update("termsAccepted", v)} className="mt-0.5" />
                      <span className="text-body-sm text-muted-foreground">I agree to the Terms of Service and understand that all transactions are final and recorded on-chain.</span>
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={() => setCurrentStep((s) => s - 1)} disabled={currentStep === 0} className="gap-2 btn-press">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              {currentStep < 2 ? (
                <Button onClick={() => setCurrentStep((s) => s + 1)} className="gap-2 gradient-primary text-primary-foreground btn-press">
                  Next <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button onClick={handleLaunch} disabled={!form.termsAccepted} className="gap-2 gradient-primary text-primary-foreground glow-orange btn-press">
                  <Zap className="w-4 h-4" /> Launch Campaign
                </Button>
              )}
            </div>
          </div>
        </section>
      </PageTransition>

      {/* Success Modal */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="glass-strong border-border/50 text-center">
          <DialogHeader>
            <DialogTitle className="text-heading-1 text-center">Campaign Launched!</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <CelebrationEffect />
            <p className="text-muted-foreground mt-4">Your campaign is now live on the Bitcoin blockchain.</p>
            <div className="glass rounded-lg p-3">
              <p className="text-caption text-muted-foreground">Transaction Hash</p>
              <p className="font-mono text-body-sm text-primary break-all">0x7f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e</p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => { setShowSuccess(false); navigate("/campaign/1"); }} className="gradient-primary text-primary-foreground btn-press">
                View Campaign
              </Button>
              <Button variant="outline" onClick={() => setShowSuccess(false)} className="btn-press">Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
