import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppKitProvider } from './contexts/AppKitProvider'
import { ConfigProvider, theme, App as AntdApp } from 'antd'
import Layout from './pages/Layout'
import NetworkOverview from './pages/Network/Overview'
import MyNode from './pages/Node/MyNode'
import GetNode from './pages/Node/GetNode'
import './index.css'

import PointsOverview from './pages/Points/Overview'
import Yappers from './pages/Yappers'
import Quests from './pages/Quests'
import NodeRewards from './pages/Node/Rewards'


function App() {
  return (
    <AppKitProvider>
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: '#f7931a', // 品牌橙色
            borderRadius: 8,
            colorBgBase: '#000000', // 基础背景黑
            colorBgContainer: '#141414', // 容器背景深灰
          },
          components: {
            Menu: {
              itemBg: 'transparent',
              groupTitleColor: '#666', // 分组标题颜色
            },
            Layout: {
              bodyBg: '#000',
              headerBg: '#000',
              siderBg: '#000',
            }
          }
        }}
      >
        <AntdApp>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<NetworkOverview />} />
                <Route path="my-node" element={<MyNode />} />
                <Route path="get-node" element={<GetNode />} />
                <Route path="points" element={<PointsOverview />} />
                <Route path="node-rewards" element={<NodeRewards />} />
                <Route path="yappers" element={<Yappers />} />
                <Route path="quests" element={<Quests />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AntdApp>
      </ConfigProvider>
    </AppKitProvider>
  )
}

export default App
