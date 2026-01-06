import { useState } from 'react'
import { Modal, InputNumber, Button, Typography, Space, App, Alert } from 'antd'

const { Text } = Typography

export function UnstakeModal({ open, onCancel, onSuccess, stakedAmount = 0 }) {
    const { message } = App.useApp()
    const [amount, setAmount] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleUnstake = async () => {
        if (!amount || amount <= 0) return
        if (amount > stakedAmount) {
            message.error('Exceeds staked amount')
            return
        }

        setLoading(true)
        try {
            // TODO: Contract Unstake
            // await contract.unstake(...)

            // await new Promise(resolve => setTimeout(resolve, 1500))

            message.success('Unstaked successfully! (Note: Redemption rights reduced)')
            onSuccess?.()
            onCancel()
            setAmount(null)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            title="Unstake NAKAPT"
            open={open}
            onCancel={onCancel}
            footer={null}
            width={400}
        >
            <Alert
                type="warning"
                showIcon
                message="Unstaking reduces your node's voting power and may affect future rewards."
                style={{ marginBottom: 24 }}
            />

            <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text type="secondary">Unstake Amount</Text>
                    <Text type="secondary">Staked: {stakedAmount.toLocaleString()}</Text>
                </div>
                <Space.Compact style={{ width: '100%' }}>
                    <InputNumber
                        style={{ width: '100%' }}
                        size="large"
                        placeholder="Min 1"
                        min={0}
                        max={stakedAmount}
                        value={amount}
                        onChange={setAmount}
                        precision={0}
                    />
                    <Button size="large" onClick={() => setAmount(stakedAmount)}>Max</Button>
                </Space.Compact>
            </div>

            <Button
                type="primary"
                danger
                size="large"
                block
                onClick={handleUnstake}
                loading={loading}
                disabled={!amount || amount <= 0}
            >
                Confirm Unstake
            </Button>
        </Modal>
    )
}

export default UnstakeModal
