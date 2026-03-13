import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CelebrationEffect } from "@/components/CelebrationEffect";
import { Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRM } from "@/lib/motion";
import { useClaimFunds, getErrorMessage, getExplorerUrl } from "@/hooks/useContracts";

interface ClaimFundsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignTitle: string;
  raised: number;
  campaignId: number;
}

const PLATFORM_FEE = 0.02;

export function ClaimFundsModal({ open, onOpenChange, campaignTitle, raised, campaignId }: ClaimFundsModalProps) {
  const rm = useRM();
  const claimMutation = useClaimFunds();
  const [status, setStatus] = useState<"confirm" | "processing" | "success" | "error">("confirm");
  const [errorMsg, setErrorMsg] = useState("");
  const [txId, setTxId] = useState("");

  const fee = raised * PLATFORM_FEE;
  const net = raised - fee;

  const handleClose = (v: boolean) => { if (!v) { setStatus("confirm"); setErrorMsg(""); setTxId(""); } onOpenChange(v); };

  const handleClaim = async () => {
    setStatus("processing");
    try {
      const result = await claimMutation.mutateAsync({ campaignId });
      setTxId(result.txId || "");
      setStatus("success");
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
      setStatus("error");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="glass-strong border-border/50 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-heading-2 text-center">
            {status === "success" ? "Funds Claimed!" : status === "error" ? "Claim Failed" : "Withdraw Funds"}
          </DialogTitle>
          <DialogDescription className="sr-only">Withdraw raised funds from your campaign</DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {status === "confirm" && (
            <motion.div key="confirm" initial={rm(false, { opacity: 0 })} animate={{ opacity: 1 }} transition={{ duration: rm(0, 0.2) }} className="space-y-5 py-2">
              <p className="text-body-sm text-muted-foreground text-center">Claiming funds for <span className="text-foreground font-medium">{campaignTitle}</span></p>
              <div className="glass rounded-xl p-5 space-y-3 text-body-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Total Raised</span><span className="font-mono-display">{raised.toFixed(4)} BTC</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Platform Fee (2%)</span><span className="font-mono-display text-destructive">-{fee.toFixed(4)} BTC</span></div>
                <div className="border-t border-border/30 pt-3 flex justify-between font-semibold"><span>You Receive</span><span className="font-mono-display text-primary">{net.toFixed(4)} BTC</span></div>
              </div>
              <Button onClick={handleClaim} className="w-full gradient-primary text-primary-foreground glow-orange">Confirm Withdrawal</Button>
            </motion.div>
          )}
          {status === "processing" && (
            <motion.div key="proc" initial={rm(false, { opacity: 0 })} animate={{ opacity: 1 }} transition={{ duration: rm(0, 0.2) }} className="flex flex-col items-center gap-4 py-10">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-body text-muted-foreground">Processing withdrawal...</p>
            </motion.div>
          )}
          {status === "success" && (
            <motion.div key="success" initial={rm(false, { opacity: 0 })} animate={{ opacity: 1 }} transition={{ duration: rm(0, 0.2) }} className="flex flex-col items-center gap-5 py-6">
              <CelebrationEffect />
              <p className="text-body text-muted-foreground mt-4"><span className="text-primary font-mono-display font-semibold">{net.toFixed(4)} BTC</span> sent to your wallet</p>
              {txId && (
                <div className="glass rounded-lg p-3 w-full">
                  <p className="text-caption text-muted-foreground">Transaction Hash</p>
                  <a href={getExplorerUrl(txId)} target="_blank" rel="noopener noreferrer" className="font-mono text-body-sm text-primary break-all hover:underline">{txId}</a>
                </div>
              )}
              <Button onClick={() => handleClose(false)} className="gradient-primary text-primary-foreground">Done</Button>
            </motion.div>
          )}
          {status === "error" && (
            <motion.div key="error" initial={rm(false, { opacity: 0 })} animate={{ opacity: 1 }} transition={{ duration: rm(0, 0.2) }} className="flex flex-col items-center gap-4 py-6">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <p className="text-body-sm text-muted-foreground text-center">{errorMsg || "Transaction failed. Please try again."}</p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => handleClose(false)}>Cancel</Button>
                <Button onClick={handleClaim} className="gradient-primary text-primary-foreground">Retry</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
