# 页面设计说明（中文，Desktop-first）

## 全局样式
- 布局：Desktop 优先，12 列栅格 + Flex 混合；内容最大宽度 1200px，左右留白自适应。
- 间距：8px 基准（8/16/24/32）。
- 颜色：背景 #0B1020；卡片 #111A33；主色 #4F7DFF；强调 #22C55E；危险 #EF4444；文字 #E5E7EB。
- 字体：标题 24/20/18；正文 14/16；等宽用于数值（重量/次数）。
- 组件：按钮 Primary/Secondary/Destructive；输入框带校验态；表格/列表支持 hover。

## 页面：登录注册
- 元信息：Title「登录」；Description「登录以管理训练计划与记录」。
- 结构：居中卡片（420px）；上方 Logo+产品名；下方表单。
- 区块：登录/注册切换；邮箱/密码/（注册时）昵称输入；提交按钮；错误提示行内显示；去注册/去登录链接；退出后回到此页。

## 页面：仪表盘
- 元信息：Title「仪表盘」；Description「快速开始训练与查看进度」。
- 布局：顶部导航 + 主内容两列（左主右侧栏）；窄屏时上下堆叠。
- 区块：顶部导航（动作库/计划/开始训练、用户菜单）；快速开始卡片（开始训练按钮、可选计划选择）；最近训练列表（最近 5 次：日期/时长/总组数）；统计行（本周训练次数、总训练量估算、总时长）。

## 页面：动作库
- 元信息：Title「动作库」；Description「浏览与搜索动作」。
- 布局：左侧筛选栏（肌群/器械）+ 右侧卡片网格（3 列）。
- 区块：搜索栏（关键字+清空）；筛选面板（肌群/器械下拉、应用/重置）；动作卡片（名称、肌群、器械标签）；详情抽屉/弹窗（说明、注意事项、关闭）。

## 页面：训练计划
- 元信息：Title「训练计划」；Description「创建与管理计划」。
- 布局：左侧计划列表；右侧计划编辑区（表格）。
- 区块：计划列表（计划名、更新时间、新建、删除确认）；计划编辑（名称/目标、条目表格：动作+目标组数/次数/重量/时长、从动作库选择新增）；保存条（保存/取消、未保存提示）。

## 页面：训练记录
- 元信息：Title「训练记录」；Description「记录本次训练」。
- 布局：顶部固定操作条 + 内容按动作分组的折叠卡片列表。
- 区块：训练头部（开始时间、关联计划只读/可选、备注）；动作区块（每个动作一个卡片，组次表格：组序号/次数/重量/用时，新增一组、行内删除）；提交区（保存并结束、loading、失败 toast 可重试）。

---

# Page Design Spec (English, Desktop-first)

## Global Styles
- Layout: desktop-first, 12-column grid + Flex hybrid; content max width 1200px with responsive gutters.
- Spacing: 8px scale (8/16/24/32).
- Colors: background #0B1020; card #111A33; primary #4F7DFF; success #22C55E; danger #EF4444; text #E5E7EB.
- Typography: headings 24/20/18; body 14/16; monospaced numerals for metrics (weight/reps).
- Components: primary/secondary/destructive buttons; inputs with validation states; tables/lists with hover.

## Page: Auth
- Meta: Title “Sign In”; Description “Sign in to manage training plans and workout logs”.
- Structure: centered card (420px) with logo/product name on top and form below.
- Sections: sign-in/sign-up toggle; email/password/(sign-up) display name; submit button; inline errors; links to switch modes; after logout return here.

## Page: Dashboard
- Meta: Title “Dashboard”; Description “Quick start and progress overview”.
- Layout: top navigation + two-column main content (left primary, right sidebar); stack vertically on narrow screens.
- Sections: top nav (Exercises/Plans/Start Workout + user menu); quick start card (start button + optional plan selector); recent sessions list (latest 5 with date/duration/total sets); stats row (weekly count, estimated total volume, total duration).

## Page: Exercise Library
- Meta: Title “Exercises”; Description “Browse and search exercises”.
- Layout: left filter sidebar (muscle group/equipment) + right 3-column card grid.
- Sections: search bar (query + clear); filter panel (dropdowns + apply/reset); exercise cards (name, muscle group, equipment tags); detail drawer/modal (instructions, notes, close).

## Page: Plans
- Meta: Title “Plans”; Description “Create and manage plans”.
- Layout: master-detail with plan list on the left and editor on the right (table-based).
- Sections: plan list (name, updated time, create, delete with confirmation); plan editor (name/goal, items table: exercise + target sets/reps/weight/duration, add item via exercise picker); save bar (save/cancel, unsaved warning).

## Page: Workout Session
- Meta: Title “Workout”; Description “Log this workout session”.
- Layout: sticky top action bar + collapsible exercise blocks.
- Sections: session header (start time, optional plan, notes); exercise blocks (per-exercise set table: index/reps/weight/duration, add set, inline delete); submit footer (save & end, loading state, failure toast with retry).
