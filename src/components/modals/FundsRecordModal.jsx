import { Modal, Table, Tag } from 'antd'
import { useState, useEffect } from 'react'
import { nodeAPI } from '@/api'
import { formatUSD, formatTokenAmount } from '@/utils/format'
import { formatDate } from '@/utils/datetime'

export function FundsRecordModal({ open, onCancel }) {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState([])
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

    const fetchRecords = async (page = 1) => {
        setLoading(true)
        try {
            const res = await nodeAPI.getFundsRecords(page, pagination.pageSize)
            setData(res.items || [])
            setPagination(prev => ({
                ...prev,
                current: page,
                total: res.total || 0
            }))
        } catch (error) {
            console.error('Failed to fetch funds records', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (open) {
            fetchRecords(1)
        }
    }, [open])

    const columns = [
        {
            title: 'Time',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text) => formatDate(text, true),
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type) => {
                const colors = {
                    DEPOSIT: 'green',
                    REDEMPTION: 'red',
                    WAIVE_REDEMPTION: 'orange'
                }
                return <Tag color={colors[type]}>{type}</Tag>
            }
        },
        {
            title: 'Amount',
            key: 'amount',
            render: (_, record) => {
                const symbol = record.tokenSymbol || 'USDT'
                return `${formatTokenAmount(record.amount, record.tokenDecimals || 6)} ${symbol}`
            }
        },
        {
            title: 'Burn Points',
            dataIndex: 'burnPoints',
            key: 'burnPoints',
            render: (points) => points ? `${points} Pts` : '-'
        }
    ]

    return (
        <Modal
            title="Funds Records"
            open={open}
            onCancel={onCancel}
            footer={null}
            width={700}
        >
            <Table
                columns={columns}
                dataSource={data}
                loading={loading}
                rowKey="id"
                pagination={{
                    ...pagination,
                    onChange: fetchRecords,
                    size: 'small'
                }}
                size="small"
            />
        </Modal>
    )
}

export default FundsRecordModal
