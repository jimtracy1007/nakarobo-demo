import { useAppKit } from '@reown/appkit/react'
import { useConnection, useDisconnect } from 'wagmi'
import { Button } from 'antd'
import { WalletOutlined } from '@ant-design/icons'
import { formatAddress } from '@/utils/format'

/**
 * 钱包连接按钮组件
 */
export function WalletButton({ size = 'middle', type = 'primary', onLogin, isAuthenticated, isLoggingIn }) {
    const { open } = useAppKit()
    const { address, isConnected } = useConnection()
    const { mutate } = useDisconnect()
    console.log("address",address,isConnected)



    if (isConnected) {
        // If we have auth props and interpret as not authenticated, prompt to sign in
        // We check 'isAuthenticated !== true' to handle undefined for backward compat if needed, 
        // though Layout passes it now.
        const showLogin = onLogin && isAuthenticated === false

        if (showLogin) {
            return (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Button
                        type="primary"
                        size={size}
                        loading={isLoggingIn}
                        onClick={() => {
                            console.log('[WalletButton] Sign In clicked. onLogin type:', typeof onLogin)
                            if (onLogin) onLogin()
                        }}
                    >
                        Sign In via Wallet
                    </Button>
                    <Button
                        size={size}
                        onClick={() => mutate()}
                    >
                        Disconnect
                    </Button>
                </div>
            )
        }

        return (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Button
                    size={size}
                    onClick={() => open()}
                >
                    <WalletOutlined />
                    {formatAddress(address)}
                </Button>
                <Button
                    size={size}
                    onClick={() => mutate()}
                >
                    Disconnect
                </Button>
            </div>
        )
    }

    return (
        <Button
            type={type}
            size={size}
            icon={<WalletOutlined />}
            onClick={() => open()}
        >
            Connect Wallet
        </Button>
    )
}


export default WalletButton
