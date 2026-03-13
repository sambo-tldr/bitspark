import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet } from "@/context/WalletContext";
import { CelebrationEffect } from "@/components/CelebrationEffect";
import { Loader2, AlertCircle, ArrowRight, ArrowLeft, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Campaign } from "@/data/mockData";
import { useContribute, getErrorMessage, getExplorerUrl } from "@/hooks/useContracts";

interface ContributeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Campaign;
}

const presetAmounts = [0.01, 0.05, 0.1, 0.25, 0.5, 1.0];

export function ContributeModal({ open, onOpenChange, campaign }: ContributeModalProps) {
  const { address } = useWallet();
  const contributeMutation = useContribute();
  const [step, setStep] = useState(0);
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [txId, setTxId] = useState("");

  const selectedAmount = amount ?? (parseFloat(customAmount) || 0);

  const reset = () => { setStep(0); setAmount(null); setCustomAmount(""); setStatus("idle"); setErrorMsg(""); setTxId(""); };

  const handleClose = (v: boolean) => { if (!v) reset(); onOpenChange(v); };

  const handleConfirm = async () => {
    setStep(2);
    setStatus("processing");
    try {
      const result = await contributeMutation.mutateAsync({
        campaignId: parseInt(campaign.id),
        amountBtc: selectedAmount,
        senderAddress: address,
      });
      setTxId(result.txId || "");
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(getErrorMessage(err));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="glass-strong border-border/50 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-heading-2 text-center">
            {status === "success" ? "Contribution Sent!" : status === "error" ? "Transaction Failed" : "Back This Project"}
          </DialogTitle>
          <DialogDescription className="sr-only">Contribute sBTC to this campaign</DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* Step 0: Amount Selection */}
          {step === 0 && (
            <motion.div key="amount" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5 py-2">
              <p className="text-body-sm text-muted-foreground text-center">Contributing to <span className="text-foreground font-medium">{campaign.title}</span></p>
              <div className="grid grid-cols-3 gap-2">
                {presetAmounts.map((a) => (
                  <button
                    key={a}
                    onClick={() => { setAmount(a); setCustomAmount(""); }}
                    className={`py-3 rounded-lg text-body-sm font-mono-display transition-all ${amount === a ? "gradient-primary text-primary-foreground glow-orange" : "bg-secondary text-foreground hover:bg-secondary/80"}`}
                  >
                    {a} BTC
                  </button>
                ))}
              </div>
              <div className="relative">
                <Input
                  value={customAmount}
                  onChange={(e) => { setCustomAmount(e.target.value); setAmount(null); }}
                  type="number"
                  step="0.001"
                  placeholder="Custom amount"
                  className="bg-secondary border-border/50 pr-14"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-muted-foreground font-mono-display">BTC</span>
              </div>
              <Button
                disabled={selectedAmount <= 0}
                onClick={() => setStep(1)}
                className="w-full gradient-primary text-primary-foreground gap-2"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {/* Step 1: Confirm */}
          {step === 1 && (
            <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5 py-2">
              <div className="glass rounded-xl p-5 space-y-3 text-body-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-mono-display">{selectedAmount} BTC</span></div>
                <div className="flex justify-between text-caption"><span className="text-muted-foreground">Recipient</span><span className="font-mono text-muted-foreground truncate max-w-[200px]">{campaign.creatorAddress}</span></div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(0)} className="flex-1 gap-1"><ArrowLeft className="w-4 h-4" /> Back</Button>
                <Button onClick={handleConfirm} className="flex-1 gradient-primary text-primary-foreground glow-orange">Confirm</Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Processing / Result */}
          {step === 2 && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-5 py-6">
              {status === "processing" && (
                <>
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  <p className="text-body text-muted-foreground">Confirming on-chain...</p>
                  <p className="text-caption text-muted-foreground">This may take a moment</p>
                </>
              )}
              {status === "success" && (
                <>
                  <CelebrationEffect />
                  <p className="text-body text-muted-foreground mt-4">You contributed <span className="text-primary font-mono-display font-semibold">{selectedAmount} BTC</span></p>
                  {txId && (
                    <div className="glass rounded-lg p-3 w-full">
                      <p className="text-caption text-muted-foreground">Transaction Hash</p>
                      <a href={getExplorerUrl(txId)} target="_blank" rel="noopener noreferrer" className="font-mono text-body-sm text-primary break-all hover:underline">{txId}</a>
                    </div>
                  )}
                  <Button onClick={() => handleClose(false)} className="gradient-primary text-primary-foreground">Done</Button>
                </>
              )}
              {status === "error" && (
                <>
                  <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-destructive" />
                  </div>
                  <p className="text-body-sm text-muted-foreground text-center">{errorMsg}</p>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => handleClose(false)}>Cancel</Button>
                    <Button onClick={handleConfirm} className="gradient-primary text-primary-foreground">Retry</Button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
