import { useState } from 'react'
import { Modal, InputNumber, Button, Typography, Space, App } from 'antd'

const { Text } = Typography

export function StakeModal({ open, onCancel, onSuccess, availablePoints = 0 }) {
    const { message } = App.useApp()
    const [amount, setAmount] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleStake = async () => {
        if (!amount || amount <= 0) return
        if (amount > availablePoints) {
            message.error('Exceeds available points')
            return
        }

        setLoading(true)
        try {
            // TODO: Contract Stake
            // await contract.stake(...)

            // await new Promise(resolve => setTimeout(resolve, 1500))

            message.success('Staked points successfully!')
            onSuccess?.()
            onCancel()
            setAmount(null)
        } catch (error) {
            message.error('Stake failed')
        } finally {
            setLoading(false)
        }
    }

    const handleMax = () => setAmount(availablePoints)

    return (
        <Modal
            title="Stake Points"
            open={open}
            onCancel={onCancel}
            footer={null}
            width={400}
        >
            <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text type="secondary">Stake Amount</Text>
                    <Text type="secondary">Available: {new Intl.NumberFormat().format(availablePoints)}</Text>
                </div>
                <Space.Compact style={{ width: '100%' }}>
                    <InputNumber
                        style={{ width: '100%' }}
                        size="large"
                        placeholder="Min 1"
                        min={0}
                        max={availablePoints}
                        value={amount}
                        onChange={setAmount}
                        precision={0}
                    />
                    <Button size="large" onClick={handleMax}>Max</Button>
                </Space.Compact>
            </div>

            <div style={{ background: '#f9f9f9', padding: 16, borderRadius: 8, marginBottom: 24 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                    Staking points increases your node's influence and potential rewards.
                    You can unstake later (subject to lock-up periods).
                </Text>
            </div>

            <Button
                type="primary"
                size="large"
                block
                onClick={handleStake}
                loading={loading}
                disabled={!amount || amount <= 0}
                style={{ background: '#722ed1', borderColor: '#722ed1' }}
            >
                Confirm Stake
            </Button>
        </Modal>
    )
}

export default StakeModal
