import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CelebrationEffect } from "@/components/CelebrationEffect";
import { Loader2, AlertCircle, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRM } from "@/lib/motion";

interface RefundModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignTitle: string;
  amount: number;
}

export function RefundModal({ open, onOpenChange, campaignTitle, amount }: RefundModalProps) {
  const rm = useRM();
  const [status, setStatus] = useState<"confirm" | "processing" | "success" | "error">("confirm");

  const handleClose = (v: boolean) => { if (!v) setStatus("confirm"); onOpenChange(v); };

  const handleRefund = async () => {
    setStatus("processing");
    await new Promise((r) => setTimeout(r, 2000));
    if (Math.random() < 0.1) { setStatus("error"); return; }
    setStatus("success");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="glass-strong border-border/50 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-heading-2 text-center">
            {status === "success" ? "Refund Completed" : status === "error" ? "Refund Failed" : "Request Refund"}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {status === "confirm" && (
            <motion.div key="confirm" initial={rm(false, { opacity: 0 })} animate={{ opacity: 1 }} transition={{ duration: rm(0, 0.2) }} className="space-y-5 py-2">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-warning/10 border border-warning/20">
                <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <div className="text-body-sm">
                  <p className="font-medium text-warning">Campaign did not reach its goal</p>
                  <p className="text-muted-foreground mt-1">Your contribution to <span className="text-foreground">{campaignTitle}</span> is eligible for a full refund.</p>
                </div>
              </div>
              <div className="glass rounded-xl p-5 text-center">
                <p className="text-caption text-muted-foreground mb-1">Refund Amount</p>
                <p className="text-heading-1 font-mono-display text-primary">{amount} BTC</p>
              </div>
              <Button onClick={handleRefund} className="w-full bg-warning text-warning-foreground hover:bg-warning/90">Confirm Refund</Button>
            </motion.div>
          )}
          {status === "processing" && (
            <motion.div key="proc" initial={rm(false, { opacity: 0 })} animate={{ opacity: 1 }} transition={{ duration: rm(0, 0.2) }} className="flex flex-col items-center gap-4 py-10">
              <Loader2 className="w-10 h-10 text-warning animate-spin" />
              <p className="text-body text-muted-foreground">Processing refund...</p>
            </motion.div>
          )}
          {status === "success" && (
            <motion.div key="success" initial={rm(false, { opacity: 0 })} animate={{ opacity: 1 }} transition={{ duration: rm(0, 0.2) }} className="flex flex-col items-center gap-5 py-6">
              <CelebrationEffect />
              <p className="text-body text-muted-foreground mt-4"><span className="text-primary font-mono-display font-semibold">{amount} BTC</span> refunded to your wallet</p>
              <Button onClick={() => handleClose(false)} className="gradient-primary text-primary-foreground">Done</Button>
            </motion.div>
          )}
          {status === "error" && (
            <motion.div key="error" initial={rm(false, { opacity: 0 })} animate={{ opacity: 1 }} transition={{ duration: rm(0, 0.2) }} className="flex flex-col items-center gap-4 py-6">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <p className="text-body-sm text-muted-foreground">Refund failed. Please try again.</p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => handleClose(false)}>Cancel</Button>
                <Button onClick={handleRefund} className="bg-warning text-warning-foreground hover:bg-warning/90">Retry</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
