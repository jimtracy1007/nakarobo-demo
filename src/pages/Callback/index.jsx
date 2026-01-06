import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { App, Spin, Result } from 'antd'
import { yappersAPI } from '@/api'

export default function Callback() {
    const [searchParams] = useSearchParams()
    const { message } = App.useApp()
    const [status, setStatus] = useState('processing') // processing, success, error
    const processedRef = useRef(false)

    useEffect(() => {
        if (processedRef.current) return
        processedRef.current = true

        const code = searchParams.get('code')
        const codeVerifier = sessionStorage.getItem('twitter_code_verifier')

        // This redirect URI must match exactly what was sent in the connect request
        // Since we are now on /callback, the connect request should have sent .../callback
        const redirectUri = window.location.origin + '/callback'

        if (!code) {
            setStatus('error')
            return
        }

        if (!codeVerifier) {
            message.error('Session expired. Please try connecting again.')
            setStatus('error')
            return
        }

        yappersAPI.callback(code, codeVerifier, redirectUri)
            .then((res) => {
                sessionStorage.removeItem('twitter_code_verifier')
                setStatus('success')

                if (window.opener) {
                    window.opener.postMessage({
                        type: 'TWITTER_CONNECTED',
                        payload: res // { twitterId, connectedAt, referralStatus, isReplacement }
                    }, window.location.origin)
                    setTimeout(() => window.close(), 1000) // Delayed close to show success tick
                }
            })
            .catch(err => {
                console.error('Callback failed:', err)
                setStatus('error')

                if (window.opener) {
                    window.opener.postMessage({
                        type: 'TWITTER_FAILED',
                        error: err.response?.data || {
                            error: {
                                message: err.message,
                                code: err.code,
                                data: err.data
                            },
                            // Fallback for direct property access if strict structure isn't followed
                            code: err.code,
                            data: err.data
                        }
                    }, window.location.origin)
                    setTimeout(() => window.close(), 2000) // Show error briefly then close
                }
            })
    }, [])

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#000' }}>
            {status === 'processing' && <Spin size="large" tip="Verifying Twitter Connection..." />}
            {status === 'success' && <Result status="success" title="Connected Successfully" subTitle="Closing window..." />}
            {status === 'error' && <Result status="error" title="Connection Failed" subTitle="Please close this window and try again." />}
        </div>
    )
}
