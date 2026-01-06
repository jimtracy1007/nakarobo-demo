import { useState, useEffect } from 'react'
import { Form, Input, Button, Card, Avatar, Space, message, Spin } from 'antd'
import { ReloadOutlined, UserOutlined } from '@ant-design/icons'
import { nodeAPI } from '@/api'
import { validateNodeName } from '@/utils/validation'

export function SetupStep({ onNext, initialData }) {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState(initialData?.avatarUrl || '')
    const [avatarId, setAvatarId] = useState(initialData?.avatarId || null)
    const [refreshLoading, setRefreshLoading] = useState(false)

    // 初始加载随机头像 (不消耗次数)
    useEffect(() => {
        if (!avatarUrl) {
            loadInitialAvatar()
        }
    }, [])

    const loadInitialAvatar = async () => {
        setRefreshLoading(true)
        try {
            const res = await nodeAPI.getRandomAvatar()
            if (res && res.imageUrl) {
                setAvatarUrl(res.imageUrl)
                setAvatarId(res.avatarId)
            }
        } catch (error) {
            console.warn('Failed to fetch initial avatar:', error)
            fallbackToMock()
        } finally {
            setRefreshLoading(false)
        }
    }

    const handleRefreshClick = async (e) => {
        e?.preventDefault()
        e?.stopPropagation()

        setRefreshLoading(true)
        try {
            // 使用 refresh 接口 (消耗次数)
            const res = await nodeAPI.refreshAvatar()
            if (res && res.avatarUrl) { // Note: API returns avatarUrl, check response structure
                setAvatarUrl(res.avatarUrl) // Backend returns avatarUrl
                setAvatarId(res.avatarId)
                if (res.remainingRefreshesToday !== undefined) {
                    message.success(`Refreshed! Remaining: ${res.remainingRefreshesToday}`)
                }
            }
        } catch (error) {
            console.error('Refresh failed:', error)
            if (error.response?.status === 429) {
                message.error('Daily refresh limit reached (3/3)')
            } else {
                // Network error or other issue
                message.error('Failed to refresh avatar')
            }
        } finally {
            setRefreshLoading(false)
        }
    }

    const fallbackToMock = () => {
        // Mock fallback removed
        // const randomId = Math.floor(Math.random() * 1000)
        // setAvatarUrl(`https://api.dicebear.com/7.x/bottts/svg?seed=${randomId}`)
        // setAvatarId(randomId)
        message.warning('Failed to fetch avatar')
    }

    const handleNext = async () => {
        try {
            const values = await form.validateFields()
            setLoading(true)

            // 模拟 API 检查耗时
            await new Promise(resolve => setTimeout(resolve, 500))

            onNext({
                name: values.nodeName,
                avatarUrl,
                avatarId
            })
        } catch (error) {
            console.error('Validation failed:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ maxWidth: 500, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <h2>Setup Your Node</h2>
                <p style={{ color: '#666' }}>Give your node a unique identity</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 40 }}>
                <div style={{ position: 'relative', marginBottom: 16 }}>
                    <div style={{
                        width: 120,
                        height: 120,
                        background: '#f5f5f5',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '2px solid #fff',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        {refreshLoading ? (
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Spin />
                            </div>
                        ) : (
                            <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                    </div>
                    <Button
                        shape="circle"
                        icon={<ReloadOutlined />}
                        size="small"
                        style={{ position: 'absolute', bottom: 0, right: 0 }}
                        onClick={handleRefreshClick}
                        disabled={refreshLoading}
                    />
                </div>
                <div style={{ color: '#999', fontSize: 12 }}>
                    You can refresh 3 times per day
                </div>
            </div>

            <Form
                form={form}
                layout="vertical"
                initialValues={{ nodeName: initialData?.name || '' }}
            >
                <Form.Item
                    name="nodeName"
                    label="Node Name"
                    rules={[
                        { required: true, message: 'Please input your node name' },
                        {
                            validator: (_, value) => {
                                const { valid, error } = validateNodeName(value)
                                if (!valid) {
                                    return Promise.reject(new Error(error))
                                }
                                return Promise.resolve()
                            }
                        }
                    ]}
                >
                    <Input
                        placeholder="Enter node name (2-20 characters)"
                        size="large"
                        maxLength={20}
                    />
                </Form.Item>

                <Form.Item style={{ marginTop: 40 }}>
                    <Button
                        type="primary"
                        size="large"
                        block
                        onClick={handleNext}
                        loading={loading}
                    >
                        Next Step
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
}
