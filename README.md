# Nakarobo Frontend

Nakarobo Network Platform 前端应用

## 技术栈

- **框架**: React 18 + Vite
- **语言**: JavaScript (JSX)
- **UI 库**: Ant Design 5.x
- **Web3 钱包**: Reown AppKit (原 WalletConnect AppKit)
  - `@reown/appkit` - AppKit 核心库
  - `@reown/appkit-adapter-wagmi` - Wagmi 适配器
  - `wagmi` + `viem` - 以太坊交互库
  - `@tanstack/react-query` - 数据请求管理
- **路由**: React Router v6
- **HTTP 客户端**: Axios

## 环境配置

1. 复制环境变量模板:
```bash
cp .env.development .env.local
```

2. 编辑 `.env.local`,填入必要配置:
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_REOWN_PROJECT_ID=your_project_id_here  # 从 https://dashboard.reown.com 获取
VITE_CHAIN_ID=1
VITE_AVATAR_BASE_URL=http://localhost:3000/avatars
```

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 项目结构

```
src/
├── api/                    # API 客户端
│   ├── client.js          # Axios 配置
│   └── index.js           # API 接口封装
├── components/            # 通用组件
│   ├── common/           # 基础组件
│   ├── wallet/           # 钱包相关
│   └── modals/           # 弹窗组件
├── contexts/              # Context 状态管理
│   └── AppKitProvider.jsx # Reown AppKit 配置
├── hooks/                 # 自定义 Hooks
├── pages/                 # 页面组件
│   ├── Network/          # 网络总览
│   ├── Node/             # 节点管理
│   ├── Points/           # 积分系统
│   ├── Yappers/          # Yappers 活动
│   ├── Quests/           # 任务签到
│   └── Layout.jsx        # 主布局
├── utils/                 # 工具函数
│   ├── format.js         # 格式化工具
│   ├── validation.js     # 验证工具
│   └── datetime.js       # 时间处理
├── contracts/             # 合约 ABI 和地址
└── App.jsx               # 根组件
```

## 核心功能

### M1: 全局基础能力
- ✅ Reown AppKit 钱包连接
- ✅ 网络切换与校验
- ✅ JWT 认证
- ✅ API 客户端封装

### M2: Naka Network
- ✅ 网络总览页面
- ✅ 网络统计展示
- ✅ 排行榜 (按存入/积分)

### M3-M11: 其他模块
- ⏳ My Node 页面
- ⏳ Get Node 流程
- ⏳ Points Overview
- ⏳ Node Rewards
- ⏳ Yappers 活动
- ⏳ Quests 任务
- ⏳ Referral 邀请

## 注意事项

1. **Reown Project ID**: 必须在 [Reown Dashboard](https://dashboard.reown.com) 创建项目获取 Project ID
2. **时区处理**: 所有日期相关功能使用 UTC+8 08:00 作为日切点
3. **精度处理**: 使用 `viem` 的 `parseUnits` 和 `formatUnits` 处理 Token 金额
4. **合约交互**: 使用 `wagmi` hooks 进行合约读写操作

## 开发指南

### 添加新页面

1. 在 `src/pages/` 创建页面组件
2. 在 `src/App.jsx` 添加路由
3. 在 `src/pages/Layout.jsx` 添加菜单项

### 添加新 API

1. 在 `src/api/index.js` 添加 API 函数
2. 使用 `apiClient` 发送请求
3. 错误处理由拦截器统一处理

### 合约交互示例

```jsx
import { useReadContract, useWriteContract } from 'wagmi'
import { parseUnits } from 'viem'

// 读取合约数据
const { data } = useReadContract({
  address: '0x...',
  abi: contractABI,
  functionName: 'balanceOf',
  args: [userAddress]
})

// 写入合约 (发送交易)
const { writeContract } = useWriteContract()
await writeContract({
  address: '0x...',
  abi: contractABI,
  functionName: 'transfer',
  args: [to, parseUnits(amount, 18)]
})
```

## License

MIT
