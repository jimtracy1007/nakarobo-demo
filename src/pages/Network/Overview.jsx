import { useState, useEffect } from 'react'
import { Table, Button, Space, Typography, Avatar } from 'antd'
import { ArrowRightOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { nodeAPI, networkAPI } from '@/api'
import { formatLargeNumber } from '@/utils/format'

const { Title, Text } = Typography

export function NetworkOverview() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ totalNodes: 0, tvl: 0 })
    const [leaderboard, setLeaderboard] = useState([])

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch real stats from backend
                const data = await networkAPI.getStats()
                setStats({
                    totalNodes: data.nodes || 0,
                    tvl: data.tvl || 0
                })

                // Fetch real leaderboard
                const lbData = await networkAPI.getLeaderboard()
                const formattedLb = lbData.map(item => ({
                    ...item,
                    user: item.user ? `${item.user.slice(0, 6)}...${item.user.slice(-4)}` : '-'
                }))
                setLeaderboard(formattedLb)
            } catch (error) {
                console.error("Failed to fetch network stats:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [])

    const columns = [
        {
            title: 'Rank',
            dataIndex: 'rank',
            key: 'rank',
            render: (rank) => (
                <div style={{
                    width: 24, height: 24,
                    background: rank <= 3 ? 'linear-gradient(135deg, #f7931a 0%, #d46b08 100%)' : '#333',
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', // Hexagon shape
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 'bold', fontSize: 12
                }}>
                    {rank}
                </div>
            )
        },
        { title: 'User', dataIndex: 'user', key: 'user', render: t => <Text style={{ color: '#999' }}>{t}</Text> },
        { title: 'Node Name', dataIndex: 'name', key: 'name', render: t => <Text strong style={{ color: '#fff' }}>{t}</Text> },
        { title: 'Created Date', dataIndex: 'created', key: 'created', render: t => <Text style={{ color: '#666' }}>{t}</Text> },
        {
            title: 'Deposited(USD)',
            dataIndex: 'deposit',
            key: 'deposit',
            align: 'right',
            render: v => <Text style={{ color: '#f7931a' }}>${v.toLocaleString()}</Text>
        },
        {
            title: 'Multiplier',
            dataIndex: 'multiplier',
            key: 'multiplier',
            align: 'right',
            render: v => <Text style={{ color: '#f7931a' }}>{v}x</Text>
        },
        {
            title: 'Total Points',
            dataIndex: 'points',
            key: 'points',
            align: 'right',
            render: v => <Text strong style={{ color: '#52c41a' }}>{v.toLocaleString()}</Text>
        },
    ]

    return (
        <div style={{ position: 'relative', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            {/* Background Glow Effect */}
            <div style={{
                position: 'absolute',
                top: '10%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(247,147,26,0.15) 0%, rgba(0,0,0,0) 70%)',
                pointerEvents: 'none',
                zIndex: 0
            }} />

            {/* Header Section */}
            <div style={{ textAlign: 'center', marginTop: 40, marginBottom: 60, zIndex: 1 }}>
                <Title level={1} style={{
                    color: '#f7931a',
                    fontSize: 48,
                    marginBottom: 16,
                    letterSpacing: 2,
                    textTransform: 'uppercase'
                }}>
                    Nakarobo Network
                </Title>
                <Text style={{ color: '#666', fontSize: 16, maxWidth: 600, display: 'block', margin: '0 auto' }}>
                    NakaRobo is powered by Naka Nodes—community-owned robots that act as autonomous economic agents, co-owning, co-operating, and co-evolving with humans in a bottom-up network.
                </Text>
            </div>

            {/* Glassmorphism Stats Banner */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 16,
                padding: '30px 60px',
                width: '100%',
                maxWidth: 800,
                marginBottom: 80,
                zIndex: 1,
                position: 'relative'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 36, fontWeight: 'bold', color: '#fff' }}>{stats.totalNodes.toLocaleString()}</div>
                    <div style={{ color: '#666', textTransform: 'uppercase', letterSpacing: 1, fontSize: 12 }}>Total Nodes</div>
                </div>

                <div style={{ width: 1, height: 60, background: 'rgba(255,255,255,0.1)' }} />

                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 36, fontWeight: 'bold', color: '#f7931a' }}>${stats.tvl.toLocaleString()}</div>
                    <div style={{ color: '#666', textTransform: 'uppercase', letterSpacing: 1, fontSize: 12 }}>TVL</div>
                </div>

                <div style={{ width: 1, height: 60, background: 'rgba(255,255,255,0.1)' }} />

                <Button
                    type="primary"
                    shape="round"
                    size="large"
                    style={{
                        height: 50,
                        padding: '0 30px',
                        fontSize: 16,
                        background: 'linear-gradient(90deg, #f7931a 0%, #faad14 100%)',
                        border: 0
                    }}
                    onClick={() => navigate('/get-node')}
                >
                    Get My Node <ArrowRightOutlined />
                </Button>
            </div>

            {/* Leaderboard Section */}
            <div style={{ width: '100%', maxWidth: 1000, zIndex: 1 }}>
                <Title level={4} style={{ color: '#fff', marginBottom: 20 }}>Naka Node Leaderboard</Title>
                <Table
                    dataSource={leaderboard}
                    columns={columns}
                    rowKey="id"
                    pagination={false}
                    loading={loading}
                    style={{ background: 'transparent' }}
                    rowClassName="dark-row" // define in css if needed
                />
            </div>

        </div>
    )
}

export default NetworkOverview
