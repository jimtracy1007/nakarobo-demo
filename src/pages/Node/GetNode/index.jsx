import { useState } from 'react'
import { Steps } from 'antd'
import { useNavigate } from 'react-router-dom'
import { SetupStep } from './SetupStep'
import { DepositStep } from './DepositStep'

export function GetNode() {
    const navigate = useNavigate()
    const [currentStep, setCurrentStep] = useState(0)
    const [setupData, setSetupData] = useState(null)

    const handleSetupComplete = (data) => {
        setSetupData(data)
        setCurrentStep(1)
    }

    const handleDepositComplete = () => {
        // 创建成功后跳转到 My Node 页面
        navigate('/my-node')
    }

    return (
        <div style={{ padding: '40px 0' }}>
            <div style={{ maxWidth: 600, margin: '0 auto 40px' }}>
                <Steps current={currentStep}>
                    <Steps.Step title="Setup Node" description="Identity & Avatar" />
                    <Steps.Step title="Initial Deposit" description="Activate Node" />
                </Steps>
            </div>

            {currentStep === 0 && (
                <SetupStep
                    onNext={handleSetupComplete}
                    initialData={setupData}
                />
            )}

            {currentStep === 1 && (
                <DepositStep
                    setupData={setupData}
                    onBack={() => setCurrentStep(0)}
                    onComplete={handleDepositComplete}
                />
            )}
        </div>
    )
}

export default GetNode
