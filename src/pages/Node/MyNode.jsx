import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, Button, Avatar, Progress, Space, Divider, Row, Col, Spin, Empty, Tag } from 'antd'
import { useAccount } from 'wagmi'
import { nodeAPI } from '@/api'
import { formatLargeNumber } from '@/utils/format'
import { formatDate } from '@/utils/datetime'
import { useNavigate } from 'react-router-dom'
import { FundsRecordModal } from '@/components/modals/FundsRecordModal'
import { DepositModal } from '@/components/modals/DepositModal'
import { RedeemModal } from '@/components/modals/RedeemModal'

export function MyNode() {
    const navigate = useNavigate()
    const { isConnected } = useAccount()
    const [loading, setLoading] = useState(true)
    const [nodeInfo, setNodeInfo] = useState(null)
    const [assets, setAssets] = useState(null)
    const [recordModalOpen, setRecordModalOpen] = useState(false)
    const [depositModalOpen, setDepositModalOpen] = useState(false)
    const [redeemModalOpen, setRedeemModalOpen] = useState(false)
    const mounted = useRef(false)

    useEffect(() => {
        mounted.current = true
        return () => { mounted.current = false }
    }, [])

    const fetchData = useCallback(async () => {
        if (!isConnected) return

        console.log('Fetching MyNode data...')
        setLoading(true)
        try {
            const [nodeRes, assetRes] = await Promise.all([
                nodeAPI.getMyNode(),
                nodeAPI.getAssetSummary().catch(err => {
                    console.warn('Failed to fetch asset summary:', err)
                    return null
                })
            ])

            if (mounted.current) {
                setNodeInfo(nodeRes)
                setAssets(assetRes)
            }
        } catch (error) {
            console.error('Failed to fetch node data:', error)
            if (mounted.current) {
                setNodeInfo(null)
            }
        } finally {
            if (mounted.current) {
                setLoading(false)
            }
        }
    }, [isConnected])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    // 未连接钱包
    if (!isConnected) {
        return (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <h2>Naka Node</h2>
                <p style={{ color: '#666', marginBottom: 24 }}>Please connect your wallet to view your node</p>
            </div>
        )
    }

    // 加载中
    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
                <Spin size="large" />
            </div>
        )
    }

    // 无节点状态 -> 设计稿中的两张营销卡（Mint Node CTA）
    if (!nodeInfo || !nodeInfo.nodeId) {
        return (
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 0 60px' }}>
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ color: '#fff', marginBottom: 8 }}>My Node</h1>
                    <p style={{ color: '#8c8c8c' }}>Naka Node will soon run on real AI devices—turning every node into a revenue-generating physical AI asset.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
                    <Card
                        style={{ background: '#0f0f0f', border: '1px solid #1f1f1f' }}
                        bodyStyle={{ padding: 32, display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 24, alignItems: 'center' }}
                    >
                        <div>
                            <div style={{ color: '#f5f5f5', fontSize: 28, fontWeight: 600, lineHeight: 1.3, marginBottom: 16 }}>
                                NakaRobo Bootstrapping Campaign is Now Live!
                            </div>
                            <div style={{ color: '#8c8c8c', marginBottom: 24, maxWidth: 520 }}>
                                A principal-protected crowdfunding model purpose-built for the robotics industry.
                            </div>
                            <Button
                                type="primary"
                                size="large"
                                style={{ background: '#f7931a', borderColor: '#f7931a', color: '#000', minWidth: 140 }}
                                onClick={() => navigate('/get-node')}
                            >
                                Mint Node
                            </Button>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '100%',
                                height: 200,
                                borderRadius: 16,
                                background: 'radial-gradient(120% 120% at 50% 50%, rgba(247,147,26,0.12), rgba(255,255,255,0.02))',
                                border: '1px solid #1f1f1f',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#f7931a',
                                fontSize: 48,
                                letterSpacing: 1
                            }}>
                                ☆
                            </div>
                        </div>
                    </Card>

                    <Card
                        style={{ background: '#0f0f0f', border: '1px solid #1f1f1f' }}
                        bodyStyle={{ padding: 32, display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 24, alignItems: 'center' }}
                    >
                        <div>
                            <div style={{ color: '#f5f5f5', fontSize: 26, fontWeight: 600, lineHeight: 1.3, marginBottom: 16 }}>
                                Your Naka Node awaits—deposit assets today
                            </div>
                            <div style={{ color: '#8c8c8c', marginBottom: 24, maxWidth: 520 }}>
                                Earn protected yield, and own the network tomorrow.
                            </div>
                            <Button
                                type="primary"
                                size="large"
                                style={{ background: '#f7931a', borderColor: '#f7931a', color: '#000', minWidth: 140 }}
                                onClick={() => navigate('/get-node')}
                            >
                                Mint Node
                            </Button>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '100%',
                                height: 200,
                                borderRadius: 16,
                                background: 'radial-gradient(120% 120% at 50% 50%, rgba(247,147,26,0.08), rgba(255,255,255,0.01))',
                                border: '1px solid #1f1f1f',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#f7931a',
                                fontSize: 48,
                                letterSpacing: 4
                            }}>
                                • • •
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        )
    }

    // Bonus & deposit刻度模拟
    const bonusPercent = Number(assets?.currentBonus) || 100
    const bonusMultiplier = (bonusPercent / 100)
    const bonusProgress = Math.min(100, ((bonusMultiplier - 1) / 0.5) * 100)
    const depositTicks = ['10', '100', '1,000', '2,000', '5,000', '100,000+']
    const bonusTicks = ['1.0x', '1.1x', '1.2x', '1.3x', '1.4x', '1.5x']

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ color: '#fff' }}>My Node</h1>
                <p style={{ color: '#8c8c8c', maxWidth: 800 }}>
                    A Naka Node is a digital twin of a community-owned robot that acts as an autonomous economic agent—
                    earning value through real-world tasks and shared intelligence, and rewarding its owner.
                    <a href="#" style={{ marginLeft: 8, color: '#f7931a' }}>Learn More &gt;</a>
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 24 }}>

                {/* 左侧：节点信息卡片 */}
                <Card
                    bodyStyle={{ padding: 32, textAlign: 'center' }}
                    style={{ background: '#0f0f0f', border: '1px solid #1f1f1f' }}
                >
                    <div style={{
                        width: 220,
                        height: 220,
                        background: 'radial-gradient(120% 120% at 50% 50%, rgba(247,147,26,0.15), rgba(255,255,255,0.02))',
                        borderRadius: '50%',
                        margin: '0 auto 24px',
                        overflow: 'hidden',
                        border: '1px solid #1f1f1f',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <img
                            src={nodeInfo.avatarUrl || 'https://api.nakarobo.ai/avatars/default.png'}
                            alt="Node Avatar"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>

                    <h2 style={{ fontSize: 24, marginBottom: 8, color: '#fff' }}>{nodeInfo.name}</h2>

                    <div style={{ marginBottom: 12 }}>
                        <Tag color="#1f1f1f" style={{ borderRadius: 16, padding: '2px 12px', color: '#f5f5f5', border: '1px solid #2a2a2a' }}>
                            #{nodeInfo.nodeId}
                        </Tag>
                    </div>

                    <div style={{ fontSize: 13, color: '#8c8c8c', marginBottom: 28 }}>
                        <span style={{ fontSize: 15 }}>{formatDate(nodeInfo.createdAt)} created</span>
                        <Button type="link" onClick={() => setRecordModalOpen(true)} style={{ marginLeft: 8, padding: 0 }}>
                            Settings
                        </Button>
                    </div>

                    <Space size="middle" style={{ width: '100%', justifyContent: 'center' }}>
                        <Button style={{ width: 110 }} ghost onClick={() => navigate('/get-node')}>Setup</Button>
                        <Button style={{ width: 110 }} ghost onClick={() => navigate('/get-node')}>Upgrade</Button>
                        <Button style={{ width: 110 }} onClick={() => setRecordModalOpen(true)}>History</Button>
                    </Space>
                </Card>

                {/* 右侧：资产管理 + Physical Robot */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                    {/* 资产管理卡片 */}
                    <Card
                        bodyStyle={{ padding: 32 }}
                        style={{ background: '#0f0f0f', border: '1px solid #1f1f1f' }}
                    >
                        <p style={{ marginBottom: 24, color: '#f5f5f5', fontSize: 16, fontWeight: 500 }}>
                            Deposit more, earn more — with full redemption rights and
                            unlimited upside as the ecosystem grows.
                        </p>

                        <Row gutter={48}>
                            <Col span={12}>
                                <div style={{ fontSize: 14, color: '#8c8c8c', marginBottom: 8 }}>Minted Base Rewards</div>
                                <div style={{ fontSize: 32, fontWeight: 600, color: '#fff' }}>
                                    {formatLargeNumber(assets?.mintedRewards || 0)} <span style={{ fontSize: 16, fontWeight: 400, color: '#bfbfbf' }}>NAKAPT</span>
                                </div>
                                <Tag color="success" style={{ borderRadius: 6, marginTop: 10, padding: '2px 8px' }}>
                                    Current Bonus {(bonusMultiplier).toFixed(2)}x
                                </Tag>
                            </Col>

                            <Col span={12}>
                                <div style={{ fontSize: 14, color: '#8c8c8c', marginBottom: 8 }}>Redeemable (USD)</div>
                                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                                    <div style={{ fontSize: 32, fontWeight: 600, color: '#fff' }}>
                                        {formatLargeNumber(assets?.redeemableUsd || 0)}
                                    </div>
                                    <Button
                                        type="text"
                                        icon={<span style={{ fontSize: 18 }}>📄</span>}
                                        onClick={() => setRecordModalOpen(true)}
                                    />
                                </div>

                                <Space style={{ marginTop: 16, width: '100%', justifyContent: 'flex-end' }}>
                                    <Button size="large" onClick={() => setRedeemModalOpen(true)}>Redeem</Button>
                                    <Button
                                        type="primary"
                                        size="large"
                                        style={{ background: '#f7931a', borderColor: '#f7931a' }}
                                        onClick={() => setDepositModalOpen(true)}
                                    >
                                        Deposit
                                    </Button>
                                </Space>
                            </Col>
                        </Row>

                        <Divider style={{ margin: '32px 0', borderColor: '#1f1f1f' }} />

                        {/* Bonus 进度条区域，按设计刻度 */}
                        <div style={{ background: '#141414', padding: 16, borderRadius: 10, border: '1px solid #1f1f1f' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 12, color: '#8c8c8c' }}>
                                <span>(Base Rewards = Deposit x Bonus)</span>
                                <span style={{ color: '#f7931a' }}>Current {(bonusMultiplier).toFixed(2)}x</span>
                            </div>

                            <div style={{ position: 'relative', paddingTop: 12, paddingBottom: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666', marginBottom: 6 }}>
                                    {bonusTicks.map((b) => <span key={b}>{b}</span>)}
                                </div>
                                <Progress percent={bonusProgress} showInfo={false} strokeColor="#f7931a" trailColor="#1f1f1f" />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666', marginTop: 6 }}>
                                    {depositTicks.map((d) => <span key={d}>{d}</span>)}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Physical Robot 卡片 */}
                    <Card
                        bodyStyle={{ padding: 24 }}
                        style={{ background: '#0f0f0f', border: '1px solid #1f1f1f' }}
                    >
                        <h3 style={{ fontSize: 16, marginBottom: 16, color: '#fff' }}>My Physical Robot</h3>
                        <div style={{
                            background: '#141414',
                            borderRadius: 10,
                            padding: 16,
                            border: '1px solid #1f1f1f',
                            minHeight: 200
                        }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr repeat(4, 1fr)', color: '#666', fontSize: 12, marginBottom: 12 }}>
                                <span>Robot</span>
                                <span>Status</span>
                                <span>Contribution</span>
                                <span>Rewards</span>
                                <span>Uptime</span>
                            </div>
                            {/* TODO: Fetch Physical Robots from Backend */}
                            {/* {[1, 2, 3, 4].map((row) => (
                                <div
                                    key={row}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1.2fr repeat(4, 1fr)',
                                        color: '#8c8c8c',
                                        fontSize: 12,
                                        padding: '10px 0',
                                        borderTop: row === 1 ? '1px solid #1f1f1f' : '1px solid #1f1f1f',
                                        opacity: 0.6
                                    }}
                                >
                                    <span>Robot #{row.toString().padStart(3, '0')}</span>
                                    <span>—</span>
                                    <span>—</span>
                                    <span>—</span>
                                    <span>—</span>
                                </div>
                            ))} */}
                            <div style={{ textAlign: 'center', padding: '24px 0', color: '#f7931a', fontWeight: 600 }}>
                                coming soon...
                            </div>
                        </div>
                    </Card>

                </div>
            </div>

            <FundsRecordModal open={recordModalOpen} onCancel={() => setRecordModalOpen(false)} />
            <DepositModal open={depositModalOpen} onCancel={() => setDepositModalOpen(false)} />
            <RedeemModal open={redeemModalOpen} onCancel={() => setRedeemModalOpen(false)} assetData={{ redeemableUsd: assets?.redeemableUsd }} />
        </div>
    )
}

export default MyNode
