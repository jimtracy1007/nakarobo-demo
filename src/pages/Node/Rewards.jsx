import { useState, useEffect } from 'react'
import { Card, Button, Row, Col, Typography, Progress, Tag, Space, Spin } from 'antd'
import { RightOutlined, ThunderboltFilled, SafetyCertificateFilled, SyncOutlined } from '@ant-design/icons'
import { StakeModal } from '@/components/modals/StakeModal'
import { DepositModal } from '@/components/modals/DepositModal'
import { RedeemModal } from '@/components/modals/RedeemModal'
import { UnstakeModal } from '@/components/modals/UnstakeModal'

const { Title, Text } = Typography

function LowerInfo() {
    return (
        <div>
            <Title level={3} style={{ color: '#fff' }}>Your Naka Node NAKAPT</Title>
            <Text style={{ color: '#666', marginBottom: 32, display: 'block' }}>Three ways to use it — all with zero risk</Text>

            <Row gutter={32}>
                <Col span={8}>
                    <div style={{ borderTop: '2px solid #333', paddingTop: 24 }}>
                        <div style={{ color: '#f7931a', fontSize: 32, marginBottom: 16 }}><SafetyCertificateFilled /></div>
                        <Title level={4} style={{ color: '#fff' }}>Hold</Title>
                        <Text style={{ color: '#666', fontSize: 13 }}>
                            Do nothing; you keep your redemption rights and compound your NAKAPT at 30% APY while participating in any NAKA upside.
                        </Text>
                    </div>
                </Col>
                <Col span={8}>
                    <div style={{ borderTop: '2px solid #333', paddingTop: 24 }}>
                        <div style={{ color: '#f7931a', fontSize: 32, marginBottom: 16 }}><SyncOutlined /></div>
                        <Title level={4} style={{ color: '#fff' }}>Redeem</Title>
                        <Text style={{ color: '#666', fontSize: 13 }}>
                            Redeem any portion of your NAKAPT for the same asset and amount you originally deposited.
                        </Text>
                    </div>
                </Col>
                <Col span={8}>
                    <div style={{ borderTop: '2px solid #333', paddingTop: 24 }}>
                        <div style={{ color: '#f7931a', fontSize: 32, marginBottom: 16, opacity: 0.5 }}>?</div>
                        <Title level={4} style={{ color: '#fff' }}>Withdraw <Tag style={{ background: '#333', border: 0, color: '#999' }}>Coming soon</Tag></Title>
                        <Text style={{ color: '#666', fontSize: 13 }}>
                            Withdraw a portion or all of your NAKAPT out of the staked assets. The withdrawn amount loses redemption rights...
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

    useEffect(() => {
        // Mock Data Fetch
        setTimeout(() => {
            setData({
                hasNode: true,
                node: {
                    totalNakapt: 2000, // on node
                    staked: 2000,
                    rewards: 167,
                    pendingStake: 167,
                    apr: '30%'
                },
                assets: {
                    redeemable: 12167, // USD
                    baseRewards: 11167,
                    bonus: 1.4,
                    nextBonus: 1.5,
                    utilization: 50
                }
            })
            setLoading(false)
        }, 800)
    }, [])

    if (loading || !data) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
                <Spin size="large" />
            </div>
        )
    }

    const bonusTicks = ['1.0x', '1.1x', '1.2x', '1.3x', '1.4x', '1.5x']
    const depositTicks = ['50,000', '100,000+']
    const bonusProgress = Math.min(100, Math.max(0, ((data.assets.bonus - 1) / 0.5) * 100))
    const utilizationPercent = data.assets.utilization

    const noNodeView = (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ marginBottom: 36 }}>
                <Title level={1} style={{ color: '#fff', fontSize: 40, marginBottom: 8 }}>Node Rewards</Title>
                <Text style={{ color: '#999', fontSize: 16 }}>Own a Naka Node. Earn NAKAPT. Power Physical AI. <a style={{ color: '#f7931a' }}>Learn more <RightOutlined /></a></Text>
            </div>

            <Card
                style={{ background: '#0f0f0f', border: '1px solid #1f1f1f', marginBottom: 48 }}
                bodyStyle={{ padding: 32, display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24, alignItems: 'center' }}
            >
                <div>
                    <Title level={2} style={{ color: '#fff', margin: 0 }}>Your Naka Node awaits</Title>
                    <Text style={{ color: '#8c8c8c', display: 'block', margin: '12px 0 20px' }}>
                        Deposit your assets to mint a Naka Node for FREE — then stake NAKAPT on the node and enjoy up to 30% APY in rewards.
                    </Text>
                    <Button
                        type="primary"
                        size="large"
                        style={{ background: '#f7931a', borderColor: '#f7931a', color: '#000', minWidth: 140 }}
                        onClick={() => setDepositOpen(true)}
                    >
                        Mint Node
                    </Button>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        height: 180,
                        borderRadius: 16,
                        background: 'radial-gradient(120% 120% at 50% 50%, rgba(247,147,26,0.1), rgba(255,255,255,0.02))',
                        border: '1px solid #1f1f1f',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#f7931a',
                        fontSize: 48
                    }}>
                        ☆
                    </div>
                </div>
            </Card>

            <LowerInfo />
        </div>
    )

    if (!data.hasNode) {
        return noNodeView
    }

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ marginBottom: 40 }}>
                <Title level={1} style={{ color: '#fff', fontSize: 40, marginBottom: 8 }}>Node Rewards</Title>
                <Text style={{ color: '#999', fontSize: 16 }}>Own a Naka Node. Earn NAKAPT. Power Physical AI. <a style={{ color: '#f7931a' }}>Learn more <RightOutlined /></a></Text>
            </div>

            <Row gutter={32} style={{ marginBottom: 60 }}>
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
                        <div style={{
                            height: 160,
                            background: 'linear-gradient(180deg, #1f1f1f 0%, #141414 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <div style={{ color: '#333', fontSize: 60 }}><ThunderboltFilled /></div>
                        </div>

                        <div style={{ padding: 24, flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <div style={{ fontSize: 18, color: '#fff', fontWeight: 600 }}>NAKAPT Node <span style={{ color: '#f7931a' }}>{data?.node.apr} APR</span></div>
                                <Tag color="success" style={{ borderRadius: 12, padding: '0 10px' }}>● Running</Tag>
                            </div>
                            <div style={{ color: '#666', fontSize: 13, marginBottom: 24 }}>Compound staking with principal protection</div>

                            <div style={{ marginBottom: 24 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                                    <Text style={{ color: '#ccc' }}>Total NAKAPT on Node</Text>
                                    <Text style={{ color: '#f7931a', fontSize: 20, fontWeight: 'bold' }}>{data?.node.totalNakapt.toLocaleString()} ❖</Text>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                                    <Text style={{ color: '#666' }}>Staked NAKAPT</Text>
                                    <Text style={{ color: '#fff' }}>{data?.node.staked.toLocaleString()}</Text>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                                    <Text style={{ color: '#666' }}>Staking Rewards NAKAPT</Text>
                                    <Text style={{ color: '#52c41a' }}>+{data?.node.rewards}</Text>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                    <Text style={{ color: '#666' }}>Pending Stake NAKAPT</Text>
                                    <Text style={{ color: '#fff' }}>{data?.node.pendingStake}</Text>
                                </div>
                            </div>

                            <Row gutter={16} style={{ marginTop: 'auto' }}>
                                <Col span={12}>
                                    <Button
                                        size="large"
                                        block
                                        style={{ background: 'transparent', borderColor: '#333', color: '#fff' }}
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
                                        style={{ background: '#f7931a', borderColor: '#f7931a', color: '#000' }}
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
                        <div style={{
                            height: 160,
                            background: 'linear-gradient(180deg, #262626 0%, #141414 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <div style={{ color: '#333', fontSize: 60 }}><SafetyCertificateFilled /></div>
                        </div>

                        <div style={{ padding: 24, flex: 1 }}>
                            <div style={{ fontSize: 18, color: '#fff', fontWeight: 600, marginBottom: 8 }}>Deposit to your Naka Node to Earn More</div>
                            <div style={{ color: '#666', fontSize: 13, marginBottom: 24 }}>Boost Base Rewards—with bonuses, principal protection, and unlimited upside. <a style={{ color: '#f7931a' }}>Learn more</a></div>

                            <div style={{ marginBottom: 24 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                                    <Text style={{ color: '#ccc' }}>Redeemable Deposits</Text>
                                    <Text style={{ color: '#f7931a', fontSize: 20, fontWeight: 'bold' }}>{data?.assets.redeemable.toLocaleString()} USD</Text>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                                    <Text style={{ color: '#666' }}>Base Rewards</Text>
                                    <Text style={{ color: '#f7931a' }}>{data?.assets.baseRewards.toLocaleString()} ❖</Text>
                                </div>

                                <div style={{ marginBottom: 8 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                                        <Text style={{ color: '#666' }}>Current Bonus</Text>
                                        <div style={{ color: '#f7931a' }}>
                                            <b>{data?.assets.bonus}x</b> <span style={{ color: '#666', marginLeft: 8 }}>{data?.assets.nextBonus}x</span>
                                        </div>
                                    </div>
                                    <Progress
                                        percent={bonusProgress}
                                        showInfo={false}
                                        strokeColor="#f7931a"
                                        trailColor="#333"
                                        strokeWidth={6}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#444', marginTop: 6 }}>
                                        {bonusTicks.map((b) => <span key={b}>{b}</span>)}
                                    </div>
                                </div>

                                <div style={{ marginBottom: 8 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                                        <Text style={{ color: '#666' }}>Deposit Utilization</Text>
                                        <Text style={{ color: '#f7931a' }}>{utilizationPercent}%</Text>
                                    </div>
                                    <Progress
                                        percent={utilizationPercent}
                                        showInfo={false}
                                        strokeColor="#f7931a"
                                        trailColor="#333"
                                        strokeWidth={6}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#444', marginTop: 6 }}>
                                        {depositTicks.map((d) => <span key={d}>{d}</span>)}
                                    </div>
                                </div>
                            </div>

                            <Row gutter={16} style={{ marginTop: 'auto' }}>
                                <Col span={12}>
                                    <Button
                                        size="large"
                                        block
                                        style={{ background: 'transparent', borderColor: '#333', color: '#fff' }}
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
                                        style={{ background: '#f7931a', borderColor: '#f7931a', color: '#000' }}
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
            <StakeModal open={stakeOpen} onCancel={() => setStakeOpen(false)} availablePoints={1000} />
            <UnstakeModal open={unstakeOpen} onCancel={() => setUnstakeOpen(false)} stakedAmount={data?.node.staked} />
            <DepositModal open={depositOpen} onCancel={() => setDepositOpen(false)} />
            <RedeemModal open={redeemOpen} onCancel={() => setRedeemOpen(false)} assetData={{ redeemableUsd: data?.assets.redeemable }} />
        </div>
    )
}

export default NodeRewards
