# NakaRobo 前端页面 API 与合约交互清单

本文档基于 UI 设计图与业务逻辑，整理了前端各页面功能点所需的后端 API 及智能合约交互接口，供开发自测与联调使用。

---

## 1. 首页 / 网络概览 (Network Overview)
**对应设计**: `design/overview.png`  
**页面路径**: `src/pages/Network/Overview.jsx`

| 功能区域 | 操作/显示 | 对应 API / 合约 | 请求方法 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| **Top Stats** | 显示 Total Nodes, TVL | `/api/stats/network` | `GET` | 页面加载时请求全网统计数据 |
| **Leaderboard** | 排名列表 (Rank, User, Node Name) | `/api/leaderboard/network` | `GET` | 展示网络排行榜 |
| **Get My Node** | 点击按钮 | (路由跳转) | - | 跳转至 `/get-node` |

---

## 0. 全局 Auth & Config

| 功能区域 | 操作/显示 | 对应 API / 合约 | 请求方法 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | SIWE 获取 nonce | `/api/auth/nonce` | `POST` | 前端发起 SIWE 登录 |
| **Auth** | SIWE 验证签名并换 JWT | `/api/auth/verify` | `POST` | 登录成功返回 `token` |
| **Config** | 获取链配置 | `/api/config/chain` | `GET` | 传 `chainId` 或 `list` |

---

## 2. 我的节点 (My Node)
**对应设计**: `design/mynode.png`  
**页面路径**: `src/pages/Node/MyNode.jsx`

| 功能区域 | 操作/显示 | 对应 API / 合约 | 请求方法 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| **Node Info** | 节点名称、ID、创建时间 | `/api/node/me` | `GET` | 需先登录 (SIWE) |
| **Avatar** | 节点头像 | `/api/node/me` | `GET` | 返回数据中包含 `avatarUrl` |
| **Assets** | 资产摘要 (Minted Base Rewards/Current Bonus/Redeemable) | `/api/node/me/asset-summary` | `GET` | 前端已调用 |
| **Assets** | **Redeemable Balance** (可赎回余额) | `Contract.redeemableAmount(user)` | **Read** | 优先读取链上数据 |
| **Assets** | **Bonus Info** (当前倍数/下一级) | `Contract.getBonusMultiplier(user)` | **Read** | 读取链上状态计算 |
| **Action** | **Deposit** (充值) | 1. `Token.approve` <br> 2. `Node.deposit` | **Write** | 弹窗交互，拉起钱包签名 |
| **Action** | **Redeem** (赎回) | `Node.redeem` | **Write** | 弹窗交互，拉起钱包签名 |
| **Action** | **History** (资金记录) | `/api/funds/records` | `GET` | 打开 Modal 展示充提历史 |
| **Robots** | 实体机器人列表 | (暂不实现) | - | 当前版本显示 "Coming Soon" |

---

## 3. 创建节点 (Get Node Flow)
**对应设计**: `design/mynode_no_node.png` (部分)  
**页面路径**: `src/pages/Node/GetNode/`

| 功能区域 | 操作/显示 | 对应 API / 合约 | 请求方法 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| **Setup** | **随机头像** (初始化) | `/api/node/avatar/random` | `GET` | 进入 Setup 步骤时自动获取 |
| **Setup** | **刷新头像** | `/api/node/avatar/refresh` | `POST` | 每日有限制次数 |
| **Setup** | **校验名称** | `Contract.isNameUsed(name)` | **Read** | 输入名称时或提交前校验（前端当前仅本地校验，缺后端/链上确认） |
| **Payment** | **Mint & Deposit** | `Node.mintNodeWithDeposit` | **Write** | 需先 Approve USDT |

---

## 4. 社交互动 (Naka Yappers)
**对应设计**: `design/nakapt_naka_yappers.png`  
**页面路径**: `src/pages/Yappers/index.jsx`

| 功能区域 | 操作/显示 | 对应 API / 合约 | 请求方法 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| **Connect** | **Connect Twitter** | `/api/yappers/connect` | `GET` | Params: `redirectUri`. Returns `{ url, codeVerifier }` |
| **Connect** | **Callback** | `/api/yappers/callback` | `GET` | Params: `code`, `codeVerifier`, `redirectUri` |
| **Status** | **Status Check** | `/api/yappers/status` | `GET` | Check binding status `{ isBound, ... }` |
| **Stats** | 个人积分 / 排名 | `/api/yappers/scores` | `GET` | `{ cumulativeTotal, daily: [] }` |
| **Referral** | 我的邀请码 | `/api/referral/me` | `GET` | 展示邀请链接 |
| **Ranking** | Yappers Leaderboard | `/api/yappers/leaderboard` | `GET` | Returns list of users |
| **Post** | **AI Drafts** | `/api/yappers/ai/drafts` | `POST` | No params required (Auto-generated) |
| **Referral 状态** | 当前前端占位未接入 | `/api/referral/me` | `GET` | TODO：接入真实接口 |

---

## 5. 积分与奖励 (Node Rewards)
**对应设计**: `design/nakapt_node_rewards.png`  
**页面路径**: `src/pages/Node/Rewards.jsx`

| 功能区域 | 操作/显示 | 对应 API / 合约 | 请求方法 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| **Rewards** | **Pending Rewards** (待领取) | `Contract.getPendingPoints(user)` | **Read** | 读取链上待释放积分 |
| **Rewards** | **Claim** (领取) | `Contract.claimRewards` | **Write** | 拉起钱包领取积分到余额 |
| **Staking** | **Stake** (质押) | `Staking.stake` | **Write** | 质押 NAKAPT 提升权重 |
| **Staking** | **Unstake** (解押) | `Staking.unstake` | **Write** | 解除质押 (可能有锁定期) |

---

## 6. 任务中心 (Quests)
**对应设计**: `design/nakapt_quests.png`  
**页面路径**: `src/pages/Quests/index.jsx`

| 功能区域 | 操作/显示 | 对应 API / 合约 | 请求方法 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| **Summary** | 签到状态 / Streak / 任务列表 | `/api/quests` | `GET` | 页面初始化数据 |
| **Check-in** | **Daily Check-in** (签到) | `/api/quests/check-in` | `POST` | 执行每日签到 (后端记账) |
| **Claim** | **Claim Rewards** (领奖) | 1. `/api/quests/claim-proof` (Get Proof)<br>2. `Contract.claimActivityRewards` | **GET**<br>**Write** | 获取 Merkle Proof 并上链领取（前端待接入 claim-proof & 合约调用） |

---

## 7. 积分概览 (NAKAPT Overview)
**对应设计**: `design/nakapt_overview.png`
**页面路径**: `src/pages/Points/Overview.jsx`

| 功能区域 | 操作/显示 | 对应 API / 合约 | 请求方法 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| **My Points** | 总分/质押/可用/待领 | `/api/points/me` | `GET` | 聚合积分数据 (UserDailyStat + Stakes + Rewards) |
| **Points Summary** | 全局积分摘要 | `/api/points/summary` | `GET` | 前端接口已定义，需对齐需求 |
| **Leaderboard** | 积分排行榜 | `/api/leaderboard/points` | `GET` | 按 Total Points 倒序 |
| **Action** | **Stake** (质押) | `Contract.stake` (via Modal) | **Write** | 复用 StakeModal 组件 |
| **Action** | **Withdraw** (提现) | `Contract.unstake` / `withdraw` | **Write** | 需补充提现功能 |

---

### 📝 开发自测重点
1.  **Auth**: 确保 `POST /api/auth/verify` 成功返回 JWT Token。
2.  **API**: 重点测试 `/api/checkin/execute` 是否连通，以及 `/api/node/avatar/refresh` 功能。
3.  **Contract**: 确保前端正确调用了 wagmi/viem 的 `readContract` 和 `writeContract`，参数传递无误。
