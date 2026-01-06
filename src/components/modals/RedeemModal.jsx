import { useState, useMemo } from 'react'
import { Modal, InputNumber, Button, Checkbox, Typography, Space, App, Divider, Alert } from 'antd'
import { WarningOutlined } from '@ant-design/icons'

const { Text } = Typography

export function RedeemModal({ open, onCancel, onSuccess, assetData }) {
    const { message } = App.useApp()
    const [amount, setAmount] = useState(null)
    const [loading, setLoading] = useState(false)
    const [confirmed, setConfirmed] = useState(false)

    // Mock data for calculation
    const maxRedeemable = assetData?.redeemableUsd || 0
    const totalPoints = 50000 // Mock: Current Total Points on Node
    const stakedPoints = 10000 // Mock
    const rewards = 5000 // Mock

    // TODO: Calculate Burn Points from Contract
    const burnInfo = useMemo(() => {
        return {
            burn: 0,
            percent: 0,
            currentMult: 0,
            nextMult: 0
        }
    }, [amount, maxRedeemable])

    const handleRedeem = async () => {
        if (!amount || amount <= 0) return
        if (amount > maxRedeemable) {
            message.error('Exceeds redeemable balance')
            return
        }

        setLoading(true)
        try {
            // TODO: Contract Redeem
            // await contract.redeem(...)

            // await new Promise(resolve => setTimeout(resolve, 2000))

            message.success('Redeemed successfully!')
            onSuccess?.()
            onCancel()
            setAmount(null)
            setConfirmed(false)
        } catch (error) {
            message.error('Redeem failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            title={<Space><WarningOutlined style={{ color: '#faad14' }} /> Redeem Assets</Space>}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={500}
        >
            <Alert
                message="Redeeming assets will reduce your node's mining power and burn a portion of your points."
                type="warning"
                showIcon
                style={{ marginBottom: 24 }}
            />

            <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text type="secondary">Redeem Amount (USDT)</Text>
                    <Text type="secondary">Available: {formatNumber(maxRedeemable)}</Text>
                </div>
                <InputNumber
                    style={{ width: '100%' }}
                    size="large"
                    placeholder="Enter amount"
                    min={0}
                    max={maxRedeemable}
                    value={amount}
                    onChange={setAmount}
                    precision={2}
                />
            </div>

            <div style={{ background: '#fff1f0', border: '1px solid #ffccc7', padding: 16, borderRadius: 8, marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text type="danger">Points to Burn:</Text>
                    <Text type="danger" strong>-{formatNumber(burnInfo.burn)} pts</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: '#666' }}>
                    <span>Redeem Ratio:</span>
                    <span>{burnInfo.percent}%</span>
                </div>
                <Divider style={{ margin: '8px 0', borderColor: '#ffccc7' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span>Multiplier Change:</span>
                    <span>{burnInfo.currentMult}x → {burnInfo.nextMult}x</span>
                </div>
            </div>

            <div style={{ marginBottom: 24 }}>
                <Checkbox checked={confirmed} onChange={e => setConfirmed(e.target.checked)}>
                    I understand that this action is irreversible and will reduce my future rewards.
                </Checkbox>
            </div>

            <Button
                type="primary"
                danger
                size="large"
                block
                onClick={handleRedeem}
                loading={loading}
                disabled={!amount || amount <= 0 || !confirmed}
            >
                Confirm Redeem
            </Button>
        </Modal>
    )
}

function formatNumber(num) {
    if (num < 0) return 0
    return new Intl.NumberFormat().format(num)
}

export default RedeemModal
