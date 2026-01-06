import { useState, useEffect } from 'react'
import { Card, Button, Row, Col, Statistic, List, Tag, Badge, message, Tooltip, Progress, Space } from 'antd'
import { CheckCircleOutlined, SyncOutlined, RightOutlined, CalendarOutlined, TrophyOutlined } from '@ant-design/icons'
import { questsAPI } from '../../api'

export function Quests() {
    const [loading, setLoading] = useState(true)
    const [summary, setSummary] = useState(null)
    const [campaigns, setCampaigns] = useState([])
    const [checkingIn, setCheckingIn] = useState(false)
    const [claiming, setClaiming] = useState(false)

    const fetchData = async () => {
        setLoading(true)
        try {
            const data = await questsAPI.getSummary()
            setSummary(data.summary)

            // Calculate progress for each campaign
            const processedCampaigns = (data.campaigns || []).map(c => {
                const totalTasks = c.tasks?.length || 0;
                const completedTasks = c.tasks?.filter(t => t.status === 'completed').length || 0;
                const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
                return { ...c, totalTasks, completedTasks, progress };
            });
            setCampaigns(processedCampaigns)
        } catch (error) {
            console.error(error)
            message.error('Failed to load quest data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleCheckin = async () => {
        setCheckingIn(true)
        try {
            const res = await questsAPI.checkIn()

            message.success(res.message || `Checked in successfully! +${res.pointsEarned} Points`)

            // Optimistically update local state
            setSummary(prev => ({
                ...prev,
                todayCheckedIn: true,
                streakDays: res.streak || (prev?.streakDays || 0) + 1
            }))
        } catch (error) {
            console.error(error)
            // Error is already processed by interceptor, but we catch string here
            message.error(typeof error === 'string' ? error : 'Check-in failed')
        } finally {
            setCheckingIn(false)
        }
    }

    const handleClaim = async () => {
        if (!summary?.pendingClaim) return
        setClaiming(true)
        try {
            const proofRes = await questsAPI.getClaimProof()
            // TODO: 调用合约 claimActivityRewards，传入 proofRes
            message.success(`Proof fetched. Pending on-chain claim. Reward: ${proofRes.amount || summary.pendingClaim}`)
            // 临时前端状态更新，等待链上回写后再刷新
            setSummary(prev => ({
                ...prev,
                pendingClaim: 0,
                claimed: (prev?.claimed || 0) + (prev?.pendingClaim || 0)
            }))
        } catch (error) {
            console.error(error)
            // 兼容可能被 interceptor 处理过的 error 或原生 response error
            const errMsg = typeof error === 'string' ? error : (error?.response?.data?.error || error?.message || 'Claim failed')
            message.error(errMsg)
        } finally {
            setClaiming(false)
        }
    }

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ marginBottom: 24 }}>
                <h1>Quests Center</h1>
                <p style={{ color: '#666' }}>Complete tasks to earn points and level up your node.</p>
            </div>

            {/* 1. Daily Check-in & Rewards */}
            <Row gutter={24} style={{ marginBottom: 24 }}>
                <Col span={16}>
                    <Card title={<Space><CalendarOutlined /> Daily Check-in</Space>}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: 16, marginBottom: 8 }}>
                                    Current Streak: <b style={{ color: '#f7931a', fontSize: 20 }}>{summary?.streakDays} Days</b> 🔥
                                </div>
                                <div style={{ color: '#666' }}>Check in daily to boost your earnings multiplier.</div>
                            </div>
                            <Button
                                type="primary"
                                size="large"
                                icon={summary?.todayCheckedIn ? <CheckCircleOutlined /> : <TrophyOutlined />}
                                onClick={handleCheckin}
                                loading={checkingIn}
                                disabled={summary?.todayCheckedIn}
                                style={summary?.todayCheckedIn ? { background: '#52c41a', borderColor: '#52c41a' } : {}}
                            >
                                {summary?.todayCheckedIn ? 'Checked In' : 'Check In (+10 pts)'}
                            </Button>
                        </div>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card style={{ height: '100%', background: '#f9f9f9' }}>
                        <Statistic
                            title="Pending Rewards"
                            value={summary?.pendingClaim}
                            suffix="NAKAPT"
                            valueStyle={{ color: '#faad14' }}
                        />
                        <Button
                            type="primary"
                            block
                            style={{ marginTop: 16 }}
                            disabled={!summary?.pendingClaim}
                            loading={claiming}
                            onClick={handleClaim}
                        >
                            Claim All
                        </Button>
                    </Card>
                </Col>
            </Row>

            {/* 2. Campaigns */}
            <h2 style={{ marginBottom: 16 }}>Active Campaigns</h2>

            <List
                grid={{ gutter: 24, column: 1 }}
                dataSource={campaigns}
                loading={loading}
                renderItem={item => (
                    <List.Item>
                        <Card
                            hoverable
                            style={{ opacity: item.status === 'locked' ? 0.7 : 1 }}
                        >
                            <div style={{ display: 'flex', gap: 24 }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <h3 style={{ margin: 0 }}>{item.title}</h3>
                                        {item.status === 'completed' && <Tag color="green">Completed</Tag>}
                                        {item.status === 'locked' && <Tag icon={<SyncOutlined spin />}>Coming Soon</Tag>}
                                    </div>
                                    <p style={{ color: '#666', margin: '8px 0' }}>{item.description}</p>

                                    <div style={{ marginTop: 16 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <span>Progress</span>
                                            <span>{item.completedTasks}/{item.totalTasks}</span>
                                        </div>
                                        <Progress percent={item.progress} status={item.progress === 100 ? 'success' : 'active'} />
                                    </div>
                                </div>

                                <div style={{ width: 200, borderLeft: '1px solid #f0f0f0', paddingLeft: 24, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <Statistic title="Total Reward" value={item.reward} suffix="PTS" valueStyle={{ fontSize: 18 }} />
                                    <Button type="default" style={{ marginTop: 12 }}>
                                        {item.status === 'locked' ? 'Locked' : 'View Tasks'} <RightOutlined />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </List.Item>
                )}
            />
        </div>
    )
}

export default Quests
