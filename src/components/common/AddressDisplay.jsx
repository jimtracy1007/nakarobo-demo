import { formatAddress as formatAddr } from '@/utils/format'
import { Tooltip } from 'antd'
import { CopyOutlined } from '@ant-design/icons'
import { message } from 'antd'

/**
 * 地址显示组件 - 前7后4,支持复制
 */
export function AddressDisplay({ address, showCopy = true, className = '' }) {
    if (!address) return null

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(address)
            message.success('Address copied!')
        } catch (err) {
            message.error('Failed to copy')
        }
    }

    return (
        <span className={`address-display ${className}`}>
            <Tooltip title={address}>
                <span>{formatAddr(address)}</span>
            </Tooltip>
            {showCopy && (
                <CopyOutlined
                    onClick={handleCopy}
                    style={{ marginLeft: 8, cursor: 'pointer' }}
                />
            )}
        </span>
    )
}

export default AddressDisplay
