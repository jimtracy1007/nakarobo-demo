import { useState, useEffect } from 'react'
import { Card, Button, Row, Col, Statistic, Table, Avatar, Badge, Space, App, Empty, Tooltip } from 'antd'
import { TwitterOutlined, CopyOutlined, ShareAltOutlined } from '@ant-design/icons'
import { useSearchParams } from 'react-router-dom'
import { yappersAPI } from '@/api'
import { formatLargeNumber, formatAddress } from '@/utils/format'
import { PostModal } from '@/components/modals/PostModal'
import { StakeModal } from '@/components/modals/StakeModal'

export function Yappers() {
    const { message } = App.useApp()
    const [loading, setLoading] = useState(true)
    const [info, setInfo] = useState(null)
    const [leaderboard, setLeaderboard] = useState([])
    const [postModalOpen, setPostModalOpen] = useState(false)
    const [stakeModalOpen, setStakeModalOpen] = useState(false)

    const [searchParams, setSearchParams] = useSearchParams()
    const [isConnected, setIsConnected] = useState(false)
    const [statusLoading, setStatusLoading] = useState(true)

    const columns = [
        { title: 'Rank', dataIndex: 'rank', key: 'rank', width: 80, render: r => <b>#{r}</b> },
        {
            title: 'User', key: 'user', render: (_, record) => {
                const u = record.user || record
                return (
                    <Space>
                        <Avatar src={u?.avatarUrl || u?.profileImageUrl} />
                        <div style={{ display: 'flex', flexDirection: 'column', fontSize: 12 }}>
                            <span>{u?.name || u?.twitterName || 'Unknown'}</span>
                            <span style={{ color: '#999' }}>{u?.handle || u?.twitterHandle || u?.username}</span>
                        </div>
                    </Space>
                )
            }
        },
        { title: 'Mindshare', dataIndex: 'mindshare', key: 'mindshare', render: v => `${((v || 0) * 100).toFixed(1)}%` },
        { title: 'Daily Score', key: 'dailyScore', align: 'right', render: (_, r) => formatLargeNumber(r.dailyScore || 0) },
        { title: 'Total Score', key: 'totalScore', align: 'right', render: (_, r) => <b>{formatLargeNumber(r.totalScore ?? r.score ?? 0)}</b> },
    ]

    const fetchData = async () => {
        if (!isConnected) return
        setLoading(true)
        try {
            // Parallel Fetching
            const [scores, lbData, refData, status] = await Promise.all([
                yappersAPI.getScores(),
                yappersAPI.getLeaderboard(),
                // referralAPI.getMyReferral(), // might fail if not fully implemented in backend yet
                { code: 'TEMP123' }, // Mock referral for now or use API if ready
                yappersAPI.getStatus()
            ])

            console.log('API Responses - Scores:', scores, 'Leaderboard:', lbData, 'Status:', status);
            const lbList = Array.isArray(lbData) ? lbData : (lbData?.list || lbData?.items || lbData?.data || []);

            setInfo({
                season: 1,
                twitter: {
                    username: status.twitterName || status.twitterHandle || '',
                    handle: status.twitterHandle || '',
                    avatarUrl: status.avatarUrl || ''
                },
                stats: {
                    totalScore: scores.cumulativeTotal || 0,
                    rank: lbList.find(item => item.user?.handle === status.twitterHandle)?.rank || 0,
                    rankChange: 0, // Mock
                    dailyScore: scores.daily?.[0]?.dailyTotal || 0,
                    pendingClaim: 0, // Should come from API
                    claimed: 0,
                    invitedFriends: 0, // Should come from refData
                    inviteChange: 0
                },
                referralCode: refData.code || 'N/A'
            })

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
                console.log('CheckStatus result:', status, 'isBound:', status.isBound)
                setIsConnected(!!status.isBound)
            } catch (error) {
                console.error("Failed to check twitter status:", error)
            } finally {
                setStatusLoading(false)
            }
        }

        const handleMessage = (event) => {
            if (event.data === 'TWITTER_CONNECTED') {
                message.success('Twitter connected successfully!')
                checkStatus() // Refresh status in parent window
            }
        }

        window.addEventListener('message', handleMessage)

        // Handle OAuth Callback Logic (Run only if code exists)
        const code = searchParams.get('code')
        if (code) {
            setStatusLoading(true)
            const codeVerifier = sessionStorage.getItem('twitter_code_verifier')
            const redirectUri = window.location.origin + '/yappers'

            if (!codeVerifier) {
                message.error('Session expired or invalid. Please try connecting again.')
                setStatusLoading(false)
                return
            }

            yappersAPI.callback(code, codeVerifier, redirectUri)
                .then(() => {
                    sessionStorage.removeItem('twitter_code_verifier')
                    if (window.opener) {
                        // If running in popup
                        window.opener.postMessage('TWITTER_CONNECTED', window.location.origin)
                        window.close()
                    } else {
                        // Fallback if not in popup
                        message.success('Twitter connected successfully!')
                        setIsConnected(true)
                        setSearchParams({})
                        setStatusLoading(false)
                    }
                })
                .catch(err => {
                    console.error('Callback failed:', err)
                    message.error('Connection failed or code expired. Checking status...')
                    setStatusLoading(false)
                    checkStatus()
                })

            // If in popup, we stop here (render loading)
            return () => window.removeEventListener('message', handleMessage)
        }

        // Normal initialization
        checkStatus()

        return () => window.removeEventListener('message', handleMessage)
    }, [])

    useEffect(() => {
        if (isConnected) {
            fetchData()
        }
    }, [isConnected])

    const handleConnectTwitter = async () => {
        try {
            message.loading('Opening authentication window...', 1)
            const redirectUri = window.location.origin + '/yappers'
            const res = await yappersAPI.connect(redirectUri)
            const { url, codeVerifier } = res

            if (url && codeVerifier) {
                sessionStorage.setItem('twitter_code_verifier', codeVerifier)

                const width = 600
                const height = 600
                const left = window.screen.width / 2 - width / 2
                const top = window.screen.height / 2 - height / 2
                window.open(url, 'TwitterAuth', `width=${width},height=${height},left=${left},top=${top}`)
            } else {
                message.error('Failed to get auth URL')
            }
        } catch (error) {
            message.error('Failed to initiate connection')
        }
    }

    const handleClaim = () => {
        message.success('Rewards claimed successfully!')
        setInfo(prev => ({
            ...prev,
            stats: {
                ...prev.stats,
                pendingClaim: 0,
                claimed: prev.stats.claimed + prev.stats.pendingClaim
            }
        }))
    }

    if (statusLoading) {
        return (
            <div style={{ textAlign: 'center', padding: 60 }}>Loading status...</div>
        )
    }

    if (!isConnected) {
        return (
            <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center', padding: '60px 0' }}>
                <h1>Naka Yappers</h1>
                <p style={{ color: '#666', marginBottom: 32 }}>Connect your Twitter to join the conversation and earn rewards.</p>
                <Button type="primary" size="large" icon={<TwitterOutlined />} onClick={handleConnectTwitter}>
                    Connect Twitter
                </Button>

                <div style={{ marginTop: 60, opacity: 0.5, pointerEvents: 'none' }}>
                    {/* Preview of content */}
                    <Table columns={columns} dataSource={leaderboard.slice(0, 3)} pagination={false} />
                </div>
            </div>
        )
    }

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ marginBottom: 24 }}>
                <h1>Naka Yappers <Badge count={`Season ${info?.season || 1}`} style={{ backgroundColor: '#52c41a' }} /></h1>
            </div>

            {/* 1. Rewards Module */}
            <Card title="Your Rewards" style={{ marginBottom: 24 }}>
                <Row gutter={24}>
                    <Col span={6}>
                        <Statistic title="Pending Claim" value={info?.stats.pendingClaim} suffix="NAKAPT" />
                    </Col>
                    <Col span={6}>
                        <Statistic title="Claimed" value={info?.stats.claimed} />
                    </Col>
                    <Col span={12} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 16 }}>
                        <Button
                            type="primary"
                            onClick={handleClaim}
                            disabled={!info?.stats.pendingClaim}
                        >
                            Claim Rewards
                        </Button>
                        <Button onClick={() => setStakeModalOpen(true)}>Stake Points</Button>
                    </Col>
                </Row>
            </Card>

            {/* 2. Join Yapper Module */}
            <Card style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                    <Space>
                        <Avatar size={64} src={info?.twitter?.avatarUrl} />
                        <div>
                            <div style={{ fontSize: 18, fontWeight: 'bold' }}>{info?.twitter?.username}</div>
                            <div style={{ color: '#999' }}>{info?.twitter?.handle}</div>
                            <Button type="link" danger size="small" style={{ padding: 0 }} onClick={() => setIsConnected(false)}>Disconnect</Button>
                        </div>
                    </Space>
                    <div style={{ textAlign: 'right' }}>
                        <Statistic title="Total Score" value={info?.stats.totalScore} valueStyle={{ color: '#1890ff' }} />
                        <div style={{ fontSize: 12, color: '#666' }}>Rank #{info?.stats.rank} (↑{info?.stats.rankChange})</div>
                    </div>
                </div>

                <Row gutter={24}>
                    <Col span={8}>
                        <Card size="small" style={{ background: '#f5f5f5' }}>
                            <Statistic title="Daily Score (Yesterday)" value={info?.stats.dailyScore} />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Button type="primary" size="large" icon={<ShareAltOutlined />} onClick={() => setPostModalOpen(true)}>
                                Create New Post
                            </Button>
                        </div>
                    </Col>
                    <Col span={8}>
                        <Card size="small" style={{ background: '#fff7e6' }}>
                            <div style={{ fontSize: 12, color: '#666' }}>Invited Friends: {info?.stats.invitedFriends}</div>
                            <div style={{ fontWeight: 'bold', margin: '8px 0' }}>Code: {info?.referralCode} <CopyOutlined /></div>
                            <Button type="link" size="small" style={{ padding: 0 }}>View Referral Details</Button>
                        </Card>
                    </Col>
                </Row>
            </Card>

            {/* 3. Leaderboard */}
            <Card title="Yapper Leaderboard">
                <Table
                    dataSource={leaderboard}
                    columns={columns}
                    rowKey="rank"
                    loading={loading}
                />
            </Card>

            <PostModal
                open={postModalOpen}
                onCancel={() => setPostModalOpen(false)}
                onSuccess={fetchData}
            />

            <StakeModal
                open={stakeModalOpen}
                onCancel={() => setStakeModalOpen(false)}
                availablePoints={info?.stats.claimed} // Use claimed as available source?
            />
        </div>
    )
}

export default Yappers
