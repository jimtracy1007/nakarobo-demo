import { Layout as AntLayout, Menu, theme, Avatar } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { WalletButton } from '@/components/wallet/WalletButton'
import { useAppAuth } from '@/hooks/useAppAuth'

const { Header, Content, Sider } = AntLayout

// 菜单配置
const menuItems = [
  {
    type: 'group',
    label: 'PROJECTS', // Adjust label based on image
    key: 'g1',
    children: [
      {
        key: 'our-network',
        label: 'Our Network',
        children: [ // Recursive specific to match image visual if needed, but let's keep simple for now
          { key: '/', label: 'Overview' },
          { key: '/my-node', label: 'My Node' },
          { key: '/workbench', label: 'Workbench', disabled: true },
          { key: '/compute', label: 'Compute', disabled: true },
        ]
      }
    ],
  },
  {
    type: 'group',
    label: 'NAKAPT',
    key: 'g2',
    children: [
      { key: '/points', label: 'Overview' },
      { key: '/node-rewards', label: 'Node Rewards' },
      { key: '/yappers', label: 'Naka Yappers' },
      { key: '/quests', label: 'Quests' },
    ],
  },
]

// 简化版菜单结构，不嵌套 Our Network，直接展开以匹配扁平布局（如果 Group Label 足够）
// 根据截图：PROJECTS 是 header，Our Network 是一个 active item 还是 sub menu?
// 截图显示：
// PROJECTS
//   Our Network ^ (Expanded?)
//      Overview
//      My Node
//
// 考虑到 AntD Menu，这像是一个 SubMenu。
const items = [
  {
    type: 'group',
    label: 'PROJECTS',
    children: [
      {
        key: 'sub1',
        label: 'Our Network',
        icon: <span style={{ marginRight: 8 }}>❖</span>, // Mock Icon
        children: [
          { key: '/', label: 'Overview' },
          { key: '/my-node', label: 'My Node' },
          { key: '/workbench', label: 'Workbench', disabled: true },
          { key: '/compute', label: 'Compute', disabled: true },
        ]
      }
    ]
  },
  {
    type: 'group',
    label: 'NAKAPT',
    children: [
      { key: '/points', label: 'Overview', icon: <span style={{ marginRight: 8 }}>📍</span> },
      { key: '/node-rewards', label: 'Node Rewards', icon: <span style={{ marginRight: 8 }}>💲</span> },
      { key: '/yappers', label: 'Naka Yappers', icon: <span style={{ marginRight: 8 }}>📣</span> },
      { key: '/quests', label: 'Quests', icon: <span style={{ marginRight: 8 }}>📋</span> },
    ]
  }
]

export function Layout() {
  const navigate = useNavigate()
  const location = useLocation()

  // 触发自动认证流程
  const { login, isAuthenticated, isLoggingIn } = useAppAuth()
  

  // Ant Design Dark Mode 已经接管了大部分 token
  // 我们只需布局调整

  const handleMenuClick = ({ key }) => {
    navigate(key)
  }

  return (
    <AntLayout style={{ minHeight: '100vh', background: '#000' }}>
      <Sider
        width={260}
        style={{
          background: '#000',
          borderRight: '1px solid #333',
          padding: '24px 12px'
        }}
        theme="dark"
      >
        {/* LOGO */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 40, paddingLeft: 16 }}>
          <Avatar shape="square" size={32} style={{ background: '#fff', marginRight: 12 }} src="/logo.png" />
          <span style={{ fontSize: 18, fontWeight: 'bold', letterSpacing: 1, color: '#fff' }}>NAKAROBO</span>
        </div>

        <Menu
          mode="inline"
          defaultOpenKeys={['sub1']}
          selectedKeys={[location.pathname]}
          items={items}
          onClick={handleMenuClick}
          style={{ background: 'transparent', borderRight: 0 }}
          theme="dark"
        />
      </Sider>

      <AntLayout style={{ background: '#000' }}>
        <Header style={{
          padding: '0 40px',
          background: 'transparent',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          height: 80
        }}>
          <WalletButton
            onLogin={login}
            isAuthenticated={isAuthenticated}
            isLoggingIn={isLoggingIn}
          />
        </Header>

        <Content style={{ padding: '0 40px 40px' }}>
          {/* 移除白色卡片包裹，直接渲染 Outlet，让页面自己决定布局 */}
          <div style={{ maxWidth: 1400, margin: '0 auto', width: '100%' }}>
            <Outlet />
          </div>
        </Content>
      </AntLayout>
    </AntLayout>
  )
}

export default Layout
