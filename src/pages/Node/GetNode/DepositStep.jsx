import { useState, useMemo } from 'react'
import { Card, InputNumber, Button, Select, Steps, Progress, Typography, Space, message, Divider } from 'antd'
import { InfoCircleOutlined, WalletOutlined } from '@ant-design/icons'
import { useAccount } from 'wagmi'
import { nodeAPI } from '@/api'

const { Option } = Select
const { Text } = Typography

export function DepositStep({ onBack, onComplete, setupData }) {
    const { address } = useAccount()
    const [token, setToken] = useState('USDT')
    const [amount, setAmount] = useState(null)
    const [loading, setLoading] = useState(false)
    const [approving, setApproving] = useState(false)
    const [isApproved, setIsApproved] = useState(false) // Mock approval state

    // Mock Bonus Calculation
    const bonusInfo = useMemo(() => {
        const val = Number(amount) || 0
        let multiplier = 1.0
        if (val >= 2000) multiplier = 1.2
        else if (val >= 1000) multiplier = 1.15
        else if (val >= 500) multiplier = 1.1
        else if (val >= 100) multiplier = 1.05

        // Base Rewards = Amount * Multiplier * 10 (Mock rate)
        const estimatedPoints = Math.floor(val * multiplier * 10)

        // Progress for next tier
        let nextTier = 100
        let percent = 0
        if (multiplier === 1.0) { nextTier = 100; percent = (val / 100) * 100 }
        else if (multiplier === 1.05) { nextTier = 500; percent = ((val - 100) / 400) * 100 }
        else if (multiplier === 1.1) { nextTier = 1000; percent = ((val - 500) / 500) * 100 }
        else if (multiplier === 1.15) { nextTier = 2000; percent = ((val - 1000) / 1000) * 100 }
        else { percent = 100 }

        return { multiplier, estimatedPoints, nextTier, percent }
    }, [amount])

    const handleApprove = async () => {
        setApproving(true)
        try {
            // Mock Approve Transaction
            await new Promise(resolve => setTimeout(resolve, 1500))
            setIsApproved(true)
            message.success(`Approved ${token} successfully`)
        } catch (error) {
            console.error('Approve failed', error)
            message.error('Approve failed')
        } finally {
            setApproving(false)
        }
    }

    const handleDeposit = async () => {
        if (!amount || amount < 10) {
            message.error('Minimum deposit is 10 ' + token)
            return
        }

        setLoading(true)
        try {
            // Mock Deposit Transaction
            await new Promise(resolve => setTimeout(resolve, 2000))

            // Note: Node creation is handled on-chain by the contract.
            // Backend will index the event automatically.
            console.log('Contract Deposit/Mint successful', {
                name: setupData.name,
                avatarId: setupData.avatarId,
                txHash: mockTxHash
            })

            message.success('Node created successfully!')
            onComplete()
        } catch (error) {
            console.error('Deposit failed', error)
            message.error('Failed to create node')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <h2>Initial Deposit</h2>
                <p style={{ color: '#666' }}>Deposit assets to activate your node and start earning base rewards</p>
            </div>

            <Card>
                <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text type="secondary">Deposit Asset</Text>
                        <Text type="secondary">Balance: 1,234.56 {token}</Text>
                    </div>
                    <Space.Compact style={{ width: '100%' }}>
                        <Select
                            value={token}
                            onChange={setToken}
                            size="large"
                            style={{ width: 120 }}
                        >
                            <Option value="USDT">USDT</Option>
                            <Option value="USDC">USDC</Option>
                        </Select>
                        <InputNumber
                            style={{ width: '100%' }}
                            size="large"
                            placeholder="Min 10"
                            min={0}
                            value={amount}
                            onChange={setAmount}
                            precision={2}
                        />
                    </Space.Compact>
                </div>

                {/* Bonus Tier Info */}
                <div style={{ background: '#f9f9f9', padding: 16, borderRadius: 8, marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text strong>Current Bonus: {bonusInfo.multiplier}x</Text>
                        <Text type="secondary">Estimated Base Rewards: {bonusInfo.estimatedPoints} pts</Text>
                    </div>

                    <Progress
                        percent={bonusInfo.percent}
                        showInfo={false}
                        strokeColor="#f7931a"
                        trailColor="#eee"
                    />

                    {bonusInfo.multiplier < 1.2 && (
                        <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                            Deposit {formatNumber(bonusInfo.nextTier - (amount || 0))} more to reach {(bonusInfo.multiplier + 0.05).toFixed(2)}x
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: 16 }}>
                    {!isApproved ? (
                        <Button
                            type="primary"
                            size="large"
                            block
                            onClick={handleApprove}
                            loading={approving}
                            disabled={!amount || amount <= 0}
                        >
                            Approve {token}
                        </Button>
                    ) : (
                        <Button
                            type="primary"
                            size="large"
                            block
                            onClick={handleDeposit}
                            loading={loading}
                            style={{ background: '#f7931a', borderColor: '#f7931a' }}
                        >
                            Confirm Deposit
                        </Button>
                    )}
                </div>

                <div style={{ marginTop: 16, textAlign: 'center' }}>
                    <Button type="link" onClick={onBack} disabled={loading || approving}>
                        Back to Setup
                    </Button>
                </div>
            </Card>
        </div>
    )
}

function formatNumber(num) {
    if (num < 0) return 0
    return new Intl.NumberFormat().format(num)
}
