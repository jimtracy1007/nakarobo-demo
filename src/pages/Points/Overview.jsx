import { useState, useEffect } from 'react'
import { Card, Table, Button, Statistic, Row, Col, Avatar, Space } from 'antd'
import { pointsAPI } from '@/api'
import { formatLargeNumber, formatAddress } from '@/utils/format'
import { StakeModal } from '@/components/modals/StakeModal'

export function PointsOverview() {
    const [loading, setLoading] = useState(true)
    const [pointsData, setPointsData] = useState(null)
    const [leaderboard, setLeaderboard] = useState([])
    const [stakeModalOpen, setStakeModalOpen] = useState(false)

    const fetchData = async () => {
        setLoading(true)
        try {
            const [myRes, boardRes] = await Promise.all([
                pointsAPI.getMyPoints().catch(() => null),
                pointsAPI.getLeaderboard(1, 10).catch(() => ({ items: [] }))
            ])

            // Fallback object if API fails or user not logged in
            const defaultMyPoints = myRes || {
                totalPoints: 0,
                available: 0,
                staked: 0,
                rewards: 0
            }

            // Real Leaderboard
            const finalBoard = boardRes?.items || []

            setPointsData(defaultMyPoints)
            setLeaderboard(finalBoard)
        } catch (error) {
            console.error('Fetch points failed', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const columns = [
        {
            title: 'Rank',
            dataIndex: 'rank',
            key: 'rank',
            width: 80,
            render: (rank) => {
                const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null
                const bg = rank === 1 ? '#24120c' : rank === 2 ? '#1b1c23' : rank === 3 ? '#1d1a1a' : 'transparent'
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: bg, padding: '6px 8px', borderRadius: 6 }}>
                        {medal && <span style={{ fontSize: 18 }}>{medal}</span>}
                        <span style={{ fontWeight: 600, color: '#f5f5f5' }}>#{rank}</span>
                    </div>
                )
            }
        },
        {
            title: 'User',
            dataIndex: 'user',
            key: 'user',
            render: (user) => (
                <span style={{ color: '#f5f5f5' }}>{user?.address ? formatAddress(user.address) : user?.name}</span>
            )
        },
        {
            title: 'Week Points',
            dataIndex: 'weekPoints',
            key: 'weekPoints',
            align: 'right',
            render: val => {
                const num = Number(val) || 0
                const color = num >= 0 ? '#52c41a' : '#ff4d4f'
                const sign = num > 0 ? '+' : ''
                return <span style={{ color }}>{sign}{num.toLocaleString()}</span>
            }
        },
        {
            title: 'Total Points',
            dataIndex: 'totalPoints',
            key: 'totalPoints',
            align: 'right',
            render: val => <b style={{ color: '#f5f5f5' }}>{formatLargeNumber(val)}</b>
        }
    ]

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', color: '#f5f5f5' }}>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ color: '#fff', marginBottom: 6 }}>NAKAPT Overview</h1>
                <p style={{ color: '#8c8c8c', margin: 0 }}>
                    A NAKAPT gives you zero downside risk on your deposited capital and unlimited upside in the protocol’s growth.
                    <a style={{ color: '#f7931a', marginLeft: 8 }}>Learn more &gt;</a>
                </p>
            </div>

            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ margin: 0, color: '#f5f5f5', fontSize: 20 }}>My NAKAPT</h2>
            </div>

            <Row gutter={24} style={{ marginBottom: 32 }}>
                <Col span={8}>
                    <Card
                        bordered={false}
                        style={{
                            height: '100%',
                            background: 'linear-gradient(135deg, #1a6bff 0%, #1256d6 100%)',
                            borderRadius: 12,
                            boxShadow: '0 8px 24px rgba(26,107,255,0.25)'
                        }}
                        bodyStyle={{ padding: 20 }}
                    >
                        <Statistic
                            title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>Total NAKAPT</span>}
                            value={pointsData?.totalPoints}
                            valueStyle={{ color: '#f77c11', fontSize: 32 }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                            <div style={{ background: '#1f1f1f', borderRadius: 6, padding: '4px 8px', color: '#8c8c8c', fontSize: 12 }}>
                                Rank&nbsp;188
                            </div>
                            <div style={{ background: '#06200f', borderRadius: 6, padding: '4px 8px', color: '#52c41a', fontSize: 12 }}>
                                Daily NAKAPT +145.2
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card
                        bordered={false}
                        style={{ height: '100%', background: '#101010', border: '1px solid #1f1f1f', borderRadius: 12 }}
                        bodyStyle={{ padding: 20 }}
                    >
                        <Statistic
                            title={<span style={{ color: '#8c8c8c' }}>NAKAPT on Node</span>}
                            value={pointsData?.staked}
                            valueStyle={{ color: '#f77c11', fontSize: 32 }}
                            prefix={<span style={{ color: '#52c41a', fontSize: 18, marginRight: 6 }}>●</span>}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card
                        bordered={false}
                        style={{ height: '100%', background: '#101010', border: '1px solid #1f1f1f', borderRadius: 12 }}
                        bodyStyle={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}
                    >
                        <Statistic
                            title={<span style={{ color: '#8c8c8c' }}>Available NAKAPT</span>}
                            value={pointsData?.available}
                            valueStyle={{ color: '#f5f5f5', fontSize: 32 }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                            <div style={{ background: '#1f1f1f', borderRadius: 6, padding: '4px 10px', color: '#f7931a', fontSize: 12 }}>
                                🔸 NAKAPT
                            </div>
                            <Space size="middle">
                                <Button
                                    size="large"
                                    style={{ background: 'transparent', borderColor: '#2a2a2a', color: '#f5f5f5', minWidth: 110 }}
                                >
                                    Withdraw
                                </Button>
                                <Button
                                    type="primary"
                                    size="large"
                                    style={{ background: '#f7931a', borderColor: '#f7931a', color: '#000', minWidth: 110 }}
                                    onClick={() => setStakeModalOpen(true)}
                                >
                                    Stake
                                </Button>
                            </Space>
                        </div>
                    </Card>
                </Col>
            </Row>

            <Card
                title={<span style={{ color: '#f5f5f5' }}>Naka Node Leaderboard</span>}
                bodyStyle={{ padding: 0 }}
                style={{ background: '#0f0f0f', border: '1px solid #1f1f1f', borderRadius: 12 }}
                headStyle={{ background: '#0f0f0f', borderBottom: '1px solid #1f1f1f', color: '#f5f5f5' }}
            >
                <Table
                    dataSource={leaderboard}
                    columns={columns}
                    rowKey="rank"
                    pagination={false}
                    loading={loading}
                    style={{ background: '#0f0f0f', color: '#f5f5f5' }}
                    onRow={(record) => ({
                        style: {
                            background: record.rank === 1 ? '#2a120d'
                                : record.rank === 2 ? '#16171d'
                                    : record.rank === 3 ? '#1c1616'
                                        : '#0f0f0f',
                            color: '#f5f5f5'
                        }
                    })}
                    bordered={false}
                />
                <div style={{ padding: 16, textAlign: 'center' }}>
                    <Button style={{ background: '#1f1f1f', borderColor: '#2a2a2a', color: '#f5f5f5' }}>View Full Leaderboard</Button>
                </div>
            </Card>

            <StakeModal
                open={stakeModalOpen}
                onCancel={() => setStakeModalOpen(false)}
                onSuccess={fetchData}
                availablePoints={pointsData?.available}
            />
        </div>
    )
}

export default PointsOverview
