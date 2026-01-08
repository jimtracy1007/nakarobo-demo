import { useState, useEffect } from 'react'
import { Card, Button, Row, Col, Statistic, List, Tag, Table, Avatar } from 'antd'
import { CheckCircleOutlined, RightOutlined, TrophyOutlined } from '@ant-design/icons'
import { questsAPI } from '../../api'

// Helper to mask address
const maskAddress = (addr) => {
    if (!addr) return '-';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

// Countdown renderer (Simple version)
const Countdown = ({ targetDate }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(targetDate) - +new Date();
            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                const seconds = Math.floor((difference / 1000) % 60);
                return `${days}d ${hours.toString().padStart(2, '0')} : ${minutes.toString().padStart(2, '0')} : ${seconds.toString().padStart(2, '0')}`;
            }
            return 'Ended';
        };

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    return <span>{timeLeft}</span>;
}

export function Quests() {
    const [loading, setLoading] = useState(true)
    const [summary, setSummary] = useState(null)
    const [leaderboard, setLeaderboard] = useState([])
    const [checkingIn, setCheckingIn] = useState(false)

    const fetchData = async () => {
        setLoading(true)
        try {
            const data = await questsAPI.getSummary()
            setSummary(data.summary)
            setLeaderboard(data.leaderboard || [])
        } catch (error) {
            console.error(error)
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
            // Optimistically update
            setSummary(prev => ({
                ...prev,
                todayCheckedIn: true,
                streakDays: res.streak || (prev?.streakDays || 0) + 1,
                // Claimed points effectively increase (Score)
                claimed: (prev?.claimed || 0) + res.pointsEarned
            }))
        } catch (error) {
            console.error(error)
        } finally {
            setCheckingIn(false)
        }
    }

    // Generate Streak Cards based on rules and current streak
    const renderStreakCards = () => {
        const rules = summary?.rules || [];
        const currentStreak = summary?.streakDays || 0;
        const todayCheckedIn = summary?.todayCheckedIn;

        // We want to show a 7-day view or relevant window
        // For simplicity, let's show Day 1-7 fixed logic mapping to rules
        const days = [1, 2, 3, 4, 5, 6, 7];

        return (
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
                {days.map(day => {
                    // Start logic for points display
                    let points = 10;
                    if (day >= 4 && day <= 6) points = 15;
                    if (day >= 7) points = 20;

                    // Determine state
                    // Passed: day < currentStreak
                    // Current: day === currentStreak (if checked in) or day === currentStreak + 1 (if not) - but simpler:
                    // Visually: 
                    // - Completed icons for days <= streak
                    // - If today is done, Streak=X. Day X is completed.
                    // - If today not done, Streak=X. Next is Day X+1.

                    // Let's interpret "Streak" as "Completed Days".
                    // So if Streak=1, Day 1 is done.

                    const isCompleted = day <= currentStreak;
                    const isTodayTarget = !todayCheckedIn && day === (currentStreak + 1);
                    const isFuture = day > currentStreak && !isTodayTarget;

                    let borderColor = '#333';
                    let opacity = 0.5;
                    let icon = null;

                    if (isCompleted) {
                        borderColor = '#f7931a';
                        opacity = 1;
                        icon = <CheckCircleOutlined style={{ color: '#f7931a' }} />;
                    } else if (isTodayTarget) {
                        borderColor = '#f7931a'; // Highlight next target
                        opacity = 1;
                        // Dashed border? Antd Card doesn't support easy dash, use CSS style
                    }

                    return (
                        <div key={day} style={{
                            border: `1px solid ${borderColor}`,
                            borderRadius: 8,
                            minWidth: 80,
                            height: 100,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#141414',
                            opacity: opacity,
                            position: 'relative'
                        }}>
                            <div style={{ color: '#888', fontSize: 12, marginBottom: 4 }}>Day {day}</div>
                            <div style={{ color: '#f7931a', fontSize: 20, fontWeight: 'bold' }}>+{points}</div>
                            {icon && <div style={{ marginTop: 8 }}>{icon}</div>}
                        </div>
                    )
                })}
            </div>
        )
    }

    const leaderboardColumns = [
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
            render: (text) => <span style={{ color: '#ddd' }}>{maskAddress(text)}</span>
        },
        {
            title: 'Total Score',
            dataIndex: 'totalPoints',
            key: 'totalPoints',
            align: 'right',
            render: (val) => <span style={{ color: '#52c41a' }}>+{val.toLocaleString()}</span>
        },
        {
            title: 'Week Score',
            dataIndex: 'weekPoints',
            key: 'weekPoints',
            align: 'right',
            render: (val) => <span style={{ color: '#fff' }}>{val.toLocaleString()}</span>
        },
    ];

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 40 }}>
            {/* 1. Top Header Stats */}
            <div style={{
                background: '#141414',
                border: '1px solid #303030',
                borderRadius: 12,
                padding: '24px',
                marginBottom: 24,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', gap: 48 }}>
                    <div>
                        <div style={{ color: '#888', marginBottom: 8 }}>Total NAKAPT</div>
                        <div style={{ fontSize: 32, fontWeight: 'bold', color: '#fff' }}>
                            0
                        </div>
                    </div>
                    <div style={{ borderLeft: '1px solid #303030', paddingLeft: 48 }}>
                        <div style={{ color: '#888', marginBottom: 8 }}>Staked / Unstaked NAKAPT</div>
                        <div style={{ fontSize: 32, fontWeight: 'bold', color: '#f7931a' }}>
                            {/* Mock Staked Data for now as API doesn't return it yet, assume 0 / 0 */}
                            0 <span style={{ color: '#888', fontSize: 24 }}>/ 0</span>
                        </div>
                    </div>
                </div>
                <Button type="primary" size="large" icon={<RightOutlined />} style={{ background: '#3f1805', borderColor: '#7a3108', color: '#f7931a' }} ghost>
                    Stake NAKAPT
                </Button>
            </div>

            {/* 2. Daily Check-in Panel */}
            <div style={{
                background: '#141414',
                border: '1px solid #303030',
                borderRadius: 12,
                padding: '24px',
                marginBottom: 24
            }}>
                {/* Panel Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <h2 style={{ color: '#fff', margin: 0 }}>Daily Check-in</h2>
                        <Tag color="green">{summary?.seasonInfo?.tag || 'Season 1'}</Tag>
                        <Tag color="success">Live</Tag>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ color: '#888', marginRight: 12 }}>Total Rewards: <span style={{ color: '#f7931a', fontWeight: 'bold' }}>{summary?.seasonInfo?.totalRewards?.toLocaleString() || '-'} NAKAPT</span></span>
                        <span style={{ background: '#222', padding: '4px 8px', borderRadius: 4, color: '#888' }}>
                            {summary?.seasonInfo?.endTime && <Countdown targetDate={summary.seasonInfo.endTime} />}
                        </span>
                    </div>
                </div>

                <p style={{ color: '#666', marginBottom: 24 }}>Build your streak to earn more points!</p>

                <div style={{ display: 'flex', gap: 24 }}>
                    {/* Left: My Score & Rank */}
                    <div style={{ width: 200, borderRight: '1px solid #303030', paddingRight: 24 }}>
                        <div style={{ marginBottom: 24 }}>
                            <div style={{ color: '#888', marginBottom: 4 }}>My Score</div>
                            <div style={{ color: '#f7931a', fontSize: 28, fontWeight: 'bold' }}>{summary?.claimed ? summary.claimed.toLocaleString() : 0}</div>
                        </div>
                        <div>
                            <div style={{ color: '#888', marginBottom: 4 }}>Rank</div>
                            <div style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>
                                {summary?.myRank || '-'}
                                {/* Mock delta */}
                                <span style={{ fontSize: 12, color: '#52c41a', marginLeft: 8 }}>+0 ↗</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Streak Cards & Action */}
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: '#888', fontSize: 12 }}>
                            <CheckCircleOutlined /> Missing a day resets your streak
                        </div>

                        {renderStreakCards()}

                        <div style={{ marginTop: 24, textAlign: 'center' }}>
                            <Button
                                type="primary"
                                size="large"
                                style={{
                                    width: 200,
                                    height: 48,
                                    background: summary?.todayCheckedIn ? '#333' : 'linear-gradient(90deg, #511e06 0%, #7a3108 100%)',
                                    borderColor: summary?.todayCheckedIn ? '#333' : '#a64d18',
                                    color: summary?.todayCheckedIn ? '#888' : '#fff'
                                }}
                                disabled={summary?.todayCheckedIn}
                                onClick={handleCheckin}
                                loading={checkingIn}
                            >
                                {summary?.todayCheckedIn ? 'Checked In' : 'Check in Now'} <RightOutlined />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Leaderboard */}
            <h2 style={{ color: '#fff', marginBottom: 16 }}>Leaderboard</h2>
            <Table
                dataSource={leaderboard}
                columns={leaderboardColumns}
                rowKey="user"
                pagination={false}
                loading={loading}
                style={{ background: 'transparent' }}
                rowClassName="dark-row"
            />
            {/* Add global style override for Table within this component scope if needed, or rely on index.css */}
            <style>{`
                .ant-table { background: transparent !important; }
                .ant-table-thead > tr > th { background: #1f1f1f !important; color: #888 !important; border-bottom: 1px solid #303030 !important; }
                .ant-table-tbody > tr > td { border-bottom: 1px solid #303030 !important; }
                .ant-table-tbody > tr:hover > td { background: #262626 !important; }
            `}</style>
        </div>
    )
}

export default Quests
