import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface WalletState {
  connected: boolean;
  address: string;
  balance: number;
  walletType: string | null;
  connecting: boolean;
  error: string | null;
}

interface WalletContextType extends WalletState {
  connect: (walletType: string) => Promise<void>;
  disconnect: () => void;
  showConnectModal: boolean;
  setShowConnectModal: (show: boolean) => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [state, setState] = useState<WalletState>({
    connected: false,
    address: "",
    balance: 0.5,
    walletType: null,
    connecting: false,
    error: null,
  });

  const connect = useCallback(async (walletType: string) => {
    setState((s) => ({ ...s, connecting: true, error: null }));
    await new Promise((r) => setTimeout(r, 2000));

    // 10% chance of error for demo
    if (Math.random() < 0.1) {
      setState((s) => ({ ...s, connecting: false, error: "Connection rejected by user" }));
      return;
    }

    setState({
      connected: true,
      address: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
      balance: 0.5,
      walletType,
      connecting: false,
      error: null,
    });
    setTimeout(() => setShowConnectModal(false), 800);
  }, []);

  const disconnect = useCallback(() => {
    setState({
      connected: false,
      address: "",
      balance: 0,
      walletType: null,
      connecting: false,
      error: null,
    });
  }, []);

  return (
    <WalletContext.Provider value={{ ...state, connect, disconnect, showConnectModal, setShowConnectModal }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
