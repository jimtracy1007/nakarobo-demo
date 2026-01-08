import { useState, useEffect } from 'react'
import { Card, Table, Button, Statistic, Row, Col, Avatar, Space } from 'antd'
import { pointsAPI } from '@/api'
import { formatLargeNumber, formatAddress } from '@/utils/format'
import { StakeModal } from '@/components/modals/StakeModal'
import { ShareAltOutlined, InfoCircleOutlined, SwapOutlined } from '@ant-design/icons'

// Mask address util
const maskAddress = (addr) => {
    if (!addr) return '-';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

export function PointsOverview() {
    const [loading, setLoading] = useState(true)
    const [pointsData, setPointsData] = useState(null)
    const [leaderboard, setLeaderboard] = useState([])
    const [stakeModalOpen, setStakeModalOpen] = useState(false)
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;

    const fetchData = async () => {
        setLoading(true)
        try {
            const [myRes, boardRes] = await Promise.all([
                pointsAPI.getMyPoints().catch(() => null),
                pointsAPI.getLeaderboard(page, PAGE_SIZE).catch(() => ({ items: [] }))
            ])

            // Fallback object
            const defaultMyPoints = myRes || {
                totalPoints: 0,
                dailyPoints: 0,
                rank: '-',
                available: 0,
                staked: 0,
                rewards: 0
            }

            // Real Leaderboard
            const finalBoard = boardRes instanceof Array ? boardRes : (boardRes?.items || []);

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
    }, [page])

    const columns = [
        {
            title: 'Rank',
            dataIndex: 'rank',
            key: 'rank',
            width: 80,
            render: (rank) => {
                let icon = null;
                if (rank === 1) icon = '🥇';
                if (rank === 2) icon = '🥈';
                if (rank === 3) icon = '🥉';
                return icon ? <span style={{ fontSize: 20 }}>{icon}</span> : <span style={{ color: '#888' }}>{rank}</span>;
            }
        },
        {
            title: 'User',
            dataIndex: 'user',
            key: 'user',
            render: (user) => {
                const addr = user?.address || user?.name || user; // Handle various response shapes
                return <span style={{ color: '#f5f5f5' }}>{maskAddress(addr)}</span>
            }
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
        <div style={{ maxWidth: 1200, margin: '0 auto', color: '#f5f5f5', paddingBottom: 60 }}>
            {/* Header */}
            <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ color: '#fff', marginBottom: 8, fontSize: 32 }}>NAKAPT Overview</h1>
                    <p style={{ color: '#8c8c8c', margin: 0, fontSize: 16 }}>
                        A NAKAPT gives you zero downside risk on your deposited capital and unlimited upside in the protocol’s growth.
                        <a style={{ color: '#f7931a', marginLeft: 8 }}>Learn more &gt;</a>
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    {/* Optional top-right actions */}
                    <Button icon={<ShareAltOutlined />} style={{ background: '#1f1f1f', border: '1px solid #303030', color: '#fff' }} />
                    <Button icon={<InfoCircleOutlined />} style={{ background: '#1f1f1f', border: '1px solid #303030', color: '#fff' }} />
                </div>
            </div>

            <div style={{ marginBottom: 16 }}>
                <h2 style={{ margin: 0, color: '#f5f5f5', fontSize: 20 }}>My NAKAPT</h2>
            </div>

            {/* Stats Cards */}
            <Row gutter={24} style={{ marginBottom: 40 }}>
                {/* 1. Total NAKAPT */}
                <Col span={8}>
                    <Card
                        bordered={false}
                        style={{
                            height: '100%',
                            background: '#0a0a0a', /* Slightly lighter black or gradient? UI shows dark */
                            border: '1px solid #1f1f1f',
                            borderRadius: 16,
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        bodyStyle={{ padding: 24, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}
                    >
                        {/* Subtle background glow/gradient if needed */}
                        <div style={{ color: '#888', fontSize: 14 }}>Total NAKAPT</div>

                        <div style={{ fontSize: 40, fontWeight: 'bold', color: '#f77c11', margin: '12px 0' }}>
                            {pointsData?.totalPoints ? formatLargeNumber(pointsData.totalPoints) : '0'}
                        </div>

                        <div style={{ display: 'flex', gap: 8 }}>
                            <div style={{
                                background: '#1f1f1f',
                                border: '1px solid #333',
                                borderRadius: 4,
                                padding: '2px 8px',
                                color: '#ccc',
                                fontSize: 12
                            }}>
                                Rank {pointsData?.rank}
                            </div>
                            <div style={{
                                background: '#0a2e14',
                                border: '1px solid #135225',
                                borderRadius: 4,
                                padding: '2px 8px',
                                color: '#52c41a',
                                fontSize: 12
                            }}>
                                Daily NAKAPT +{pointsData?.dailyPoints || 0} ↗
                            </div>
                        </div>
                    </Card>
                </Col>

                {/* 2. NAKAPT on Node */}
                <Col span={8}>
                    <Card
                        bordered={false}
                        style={{
                            height: '100%',
                            background: '#0a0a0a',
                            border: '1px solid #1f1f1f',
                            borderRadius: 16
                        }}
                        bodyStyle={{ padding: 24, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}
                    >
                        <div style={{ color: '#888', fontSize: 14 }}>NAKAPT on Node</div>
                        <div style={{ fontSize: 40, fontWeight: 'bold', color: '#d35400', margin: '12px 0' }}>{formatLargeNumber(pointsData?.staked || 0)}</div>
                        <div style={{ height: 24 }}>{/* Spacer to align with first card */}</div>
                    </Card>
                </Col>

                {/* 3. Available NAKAPT */}
                <Col span={8}>
                    <Card
                        bordered={false}
                        style={{
                            height: '100%',
                            background: '#0a0a0a',
                            border: '1px solid #1f1f1f',
                            borderRadius: 16
                        }}
                        bodyStyle={{ padding: 24, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ color: '#888', fontSize: 14 }}>Available NAKAPT</div>
                                <div style={{ fontSize: 40, fontWeight: 'bold', color: '#fff', margin: '12px 0' }}>
                                    {formatLargeNumber(pointsData?.available || 0)}
                                </div>
                                <div style={{
                                    background: '#1f1f1f',
                                    borderRadius: 4,
                                    padding: '2px 8px',
                                    color: '#f7931a',
                                    fontSize: 12,
                                    width: 'fit-content'
                                }}>
                                    📒 NAKAPT
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <Button
                                    ghost
                                    style={{ borderColor: '#333', color: '#888', width: 100 }}
                                >
                                    Withdraw
                                </Button>
                                <Button
                                    type="primary"
                                    style={{ background: '#f75411', borderColor: '#f75411', color: '#000', width: 100, fontWeight: 'bold' }}
                                    onClick={() => setStakeModalOpen(true)}
                                >
                                    Stake
                                </Button>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Leaderboard */}
            <div style={{ marginBottom: 16 }}>
                <h2 style={{ margin: 0, color: '#f5f5f5', fontSize: 20 }}>Naka Node Leaderboard</h2>
            </div>

            <div style={{
                border: '1px solid #1f1f1f',
                borderRadius: 12,
                overflow: 'hidden',
                background: '#0a0a0a'
            }}>
                <Table
                    dataSource={leaderboard}
                    columns={columns}
                    rowKey="rank"
                    pagination={false}
                    loading={loading}
                    style={{ background: 'transparent' }}
                    rowClassName="dark-row"
                />

                {/* Sticky My Rank Footer */}
                {/* Only user if user is logged in and not in top view, or just always show summary */}
                <div style={{
                    borderTop: '1px solid #1f1f1f',
                    background: '#141414',
                    padding: '12px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ width: 80, color: '#888' }}>{pointsData?.rank || '-'}</div>
                    <div style={{ flex: 1, color: '#fff' }}>My Rank</div>
                    <div style={{ width: 150, textAlign: 'right', color: '#52c41a' }}>+{pointsData?.dailyPoints || 0}</div>
                    <div style={{ width: 150, textAlign: 'right', fontWeight: 'bold' }}>{formatLargeNumber(pointsData?.totalPoints || 0)}</div>
                </div>

                {/* Pagination Controls (Simple) */}
                <div style={{
                    borderTop: '1px solid #1f1f1f',
                    background: '#0a0a0a',
                    padding: '8px 16px',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 8
                }}>
                    <Button
                        size="small"
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        style={{ background: '#1f1f1f', border: 'none', color: '#888' }}
                    >
                        &lt;
                    </Button>
                    <span style={{ color: '#888', lineHeight: '24px' }}>{page}</span>
                    <Button
                        size="small"
                        // disabled assumption
                        onClick={() => setPage(p => p + 1)}
                        style={{ background: '#1f1f1f', border: 'none', color: '#888' }}
                    >
                        &gt;
                    </Button>
                </div>
            </div>

            <StyleOverrides />

            <StakeModal
                open={stakeModalOpen}
                onCancel={() => setStakeModalOpen(false)}
                onSuccess={fetchData}
                availablePoints={pointsData?.available}
            />
        </div>
    )
}

const StyleOverrides = () => (
    <style>{`
        .ant-table { background: transparent !important; }
        .ant-table-thead > tr > th { 
            background: #0a0a0a !important; 
            color: #666 !important; 
            border-bottom: 1px solid #1f1f1f !important;
            font-weight: normal;
        }
        .ant-table-tbody > tr > td { 
            border-bottom: 1px solid #1f1f1f !important; 
            padding: 16px 16px !important;
        }
        .ant-table-tbody > tr:hover > td { 
            background: #141414 !important; 
        }
        /* Top 3 Highlighting */
        .ant-table-tbody > tr:nth-child(1) { background: rgba(81, 30, 6, 0.2); }
        .ant-table-tbody > tr:nth-child(2) { background: rgba(255, 255, 255, 0.05); }
        .ant-table-tbody > tr:nth-child(3) { background: rgba(255, 255, 255, 0.02); }
    `}</style>
)

export default PointsOverview
