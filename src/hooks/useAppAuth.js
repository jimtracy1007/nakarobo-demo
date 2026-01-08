import { useState, useCallback, useEffect } from 'react'
import { useAccount, useSignMessage, useDisconnect } from 'wagmi'
import { authAPI } from '@/api'
import { message } from 'antd'

export function useAppAuth() {
  const { address, isConnected, chainId } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const { disconnect } = useDisconnect()
  
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  // Initialize state based on token existence
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('jwt_token'))

  // Monitor Token Changes (e.g. from other tabs or logout events)
  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('jwt_token')
      setIsAuthenticated(!!token)
    }
    
    window.addEventListener('storage', checkToken)
    // Also check on focus to be safe
    window.addEventListener('focus', checkToken)
    
    return () => {
      window.removeEventListener('storage', checkToken)
      window.removeEventListener('focus', checkToken)
    }
  }, [])

  // Force sync isAuthenticated when wallet disconnects (with debounce)
  useEffect(() => {
    let timer
    if (!isConnected) {
      // Wait 500ms before treating it as a real disconnect
      timer = setTimeout(() => {
        setIsAuthenticated(false)
        localStorage.removeItem('jwt_token')
      }, 500)
    }
    return () => clearTimeout(timer)
  }, [isConnected])

  const login = useCallback(async () => {
    console.log('[Auth] Login clicked. State:', { isConnected, address, isLoggingIn })
    
    if (!isConnected || !address) {
      console.warn('[Auth] Login aborted: Wallet not connected or address missing')
      message.warning('Please connect wallet first')
      return
    }

    // Prevent double-click
    if (isLoggingIn) {
        console.warn('[Auth] Login aborted: Already logging in')
        return
    }

    setIsLoggingIn(true)
    console.log('[Auth] Starting manual login flow...', { address, chainId })

    try {
      // 1. Get Nonce
      console.log('[Auth] Fetching nonce...')
      const response = await authAPI.getNonce(address)
      console.log('[Auth] Nonce response:', response)

      // Defense mechanism: Handle both wrapped and unwrapped cases just in case client.js changed
      // Expected from client.js: { nonce: "...", message: "..." }
      const nonceData = response.data || response
      const nonce = nonceData?.nonce
      const serverMessage = nonceData?.message

      if (!nonce) {
        throw new Error('Invalid server response: Missing nonce')
      }

      // 2. Prepare Message
      const messageToSign = serverMessage || `Welcome to Nakarobo!\n\nPlease sign this message to verify your identity.\n\nNonce: ${nonce}`
      
      // 3. Sign Message
      console.log('[Auth] Requesting signature...')
      let signature;
      try {
        signature = await signMessageAsync({ 
          message: messageToSign,
        })
      } catch (signError) {
        // Catch user rejection explicitly to avoid generic error handling
        if (signError.message?.toLowerCase().includes('reject')) {
          throw new Error('User rejected signature request')
        }
        throw signError
      }

      console.log('[Auth] Signature obtained, verifying...')

      // 4. Verify & Login
      const verifyResult = await authAPI.verify(address, signature)
      console.log('[Auth] Verify result:', verifyResult)
      
      // Expected: verifyResult should be the data object containing token
      // If client.js unwrapped it, verifyResult = { token: "..." }
      const token = verifyResult?.token || verifyResult?.data?.token
      
      if (token) {
        localStorage.setItem('jwt_token', token)
        localStorage.setItem('auth_address', address) // Bind session to address
        setIsAuthenticated(true)
        message.success('Login Successful!')
      } else {
        throw new Error('Verification failed: No token received')
      }

    } catch (error) {
      console.error('[Auth] Login Error:', error)
      message.error(error.message || 'Login failed')
      
      // If it's a critical logic error (not user reject), we might want to clean up
      // but DO NOT disconnect wallet automatically.
    } finally {
      setIsLoggingIn(false)
    }
  }, [address, isConnected, chainId, isLoggingIn, signMessageAsync])

  const logout = useCallback(() => {
    localStorage.removeItem('jwt_token')
    localStorage.removeItem('auth_address')
    setIsAuthenticated(false)
    disconnect()
  }, [disconnect])

  // Check for address mismatch (Account Switching)
  useEffect(() => {
    if (isConnected && address && isAuthenticated) {
        const storedAddress = localStorage.getItem('auth_address')
        if (storedAddress && storedAddress.toLowerCase() !== address.toLowerCase()) {
            console.log('[Auth] Address changed (switch account), clearing session', { stored: storedAddress, current: address })
            // Do not call disconnect() here as we want to stay connected to the NEW account
            // Just clear the AUTH session
            localStorage.removeItem('jwt_token')
            localStorage.removeItem('auth_address')
            setIsAuthenticated(false)
            message.info('Account changed. Please sign in again.')
        }
    }
  }, [address, isConnected, isAuthenticated])

  return {
    isAuthenticated,
    isLoggingIn,
    login,
    logout
  }
}
