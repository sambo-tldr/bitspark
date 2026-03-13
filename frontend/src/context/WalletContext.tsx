import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { connect as stacksConnect, disconnect as stacksDisconnect } from "@stacks/connect";
import { truncateAddress } from "@/lib/contracts";

interface WalletState {
  connected: boolean;
  address: string;
  balance: number;
  walletType: string | null;
  connecting: boolean;
  error: string | null;
}

interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  shortAddress: string;
}

const WalletContext = createContext<WalletContextType | null>(null);

const WALLET_STORAGE_KEY = "bitspark_wallet";

function loadSavedWallet(): { address: string; walletType: string } | null {
  try {
    const raw = localStorage.getItem(WALLET_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const saved = loadSavedWallet();
  const [state, setState] = useState<WalletState>({
    connected: !!saved,
    address: saved?.address || "",
    balance: 0,
    walletType: saved?.walletType || null,
    connecting: false,
    error: null,
  });

  // Restore session on mount
  useEffect(() => {
    if (saved?.address) {
      setState((s) => ({ ...s, connected: true, address: saved.address, walletType: saved.walletType }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connect = useCallback(async () => {
    setState((s) => ({ ...s, connecting: true, error: null }));
    try {
      const response = await stacksConnect();
      const stxAddress = response.addresses.find(
        (a: { symbol: string }) => a.symbol === "STX"
      )?.address ||
        response.addresses[response.addresses.length - 1]?.address ||
        "";

      if (!stxAddress) {
        setState((s) => ({ ...s, connecting: false, error: "No STX address found in wallet" }));
        return;
      }

      const walletType = "Stacks Wallet";
      localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify({ address: stxAddress, walletType }));

      setState({
        connected: true,
        address: stxAddress,
        balance: 0,
        walletType,
        connecting: false,
        error: null,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Connection failed";
      setState((s) => ({ ...s, connecting: false, error: message }));
    }
  }, []);

  const disconnect = useCallback(() => {
    stacksDisconnect();
    localStorage.removeItem(WALLET_STORAGE_KEY);
    setState({
      connected: false,
      address: "",
      balance: 0,
      walletType: null,
      connecting: false,
      error: null,
    });
  }, []);

  const shortAddress = state.address ? truncateAddress(state.address) : "";

  return (
    <WalletContext.Provider value={{ ...state, connect, disconnect, shortAddress }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
