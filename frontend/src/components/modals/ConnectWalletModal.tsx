import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/context/WalletContext";
import { Check, Loader2, AlertCircle, Wallet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRM } from "@/lib/motion";

const wallets = [
  { id: "leather", name: "Leather", desc: "Popular Stacks wallet" },
  { id: "xverse", name: "Xverse", desc: "Bitcoin & Stacks wallet" },
];

export function ConnectWalletModal() {
  const rm = useRM();
  const { showConnectModal, setShowConnectModal, connect, connecting, connected, error, walletType } = useWallet();

  return (
    <Dialog open={showConnectModal} onOpenChange={setShowConnectModal}>
      <DialogContent className="glass-strong border-border/50 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-heading-2 text-center">
            {connected ? "Wallet Connected" : "Connect Wallet"}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {connected ? (
            <motion.div key="success" initial={rm(false, { opacity: 0, scale: 0.9 })} animate={{ opacity: 1, scale: 1 }} transition={{ duration: rm(0, 0.3) }} className="flex flex-col items-center gap-4 py-6">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
                <Check className="w-8 h-8 text-primary-foreground" />
              </div>
              <p className="text-body text-muted-foreground">Successfully connected with {walletType}</p>
            </motion.div>
          ) : connecting ? (
            <motion.div key="connecting" initial={rm(false, { opacity: 0 })} animate={{ opacity: 1 }} transition={{ duration: rm(0, 0.2) }} className="flex flex-col items-center gap-4 py-10">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-body text-muted-foreground">Connecting to {walletType}...</p>
              <p className="text-caption text-muted-foreground">Please approve in your wallet extension</p>
            </motion.div>
          ) : (
            <motion.div key="select" initial={rm(false, { opacity: 0 })} animate={{ opacity: 1 }} transition={{ duration: rm(0, 0.2) }} className="space-y-3 py-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-body-sm text-destructive">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
              {wallets.map((w) => (
                <button
                  key={w.id}
                  onClick={() => connect(w.name)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl glass hover:bg-secondary/80 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                    <Wallet className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-body font-medium">{w.name}</p>
                    <p className="text-caption text-muted-foreground">{w.desc}</p>
                  </div>
                </button>
              ))}
              <p className="text-caption text-muted-foreground text-center pt-2">
                By connecting, you agree to the Terms of Service
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
