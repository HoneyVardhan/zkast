import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useWallet } from "@txnlab/use-wallet-react";

interface AuthContextType {
  user: { address: string } | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { activeAccount, isReady, activeWallet } = useWallet();
  const [user, setUser] = useState<{ address: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isReady) {
      if (activeAccount) {
        setUser({ address: activeAccount.address });
      } else {
        setUser(null);
      }
      setLoading(false);
    }
  }, [activeAccount, isReady]);

  const signOut = async () => {
    if (activeWallet) {
      await activeWallet.disconnect();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}



export function useAuth() {
  return useContext(AuthContext);
}

