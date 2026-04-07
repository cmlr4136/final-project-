# 项目计划（中文）

## 1) 目标与背景
- 构建一个“体能与训练管理系统”，支持训练计划制定、训练记录、进度查看。
- 技术约束：后端使用 Kotlin；数据库使用 H2（便于演示与开发）；前端仅初始化 React + Vite 工程（不承诺完整 UI 实现）。

## 2) 范围定义（基础版 vs 进阶版）

### 基础版（MVP）
- 账户与身份：注册/登录、退出、基础资料。
- 训练内容：动作库（查看/搜索）、动作详情。
- 计划：创建训练计划、计划包含动作与组次目标。
- 记录：开始一次训练、按动作记录组数/次数/重量/时长。
- 进度：按时间查看训练历史与简单统计（次数、总训练量）。

### 进阶版（可选，不纳入本期交付）
- 智能推荐：基于历史自动调整训练量与计划。
- 设备集成：穿戴设备/心率/步数导入。
- 教练协作：教练创建/下发计划、学员反馈。
- 训练群组：仅管理者创建；用户加入/退出群组，群内文字讨论（最简版）。
- 更深度分析：PR 曲线、疲劳管理、周期化报表。

## 3) 关键实体与功能映射
- 用户：注册信息、身高体重（可选）、偏好。
- 动作：名称、肌群、器械、说明。
- 训练计划：名称、目标、计划条目。
- 计划条目：动作、目标组数/次数/重量/时间。
- 训练：日期、关联计划（可选）、备注。
- 训练组：次数、重量、用时、RPE（可选）。

## 4) 里程碑
| 阶段 | 时间 | 交付物 |
|---|---|---|
| M0 定义 | 0.5 周 | 需求确认、数据模型草案、API 清单 |
| M1 前端初始化 | 0.5 周 | React+Vite 初始化、路由骨架、接口调用封装（可空实现） |
| M2 后端基础 | 1 周 | Kotlin 服务骨架、H2 表结构、核心 CRUD（动作/计划） |
| M3 MVP 闭环 | 1 周 | 登录→查看动作→建计划→记录训练→查看历史（最小 UI 或 API 验证） |
| M4 稳定化 | 0.5 周 | 校验、错误处理、最小测试、文档更新 |

## 5) 假设与风险
- H2 适合开发/演示；若要生产可迁移至 Postgres。
- “前端仅初始化”意味着交付重点在 API 与数据正确性。
- 数据一致性：尽量用应用层逻辑约束而非强外键。

# Project Plan (English)

## 1) Goal & Context
- Build a Physical Fitness & Training system that supports training plan creation, workout logging, and progress review.
- Technical constraints: Kotlin backend; H2 database for development/demo; frontend is React + Vite initialization only (no full UI delivery assumed).

## 2) Scope (Basic vs Advanced)

### Basic (MVP)
- Authentication: sign up/in/out, basic profile.
- Exercise library: browse/search exercises and view details.
- Plans: create training plans containing exercises and targets.
- Logging: start a session and record sets (reps/weight/time).
- Progress: view history and simple aggregates (counts, total volume).

### Advanced (Optional, out of current delivery)
- Recommendations: automatically adjust plans based on history.
- Wearables: import heart rate/steps from fitness devices.
- Coach collaboration: coaches assign plans and review client feedback.
- Training groups: admin-only creation; users join/leave and text discussion (minimal version).
- Deeper analytics: PR trends, fatigue management, periodization reports.

## 3) Key Entities & Feature Mapping
- User: account info, optional body metrics, preferences.
- Exercise: name, muscle group, equipment, notes.
- TrainingPlan: name, goal, plan items.
- PlanItem: exercise plus target sets/reps/weight/duration.
- WorkoutSession: date/time, optional plan link, notes.
- SetEntry: reps, weight, duration, optional RPE.

## 4) Milestones
| Phase | Timebox | Deliverables |
|---|---|---|
| M0 Definition | 0.5 week | Requirements confirmation, draft data model, API list |
| M1 Frontend Init | 0.5 week | React+Vite scaffold, route skeleton, API wrapper stubs |
| M2 Backend Core | 1 week | Kotlin service skeleton, H2 schema, core CRUD (exercises/plans) |
| M3 MVP End-to-End | 1 week | Sign in → browse exercises → create plan → log workout → view history (minimal UI or API-verified) |
| M4 Stabilization | 0.5 week | Validation, error handling, minimal tests, docs updates |

## 5) Assumptions & Risks
- H2 is ideal for development/demo; production would likely move to Postgres.
- “Frontend init only” means delivery focuses on API and data correctness.
- Data consistency is primarily enforced in application logic rather than strong DB foreign keys.
