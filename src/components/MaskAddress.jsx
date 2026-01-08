import { Typography, Tooltip } from 'antd';

const { Text } = Typography;

export const formatAddress = (address, start = 6, end = 4) => {
    if (!address) return '';
    if (address.length <= start + end) return address;
    return `${address.slice(0, start)}...${address.slice(-end)}`;
};

export const MaskAddress = ({ address, copyable = false, style, start = 6, end = 4 }) => {
    if (!address) return null;

    const formatted = formatAddress(address, start, end);

    return (
        <Text copyable={copyable ? { text: address } : false} style={style}>
            {formatted}
        </Text>
    );
};

export default MaskAddress;
