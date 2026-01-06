import { useState, useMemo } from 'react'
import { Modal, InputNumber, Button, Select, Progress, Typography, Space, App, Divider } from 'antd'
import { useAccount } from 'wagmi'
import { nodeAPI } from '@/api'

const { Option } = Select
const { Text } = Typography

export function DepositModal({ open, onCancel, onSuccess }) {
    const { message } = App.useApp()
    const { address } = useAccount()
    const [token, setToken] = useState('USDT')
    const [amount, setAmount] = useState(null)
    const [loading, setLoading] = useState(false)
    const [approving, setApproving] = useState(false)
    // TODO: READ from Contract
    const [isApproved, setIsApproved] = useState(false)

    // TODO: Calculate Bonus from Contract/Backend
    const bonusInfo = useMemo(() => {
        return { multiplier: 0, estimatedPoints: 0, nextTier: 0, percent: 0 }
    }, [amount])

    const handleApprove = async () => {
        setApproving(true)
        try {
            // TODO: Contract Approve
            // await contract.approve(...)

            // await new Promise(resolve => setTimeout(resolve, 1000))
            // setIsApproved(true)
            message.success(`Approved ${token} successfully`)
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
            // TODO: Contract Deposit
            // await contract.deposit(...)

            // await new Promise(resolve => setTimeout(resolve, 1500))
            // Mock API call if needed, or just refresh
            message.success('Deposit successful!')
            onSuccess?.()
            onCancel()
            // Reset state
            setAmount(null)
            setIsApproved(false)
        } catch (error) {
            message.error('Deposit failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            title="Deposit Assets"
            open={open}
            onCancel={onCancel}
            footer={null}
            width={500}
        >
            <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text type="secondary">Asset</Text>
                    <Text type="secondary">Balance: 1,234.56 {token}</Text>
                </div>
                <Space.Compact style={{ width: '100%' }}>
                    <Select
                        value={token}
                        onChange={setToken}
                        size="large"
                        style={{ width: 100 }}
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

            <div style={{ background: '#f9f9f9', padding: 16, borderRadius: 8, marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text strong>Bonus Multiplier: {bonusInfo.multiplier}x</Text>
                    <Text type="secondary">Est. Rewards: {bonusInfo.estimatedPoints} pts</Text>
                </div>
                <Progress
                    percent={bonusInfo.percent}
                    showInfo={false}
                    strokeColor="#f7931a"
                    trailColor="#eee"
                />
                {bonusInfo.multiplier < 1.2 && (
                    <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                        Add {formatNumber(bonusInfo.nextTier - (amount || 0))} more for {(bonusInfo.multiplier + 0.05).toFixed(2)}x
                    </div>
                )}
            </div>

            <Space style={{ width: '100%' }} direction="vertical">
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
            </Space>
        </Modal>
    )
}

function formatNumber(num) {
    if (num < 0) return 0
    return new Intl.NumberFormat().format(num)
}

export default DepositModal
