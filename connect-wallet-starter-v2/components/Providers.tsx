'use client'

import { NetworkId, WalletId, WalletManager, WalletProvider } from '@txnlab/use-wallet-react'
import { WalletUIProvider } from '@txnlab/use-wallet-ui-react'
import '@txnlab/use-wallet-ui-react/dist/style.css'

const walletManager = new WalletManager({
  wallets: [WalletId.PERA, WalletId.DEFLY, WalletId.LUTE],
  defaultNetwork: NetworkId.TESTNET,
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider manager={walletManager}>
      <WalletUIProvider>
        {children}
      </WalletUIProvider>
    </WalletProvider>
  )
}
