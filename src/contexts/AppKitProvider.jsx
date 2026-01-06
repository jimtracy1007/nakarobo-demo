import { createAppKit } from '@reown/appkit/react'
import { WagmiProvider } from 'wagmi'
import { mainnet, sepolia, base, baseSepolia } from '@reown/appkit/networks'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

// 0. Setup queryClient
const queryClient = new QueryClient()

// 1. Get projectId
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID

if (!projectId) {
    throw new Error('VITE_REOWN_PROJECT_ID is not set')
}

// 2. Create metadata
const metadata = {
    name: 'Nakarobo',
    description: 'Nakarobo Network Platform',
    url: 'https://nakarobo.ai',
    icons: ['https://nakarobo.ai/icon.png']
}

// 3. Set networks
const networks = [baseSepolia, base]


// 4. Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
    networks,
    projectId,
    ssr: false
})

// 5. Create AppKit instance
createAppKit({
    adapters: [wagmiAdapter],
    networks,
    projectId,
    metadata,
    features: {
        analytics: true
    }
})

export function AppKitProvider({ children }) {
    return (
        <WagmiProvider config={wagmiAdapter.wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    )
}

export { wagmiAdapter }
