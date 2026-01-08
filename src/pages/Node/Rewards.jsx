import { useState, useEffect } from 'react'
import { Card, Button, Row, Col, Typography, Progress, Tag, Space, Spin, Steps } from 'antd'
import { RightOutlined, ThunderboltFilled, SafetyCertificateFilled, SyncOutlined, DatabaseFilled, ApiFilled } from '@ant-design/icons'
import { StakeModal } from '@/components/modals/StakeModal'
import { DepositModal } from '@/components/modals/DepositModal'
import { RedeemModal } from '@/components/modals/RedeemModal'
import { UnstakeModal } from '@/components/modals/UnstakeModal'
import { nodeAPI } from '@/api'

const { Title, Text } = Typography

function LowerInfo() {
    return (
        <div>
            <Title level={3} style={{ color: '#fff', marginBottom: 8, fontSize: 24 }}>Your Naka Node NAKAPT</Title>
            <Text style={{ color: '#666', marginBottom: 40, display: 'block', fontSize: 16 }}>Three ways to use it — all with zero risk</Text>

            <Row gutter={48}>
                <Col span={8}>
                    <div style={{ paddingRight: 24 }}>
                        <div style={{
                            color: '#f7931a',
                            fontSize: 40,
                            marginBottom: 24,
                            width: 64, height: 64,
                            border: '1px solid #333',
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}><ApiFilled /></div>

                        <Title level={4} style={{ color: '#fff', marginBottom: 16, fontSize: 20 }}>Hold</Title>
                        <Text style={{ color: '#888', fontSize: 14, lineHeight: '1.6' }}>
                            Do nothing; you keep your redemption rights and compound your NAKAPT at 30% APY while participating in any NAKA upside.
                        </Text>
                    </div>
                </Col>
                <Col span={8}>
                    <div style={{ paddingRight: 24 }}>
                        <div style={{
                            color: '#f7931a',
                            fontSize: 40,
                            marginBottom: 24,
                            width: 64, height: 64,
                            border: '1px solid #333',
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}><SyncOutlined /></div>

                        <Title level={4} style={{ color: '#fff', marginBottom: 16, fontSize: 20 }}>Redeem</Title>
                        <Text style={{ color: '#888', fontSize: 14, lineHeight: '1.6' }}>
                            Redeem any portion of your NAKAPT for the same asset and amount you originally deposited.
                        </Text>
                    </div>
                </Col>
                <Col span={8}>
                    <div style={{ paddingRight: 24 }}>
                        <div style={{
                            color: '#f7931a',
                            fontSize: 40,
                            marginBottom: 24,
                            width: 64, height: 64,
                            border: '1px solid #333',
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            opacity: 0.5
                        }}>?</div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            <Title level={4} style={{ color: '#fff', margin: 0, fontSize: 20 }}>Withdraw</Title>
                            <Tag style={{ background: '#1f1f1f', border: '1px solid #333', color: '#888', borderRadius: 4 }}>Coming soon</Tag>
                        </div>
                        <Text style={{ color: '#888', fontSize: 14, lineHeight: '1.6' }}>
                            Withdraw a portion or all of your NAKAPT out of the staked assets. The withdrawn amount loses redemption rights and its backing is used for NAKA buybacks and burn.
                        </Text>
                    </div>
                </Col>
            </Row>
        </div>
    )
}

export function NodeRewards() {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState(null)

    // Modal States
    const [stakeOpen, setStakeOpen] = useState(false)
    const [depositOpen, setDepositOpen] = useState(false)
    const [redeemOpen, setRedeemOpen] = useState(false)
    const [unstakeOpen, setUnstakeOpen] = useState(false)

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await nodeAPI.getAssetSummary();
            setData(res);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
                <Spin size="large" />
            </div>
        )
    }

    // Safety check if data is null (shouldn't happen due to loading state but good for robustness)
    const safeData = data || {
        hasNode: false,
        node: { totalNakapt: 0, staked: 0, rewards: 0, pendingStake: 0, apr: '0%' },
        assets: { redeemable: 0, baseRewards: 0, bonus: 1.0, nextBonus: 1.1, utilization: 0 }
    };

    const bonusTicks = ['1.0x', '1.1x', '1.2x', '1.3x', '1.4x', '1.5x']
    const depositTicks = ['50,000', '100,000+']
    const bonusProgress = Math.min(100, Math.max(0, ((safeData.assets.bonus - 1) / 0.5) * 100))
    const utilizationPercent = safeData.assets.utilization

    const noNodeView = (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ marginBottom: 36 }}>
                <Title level={1} style={{ color: '#fff', fontSize: 40, marginBottom: 8 }}>Node Rewards</Title>
                <Text style={{ color: '#999', fontSize: 16 }}>Own a Naka Node. Earn NAKAPT. Power Physical AI. <a style={{ color: '#f7931a' }}>Learn more <RightOutlined /></a></Text>
            </div>

            <Card
                style={{ background: '#0f0f0f', border: '1px solid #1f1f1f', marginBottom: 48 }}
                bodyStyle={{ padding: 48, display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 48, alignItems: 'center' }}
            >
                <div>
                    <Title level={2} style={{ color: '#fff', margin: 0, fontSize: 32 }}>Your Naka Node awaits</Title>
                    <Text style={{ color: '#8c8c8c', display: 'block', margin: '16px 0 32px', fontSize: 16, lineHeight: '1.6' }}>
                        Deposit your assets to mint a Naka Node for FREE — then stake NAKAPT on the node and enjoy up to 30% APY in rewards.
                    </Text>
                    <Button
                        type="primary"
                        size="large"
                        style={{ height: 48, padding: '0 32px', fontSize: 16, background: '#f7931a', borderColor: '#f7931a', color: '#000', fontWeight: 'bold' }}
                        onClick={() => setDepositOpen(true)}
                    >
                        Mint Node
                    </Button>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        height: 240,
                        borderRadius: 24,
                        background: 'radial-gradient(120% 120% at 50% 50%, rgba(247,147,26,0.15), rgba(0,0,0,0))',
                        border: '1px solid #1f1f1f',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#f7931a',
                        fontSize: 64
                    }}>
                        <ApiFilled />
                    </div>
                </div>
            </Card>

            <LowerInfo />
            <DepositModal open={depositOpen} onCancel={() => setDepositOpen(false)} onSuccess={fetchData} />
        </div>
    )

    if (!safeData.hasNode) {
        return noNodeView
    }

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 60 }}>
            {/* Header */}
            <div style={{ marginBottom: 48 }}>
                <Title level={1} style={{ color: '#fff', fontSize: 40, marginBottom: 8 }}>Node Rewards</Title>
                <Text style={{ color: '#999', fontSize: 16 }}>Own a Naka Node. Earn NAKAPT. Power Physical AI. <a style={{ color: '#f7931a', marginLeft: 8 }}>Learn more <RightOutlined /></a></Text>
            </div>

            <Row gutter={24} style={{ marginBottom: 80 }}>
                {/* Card 1: NAKAPT Node (Staking) */}
                <Col span={12}>
                    <div style={{
                        background: '#141414',
                        borderRadius: 16,
                        overflow: 'hidden',
                        border: '1px solid #333',
                        height: '100%',
                        display: 'flex', flexDirection: 'column'
                    }}>
                        {/* Visual Header */}
                        <div style={{
                            height: 180,
                            background: 'linear-gradient(180deg, #1f1f1f 0%, #141414 100%)',
                            borderBottom: '1px solid #1f1f1f',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            position: 'relative'
                        }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1, background: 'radial-gradient(circle at center, #666 0%, transparent 70%)' }}></div>
                            <div style={{ color: '#444', fontSize: 80, zIndex: 1 }}><ThunderboltFilled /></div>
                        </div>

                        <div style={{ padding: 32, flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <div style={{ fontSize: 20, color: '#fff', fontWeight: 600 }}>NAKAPT Node <span style={{ color: '#f7931a' }}>{safeData?.node.apr} APR</span></div>
                                <Tag color="success" style={{ borderRadius: 12, padding: '0 10px', background: '#0f2f16', border: '1px solid #135225', color: '#52c41a' }}>● Running</Tag>
                            </div>
                            <div style={{ color: '#666', fontSize: 14, marginBottom: 32 }}>Compound staking with principal protection</div>

                            <div style={{ marginBottom: 32 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, borderBottom: '1px solid #1f1f1f', paddingBottom: 20 }}>
                                    <Text style={{ color: '#ccc', fontSize: 16 }}>Total NAKAPT on Node</Text>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Text style={{ color: '#f7931a', fontSize: 24, fontWeight: 'bold' }}>{safeData?.node.totalNakapt.toLocaleString()}</Text>
                                        <Tag style={{ background: '#331d0b', border: '1px solid #522d0f', color: '#f7931a', margin: 0 }}>NAKAPT</Tag>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
                                    <Text style={{ color: '#888' }}>Staked NAKAPT</Text>
                                    <Text style={{ color: '#fff' }}>{safeData?.node.staked.toLocaleString()}</Text>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
                                    <Text style={{ color: '#888' }}>Staking Rewards NAKAPT</Text>
                                    <Text style={{ color: '#52c41a' }}>+{safeData?.node.rewards}</Text>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                                    <Text style={{ color: '#888' }}>Pending Stake NAKAPT</Text>
                                    <Text style={{ color: '#fff' }}>{safeData?.node.pendingStake}</Text>
                                </div>
                            </div>

                            <Row gutter={16} style={{ marginTop: 'auto' }}>
                                <Col span={12}>
                                    <Button
                                        size="large"
                                        block
                                        style={{ height: 48, background: 'transparent', borderColor: '#333', color: '#fff' }}
                                        onClick={() => setUnstakeOpen(true)}
                                    >
                                        Unstake
                                    </Button>
                                </Col>
                                <Col span={12}>
                                    <Button
                                        type="primary"
                                        size="large"
                                        block
                                        style={{ height: 48, background: '#f7931a', borderColor: '#f7931a', color: '#000', fontWeight: 'bold' }}
                                        onClick={() => setStakeOpen(true)}
                                    >
                                        Stake
                                    </Button>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </Col>

                {/* Card 2: Deposit Assets */}
                <Col span={12}>
                    <div style={{
                        background: '#141414',
                        borderRadius: 16,
                        overflow: 'hidden',
                        border: '1px solid #333',
                        height: '100%',
                        display: 'flex', flexDirection: 'column'
                    }}>
                        {/* Visual Header */}
                        <div style={{
                            height: 180,
                            background: 'linear-gradient(180deg, #262626 0%, #141414 100%)',
                            borderBottom: '1px solid #1f1f1f',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            position: 'relative'
                        }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1, background: 'linear-gradient(45deg, transparent 40%, #fff 50%, transparent 60%)' }}></div>
                            <div style={{ color: '#555', fontSize: 80, zIndex: 1 }}><DatabaseFilled /></div>
                        </div>

                        <div style={{ padding: 32, flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ fontSize: 20, color: '#fff', fontWeight: 600, marginBottom: 8 }}>Deposit to your Naka Node to Earn More</div>
                            <div style={{ color: '#666', fontSize: 14, marginBottom: 32 }}>Boost Base Rewards—with bonuses, principal protection, and unlimited upside. <a style={{ color: '#f7931a' }}>Learn more &gt;</a></div>

                            <div style={{ marginBottom: 32 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, borderBottom: '1px solid #1f1f1f', paddingBottom: 20 }}>
                                    <Text style={{ color: '#ccc', fontSize: 16 }}>Redeemable Deposits</Text>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Text style={{ color: '#f7931a', fontSize: 24, fontWeight: 'bold' }}>{safeData?.assets.redeemable.toLocaleString()}</Text>
                                        <span style={{ color: '#888', fontSize: 14 }}>USD</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                                    <Text style={{ color: '#888', fontSize: 14 }}>Base Rewards</Text>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <Text style={{ color: '#f7931a', fontSize: 14 }}>{safeData?.assets.baseRewards.toLocaleString()}</Text>
                                        <Tag style={{ background: '#331d0b', border: '1px solid #522d0f', color: '#f7931a', margin: 0, fontSize: 10, lineHeight: '16px', height: 18 }}>NAKAPT</Tag>
                                    </div>
                                </div>

                                {/* Bonus Progress */}
                                <div style={{ marginBottom: 20 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                                        <Text style={{ color: '#888' }}>Current Bonus</Text>
                                        <div style={{ color: '#f7931a' }}>
                                            <b>{safeData?.assets.bonus}x</b> <span style={{ color: '#444', marginLeft: 8 }}>{safeData?.assets.nextBonus}x</span>
                                        </div>
                                    </div>
                                    <Progress
                                        percent={bonusProgress}
                                        showInfo={false}
                                        strokeColor="#f7931a"
                                        trailColor="#333"
                                        strokeWidth={6}
                                        style={{ marginBottom: 8 }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#444' }}>
                                        {bonusTicks.map((b) => <span key={b}>{b}</span>)}
                                    </div>
                                </div>

                                {/* Utilization Progress */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                                        <Text style={{ color: '#888' }}>Deposit Utilization</Text>
                                        <Text style={{ color: '#f7931a' }}>{utilizationPercent}%</Text>
                                    </div>
                                    <Progress
                                        percent={utilizationPercent}
                                        showInfo={false}
                                        strokeColor="#f7931a"
                                        trailColor="#333"
                                        strokeWidth={6}
                                        style={{ marginBottom: 8 }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#444' }}>
                                        {depositTicks.map((d) => <span key={d}>{d}</span>)}
                                    </div>
                                </div>
                            </div>

                            <Row gutter={16} style={{ marginTop: 'auto' }}>
                                <Col span={12}>
                                    <Button
                                        size="large"
                                        block
                                        style={{ height: 48, background: 'transparent', borderColor: '#333', color: '#fff' }}
                                        onClick={() => setRedeemOpen(true)}
                                    >
                                        Redeem
                                    </Button>
                                </Col>
                                <Col span={12}>
                                    <Button
                                        type="primary"
                                        size="large"
                                        block
                                        style={{ height: 48, background: '#f7931a', borderColor: '#f7931a', color: '#000', fontWeight: 'bold' }}
                                        onClick={() => setDepositOpen(true)}
                                    >
                                        Deposit
                                    </Button>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </Col>
            </Row>

            <LowerInfo />

            {/* Modals */}
            <StakeModal open={stakeOpen} onCancel={() => setStakeOpen(false)} onSuccess={fetchData} availablePoints={safeData?.node.totalNakapt} />
            <UnstakeModal open={unstakeOpen} onCancel={() => setUnstakeOpen(false)} onSuccess={fetchData} stakedAmount={safeData?.node.staked} />
            <DepositModal open={depositOpen} onCancel={() => setDepositOpen(false)} onSuccess={fetchData} />
            <RedeemModal open={redeemOpen} onCancel={() => setRedeemOpen(false)} onSuccess={fetchData} assetData={{ redeemableUsd: safeData?.assets.redeemable }} />
        </div>
    )
}

export default NodeRewards
