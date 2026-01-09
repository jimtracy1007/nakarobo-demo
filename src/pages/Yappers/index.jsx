import { useState, useEffect } from 'react'
import { Card, Button, Row, Col, Statistic, Table, Avatar, Badge, Space, App, Input, Progress, Typography, Tag, Tooltip } from 'antd'
import { TwitterOutlined, CopyOutlined, SearchOutlined, UserOutlined, ArrowRightOutlined, RiseOutlined, FallOutlined, DisconnectOutlined } from '@ant-design/icons'
import { yappersAPI, referralAPI, pointsAPI } from '@/api' // Added pointsAPI for Staking Stats
import { formatLargeNumber } from '@/utils/format'
import { PostModal } from '@/components/modals/PostModal'
import { StakeModal } from '@/components/modals/StakeModal'
import ReferralModal from '@/components/ReferralModal';
import { MaskAddress } from '@/components/MaskAddress';

const { Title, Text } = Typography

export function Yappers() {
    const { message } = App.useApp()
    const [loading, setLoading] = useState(true)
    const [info, setInfo] = useState(null)
    const [leaderboard, setLeaderboard] = useState([])
    const [postModalOpen, setPostModalOpen] = useState(false)
    const [stakeModalOpen, setStakeModalOpen] = useState(false)
    const [referralModalOpen, setReferralModalOpen] = useState(false)

    // Header Stats
    const [pointsStats, setPointsStats] = useState({ total: 0, staked: 0, available: 0 })

    const [isConnected, setIsConnected] = useState(false)
    const [statusLoading, setStatusLoading] = useState(true)
    const pendingClaim = info?.stats?.pendingClaim ?? 0
    const claimed = info?.stats?.claimed ?? 0
    const pendingStake = info?.stats?.pendingStake ?? 0

    // Columns matching the screenshot
    const columns = [
        {
            title: 'Rank',
            dataIndex: 'rank',
            key: 'rank',
            width: 80,
            render: (r) => {
                let color = '#666';
                if (r === 1) color = '#f7931a'; // Gold
                if (r === 2) color = '#d9d9d9'; // Silver
                if (r === 3) color = '#cd7f32'; // Bronze
                return (
                    <div style={{
                        width: 32, height: 32,
                        // background: r <= 3 ? `rgba(255,255,255,0.1)` : 'transparent',
                        border: r <= 3 ? `1px solid ${color}` : 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: color, fontWeight: 'bold',
                        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', // Hexagon ish
                        background: r <= 3 ? `linear-gradient(180deg, ${color}22 0%, transparent 100%)` : 'transparent'
                    }}>
                        {r}
                    </div>
                )
            }
        },
        {
            title: 'User', key: 'user', render: (_, record) => {
                const u = record.user || record
                return (
                    <Space size={12}>
                        <Avatar src={u?.avatarUrl || u?.profileImageUrl} icon={<UserOutlined />} size={40} />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: '#fff', fontWeight: 500, fontSize: 15 }}>{u?.name || 'Unknown'}</span>
                            <span style={{ color: '#666', fontSize: 12 }}>@{u?.handle || u?.twitterHandle || u?.username || 'user'}</span>
                        </div>
                    </Space>
                )
            }
        },
        {
            title: 'Index',
            dataIndex: 'index',
            key: 'index',
            align: 'center',
            render: (v) => {
                // Mock Index for now -> Randomly generated or derived logic
                const val = v || Math.floor(Math.random() * 20) + 80;
                const isUp = val > 85;
                return (
                    <div style={{ color: isUp ? '#52c41a' : '#ff4d4f', fontWeight: 'bold' }}>
                        {val} {isUp ? <RiseOutlined /> : <FallOutlined />}
                    </div>
                )
            }
        },
        {
            title: 'Mindshare',
            key: 'mindshare',
            width: 150,
            render: (_, r) => {
                // Mindshare = Daily / Total
                const daily = r.dailyScore || 0;
                const total = r.totalScore || r.score || 1;
                const percent = total > 0 ? (daily / total) * 100 : 0;
                return (
                    <div>
                        <div style={{ color: '#fff', marginBottom: 4 }}>{percent.toFixed(0)}%</div>
                        <Progress percent={Math.min(percent, 100)} showInfo={false} strokeColor="#fff" trailColor="#333" size="small" strokeWidth={4} />
                    </div>
                )
            }
        },
        {
            title: 'Daily Reward',
            key: 'dailyScore',
            align: 'right',
            render: (_, r) => (
                <div style={{ color: '#52c41a' }}>{formatLargeNumber(r.dailyScore || 0)}</div>
            )
        },
        {
            title: 'Total Reward',
            key: 'totalScore',
            align: 'right',
            render: (_, r) => (
                <div style={{ color: '#fff', fontWeight: 'bold' }}>{formatLargeNumber(r.totalScore ?? r.score ?? 0)}</div>
            )
        },
    ]

    const fetchData = async () => {
        if (!isConnected) return
        setLoading(true)
        try {
            // Parallel Fetch
            const [scores, lbData, refData, status, myPoints] = await Promise.all([
                yappersAPI.getScores(),
                yappersAPI.getLeaderboard(),
                referralAPI.getMyReferral(),
                yappersAPI.getStatus(),
                pointsAPI.getMyPoints() // For Header Stats
            ])

            const lbList = Array.isArray(lbData) ? lbData : (lbData?.list || lbData?.items || lbData?.data || []);

            setInfo({
                twitter: {
                    username: status.twitterName,
                    handle: '@' + status.twitterHandle,
                    avatarUrl: status.avatarUrl
                },
                stats: {
                    totalScore: scores.totalScore,
                    rank: lbData.myRank?.rank || '-',
                    rankChange: '+18', // Mock
                    dailyScore: scores.yesterdayScore || 0,
                },
                referral: {
                    referralCode: refData?.referralCode || 'GenerateOne',
                    totalInvited: refData?.totalInvited || 0,
                    dailyChange: refData?.dailyChange || 0,
                    link: `${window.location.origin}/${refData?.referralCode || ''}`
                },
                season: 1
            })

            setPointsStats({
                total: myPoints?.totalPoints || 0, // Should use the Settled NAKAPT from somewhere? Let's use Total Points
                staked: myPoints?.staked || 0,
                available: myPoints?.available || 0
            });

            setLeaderboard(lbList)
        } catch (error) {
            console.error("Failed to fetch yappers data:", error)
        } finally {
            setLoading(false)
        }
    }

    // Check binding status on mount
    useEffect(() => {
        const checkStatus = async () => {
            try {
                const status = await yappersAPI.getStatus()
                setIsConnected(!!status.isBound)
                if (status.isBound && status.referralStatus === 'none') {
                    setReferralModalOpen(true)
                }
            } catch (error) {
                console.error("Check status failed:", error)
            } finally {
                setStatusLoading(false)
            }
        }

        const handleMessage = (event) => {
            if (event.data === 'TWITTER_CONNECTED' || event.data?.type === 'TWITTER_CONNECTED') {
                message.success('Twitter connected successfully!')
                checkStatus()
            }
        }
        window.addEventListener('message', handleMessage)
        checkStatus()
        return () => window.removeEventListener('message', handleMessage)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (isConnected) fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isConnected])

    const handleConnectTwitter = async () => {
        try {
            message.loading('Opening authentication window...', 1)
            const redirectUri = window.location.origin + '/callback'
            const res = await yappersAPI.connect(redirectUri)
            const { url, codeVerifier } = res
            if (url && codeVerifier) {
                sessionStorage.setItem('twitter_code_verifier', codeVerifier)
                const width = 600, height = 600
                const left = window.screen.width / 2 - width / 2
                const top = window.screen.height / 2 - height / 2
                window.open(url, 'TwitterAuth', `width=${width},height=${height},left=${left},top=${top}`)
            }
        } catch (err) {
            console.error('Failed to initiate connection', err)
            message.error('Failed to initiate connection')
        }
    }

    const handleDisconnect = async () => {
        try {
            setLoading(true)
            await yappersAPI.disconnect()
            setIsConnected(false)
            setInfo(null)
            message.success('Disconnected from Twitter')
        } catch (err) {
            console.error('Disconnect failed', err)
            message.error('Disconnect failed')
        } finally {
            setLoading(false)
        }
    }

    const copyReferral = () => {
        if (!info?.referral?.referralCode) return
        navigator.clipboard.writeText(info?.referral?.referralCode)
        message.success('Referral code copied!')
    }

    const copyLink = () => {
        if (!info?.referral?.link) return
        navigator.clipboard.writeText(info?.referral?.link)
        message.success('Referral link copied!')
    }


    if (statusLoading) return <div style={{ padding: 60, textAlign: 'center' }}><div className="loading-spinner"></div></div>

    if (!isConnected) {
        return (
            <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center', padding: '120px 0' }}>
                <Title level={1} style={{ color: '#fff', fontSize: 48, marginBottom: 8 }}>Naka Yappers</Title>
                <Text style={{ color: '#888', fontSize: 18, marginBottom: 40, display: 'block' }}>Connect your Twitter to join the conversation and earn rewards.</Text>
                <Button type="primary" size="large" icon={<TwitterOutlined />} onClick={handleConnectTwitter}
                    style={{ height: 56, padding: '0 40px', fontSize: 18, borderRadius: 28 }}>
                    Connect Twitter
                </Button>
            </div>
        )
    }

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 60 }}>
            {/* Header Title */}
            <div style={{ marginBottom: 24 }}>
                <Title level={1} style={{ color: '#fff', fontSize: 40, margin: 0 }}>Naka Yappers Rewards</Title>
            </div>

            {/* Top Summary Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
                marginBottom: 32
            }}>
                <div style={{
                    background: '#0d0d0d',
                    border: '1px solid #1f1f1f',
                    borderRadius: 12,
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div>
                        <div style={{ color: '#777', fontSize: 12, marginBottom: 8 }}>Pending Claim / Claimed NAKAPT</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                            <span style={{ color: '#f26c0d', fontSize: 28, fontWeight: 600 }}>{formatLargeNumber(pendingClaim)}</span>
                            <span style={{ color: '#ccc', fontSize: 14 }}>/ {formatLargeNumber(claimed)}</span>
                        </div>
                    </div>
                    <Button type="primary" style={{ background: '#ff5c00', borderColor: '#ff5c00', minWidth: 110, height: 40 }}>
                        Claim
                    </Button>
                </div>

                <div style={{
                    background: '#0d0d0d',
                    border: '1px solid #1f1f1f',
                    borderRadius: 12,
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div>
                        <div style={{ color: '#777', fontSize: 12, marginBottom: 8 }}>Pending Stake / Staked NAKAPT</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                            <span style={{ color: '#f26c0d', fontSize: 28, fontWeight: 600 }}>{formatLargeNumber(pendingStake)}</span>
                            <span style={{ color: '#ccc', fontSize: 14 }}>/ {formatLargeNumber(pointsStats.staked)}</span>
                        </div>
                    </div>
                    <Button type="primary" style={{ background: '#ff5c00', borderColor: '#ff5c00', minWidth: 110, height: 40 }} onClick={() => setStakeModalOpen(true)}>
                        Stake
                    </Button>
                </div>
            </div>

            {/* 2. Main Dashboard (Profile & Stats) */}
            <div style={{
                background: '#0a0a0a',
                border: '1px solid #1f1f1f',
                borderRadius: 4,
                marginBottom: 40
            }}>
                {/* Top Section */}
                <div style={{ borderBottom: '1px solid #1f1f1f', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: 24, color: '#fff', marginBottom: 4 }}>
                            Become a Naka Yapper
                            <Tag color="success" style={{ marginLeft: 12, borderRadius: 12, border: 0, color: '#000', background: '#52c41a' }}>Season 1 ● Live</Tag>
                        </div>
                        <div style={{ color: '#666' }}>Earn rewards for your voice and influence</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ color: '#666', fontSize: 12, marginBottom: 4 }}>Total Rewards: <span style={{ color: '#f7931a', fontSize: 20, fontWeight: 'bold' }}>1,000,000</span> <Tag color="#331d0b" style={{ color: '#f7931a', border: '1px solid #522d0f' }}>NAKAPT</Tag></div>
                        <div style={{ color: '#444', fontSize: 12, fontFamily: 'monospace' }}>300d : 18h : 27m : 59s</div>
                    </div>
                </div>

                {/* Content Section */}
                <Row>
                    {/* Left: Profile & Stats */}
                    <Col span={16} style={{ padding: 40, borderRight: '1px solid #1f1f1f' }}>
                        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 32 }}>
                            <Avatar src={info?.twitter?.avatarUrl} icon={<UserOutlined />} size={64} />
                            <div>
                                <div style={{ color: '#fff', fontSize: 20, fontWeight: 600 }}>{info?.twitter?.username || 'Yapper'}</div>
                                <div style={{ color: '#777', fontSize: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                                    ID: {info?.twitter?.handle}
                                    <Button
                                        size="small"
                                        icon={<DisconnectOutlined />}
                                        onClick={handleDisconnect}
                                        style={{ background: '#111', color: '#bbb', borderColor: '#222', height: 26 }}
                                    >
                                        Disconnect
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
                            <div>
                                <div style={{ color: '#666', fontSize: 12, marginBottom: 8 }}>Total Score</div>
                                <div style={{ color: '#fff', fontSize: 36, fontWeight: 'bold' }}>{formatLargeNumber(info?.stats.totalScore)}</div>
                            </div>
                            <div>
                                <div style={{ color: '#666', fontSize: 12, marginBottom: 8 }}>Rank</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <span style={{ color: '#fff', fontSize: 36, fontWeight: 'bold' }}>{formatLargeNumber(info?.stats.rank)}</span>
                                    <Tag color="#0f2f16" style={{ color: '#52c41a', border: '1px solid #135225' }}>+{info?.stats.rankChange} ↗</Tag>
                                </div>
                            </div>
                            <div>
                                <div style={{ color: '#666', fontSize: 12, marginBottom: 8 }}>Daily Score</div>
                                <div style={{ color: '#fff', fontSize: 36, fontWeight: 'bold' }}>{formatLargeNumber(info?.stats.dailyScore)}</div>
                            </div>
                        </div>
                    </Col>

                    {/* Right: CTA */}
                    <Col span={8} style={{ padding: 40, background: '#0e0e0e' }}>
                        <div style={{ fontSize: 28, color: '#fff', fontWeight: 'bold', lineHeight: 1.2, marginBottom: 12 }}>
                            Post, Engage, <br /> and Start Earning!
                        </div>
                        <div style={{ color: '#888', marginBottom: 32 }}>Make sure to tag <span style={{ color: '#f7931a' }}>@nakarobo</span>.</div>

                        <Button
                            type="primary"
                            block
                            size="large"
                            style={{
                                height: 56,
                                background: '#141414',
                                borderColor: '#333',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                                fontSize: 18
                            }}
                            onClick={() => setPostModalOpen(true)}
                        >
                            <span style={{ color: '#f7931a' }}>𝕏 Post</span>
                            <ArrowRightOutlined style={{ background: '#f7931a', color: '#000', borderRadius: '50%', padding: 4, fontSize: 12 }} />
                        </Button>
                    </Col>
                </Row>

                {/* Bottom: Referral Bar */}
                <div style={{ borderTop: '1px solid #1f1f1f', padding: '16px 32px', background: '#000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: '#666' }}>
                        Invited Friends: <span style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{info?.referral?.totalInvited}</span> 
                        {info?.referral?.dailyChange !== 0 && (
                            <Tag color={info?.referral?.dailyChange > 0 ? '#0f2f16' : '#2b0f0f'} style={{ 
                                color: info?.referral?.dailyChange > 0 ? '#52c41a' : '#ff4d4f', 
                                border: `1px solid ${info?.referral?.dailyChange > 0 ? '#135225' : '#522d0f'}`, 
                                marginLeft: 8 
                            }}>
                                {info?.referral?.dailyChange > 0 ? '+' : ''}{info?.referral?.dailyChange} {info?.referral?.dailyChange > 0 ? '↗' : '↘'}
                            </Tag>
                        )}
                        <span style={{ color: '#f7931a', marginLeft: 16 }}>Refer a friend. Earn 10% of their Base Rewards—no cap, no expiry.</span>
                    </div>
                    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                        <div style={{ color: '#666', fontSize: 12 }}>Referrer Code: <span style={{ color: '#fff' }}>{info?.referral?.referralCode}</span> <CopyOutlined style={{ cursor: 'pointer' }} onClick={copyReferral} /></div>
                        <div style={{ color: '#666', fontSize: 12 }}>{info?.referral?.link} <CopyOutlined style={{ cursor: 'pointer' }} onClick={copyLink} /></div>
                    </div>
                </div>
            </div>

            {/* 3. Leaderboard */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Yapper Leaderboard <Tag style={{ background: '#1f1f1f', border: '1px solid #333', color: '#666', marginLeft: 8 }}>Season 1 Rules</Tag></div>
                <Input prefix={<SearchOutlined style={{ color: '#666' }} />} placeholder="Search User" style={{ width: 200, background: '#0a0a0a', border: '1px solid #333', color: '#fff' }} />
            </div>

            <Table
                dataSource={leaderboard}
                columns={columns}
                rowKey="rank"
                loading={loading}
                pagination={{ pageSize: 10 }}
                // Custom Dark Theme for Table
                rowClassName="dark-table-row"
                style={{ background: 'transparent' }}
            />

            <PostModal
                open={postModalOpen}
                onCancel={() => setPostModalOpen(false)}
                onSuccess={fetchData}
            />

            <StakeModal
                open={stakeModalOpen}
                onCancel={() => setStakeModalOpen(false)}
                availablePoints={pointsStats.available}
            />

            <ReferralModal
                visible={referralModalOpen}
                onClose={() => setReferralModalOpen(false)}
                onSuccess={() => { }}
            />

            <style jsx global>{`
                .ant-table { background: transparent !important; }
                .ant-table-thead > tr > th { 
                    background: #000 !important; 
                    color: #666 !important; 
                    border-bottom: 1px solid #1f1f1f !important;
                    font-size: 12px;
                    text-transform: uppercase;
                }
                .ant-table-tbody > tr > td { 
                    border-bottom: 1px solid #1f1f1f !important;
                    color: #fff;
                }
                .ant-table-tbody > tr:hover > td {
                    background: #141414 !important;
                }
                .ant-pagination-item-active {
                    background: #f7931a !important;
                    border-color: #f7931a !important;
                }
                .ant-pagination-item-active a {
                    color: #000 !important;
                }
            `}</style>
        </div>
    )
}

export default Yappers
