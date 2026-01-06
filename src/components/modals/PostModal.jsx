import { useState } from 'react'
import { Modal, Input, Button, App, Alert, Divider, Space } from 'antd'
import { TwitterOutlined, RobotOutlined, ReloadOutlined } from '@ant-design/icons'
import { yappersAPI } from '@/api'

const { TextArea } = Input

export function PostModal({ open, onCancel, onSuccess }) {
    const { message } = App.useApp()
    const [content, setContent] = useState('')

    const [generating, setGenerating] = useState(false)

    const defaultTag = '@NakaRobo #NakaRobo'

    const handleGenerateAI = async () => {
        setGenerating(true)
        try {
            const res = await yappersAPI.generateDrafts()
            // Assuming res.drafts is an array, pick first one or res itself if string
            const draft = res.drafts ? res.drafts[0] : (res.content || res)
            setContent(draft)
            message.success('AI Draft Generated!')
        } catch (error) {
            console.error(error)
            message.error('Failed to generate draft')
        } finally {
            setGenerating(false)
        }
    }

    const handlePost = async () => {
        // 1. Open Twitter Intent with content
        const tweetText = encodeURIComponent(content.includes(defaultTag) ? content : `${content} ${defaultTag}`)
        window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank')
    }

    const handleDone = () => {
        message.info('System will automatically verify your post and update points shortly.')
        onSuccess?.()
        onCancel()
        setContent('')

    }

    return (
        <Modal
            title="Create Yappers Post"
            open={open}
            onCancel={onCancel}
            footer={null}
            width={600}
        >
            <Alert
                message="Earn points by posting about NakaRobo on Twitter."
                description="Our system automatically tracks your posts. Make sure to include @NakaRobo and #NakaRobo."
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
            />

            {/* AI Generator Section */}
            <div style={{ background: '#f9f9f9', padding: 16, borderRadius: 8, marginBottom: 24, textAlign: 'center' }}>
                <div style={{ fontWeight: 'bold', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <RobotOutlined style={{ color: '#1890ff' }} /> AI Assistant
                </div>
                <Button
                    type="dashed"
                    onClick={handleGenerateAI}
                    loading={generating}
                    icon={<ReloadOutlined />}
                    style={{ width: '100%' }}
                >
                    Auto-Generate Tweet Draft
                </Button>
            </div>

            <Divider>Or Write Manually</Divider>

            <div style={{ marginBottom: 16 }}>
                <TextArea
                    rows={4}
                    placeholder="Write something about your robot..."
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    maxLength={280}
                    showCount
                />
                <div style={{ marginTop: 8, color: '#1890ff', fontSize: 13 }}>
                    Required tags: {defaultTag}
                </div>
            </div>

            <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
                <Button
                    icon={<TwitterOutlined />}
                    type="primary"
                    size="large"
                    block
                    onClick={handlePost}
                    disabled={!content}
                >
                    Post on Twitter
                </Button>
                <Button
                    size="large"
                    block
                    onClick={handleDone}
                >
                    I've Posted
                </Button>
            </div>
        </Modal>
    )
}

export default PostModal
