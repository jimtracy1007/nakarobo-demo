import React, { useState } from 'react';
import { Modal, Input, Button, message, Typography } from 'antd';
import { referralAPI } from '@/api';

const { Text } = Typography;

const ReferralModal = ({ visible, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [code, setCode] = useState('');

    const handleBind = async () => {
        if (!code) {
            message.error('Please enter a referral code');
            return;
        }
        setLoading(true);
        try {
            await referralAPI.bind(code);
            message.success('Referral code bound successfully!');
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            if (err.response?.data?.error?.code === 'SELF_INVITE') {
                message.error('Cannot invite yourself');
            } else if (err.response?.data?.error?.code === 'INVALID_CODE') {
                message.error('Invalid referral code');
            } else if (err.response?.data?.error?.code === 'ALREADY_BOUND') {
                // Technically shouldn't happen if we only show this when non-bound, but just in case
                message.info('Already bound');
                onClose();
            } else {
                message.error(err.message || 'Failed to bind referral code');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = async () => {
        setLoading(true);
        try {
            await referralAPI.skip();
            message.info('Referral step skipped');
            onClose();
        } catch (err) {
            console.error(err);
            message.error('Failed to skip');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Enter Invitation Code"
            open={visible}
            maskClosable={false}
            closable={false}
            footer={null}
            centered
        >
            <div className="flex flex-col gap-4">
                <Text type="secondary">
                    Enter an invitation code to support the community. This step is optional.
                </Text>

                <Input
                    placeholder="Invitation Code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    size="large"
                />

                <div className="flex gap-4 mt-2">
                    <Button
                        type="primary"
                        block
                        size="large"
                        onClick={handleBind}
                        loading={loading}
                    >
                        Confirm
                    </Button>
                    <Button
                        type="default" // or 'text' if we want it less prominent
                        block
                        size="large"
                        onClick={handleSkip}
                        loading={loading}
                    >
                        Skip
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ReferralModal;
