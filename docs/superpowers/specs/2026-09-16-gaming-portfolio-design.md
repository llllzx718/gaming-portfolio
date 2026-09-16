# 个人电竞战绩作品集网站 — 设计文档（Spec）

> 日期：2026-09-16
> 状态：待评审
> 项目目录：`gaming-portfolio/`（待创建，位于 `F:\CODE\GIT\主页设计\` 下）

---

## 1. 目标

一个单页、静态部署的个人电竞战绩展示站。以**历史战绩 / 数据统计**为核心，手动维护数据，不对接任何平台 API。视觉上做到**高级、克制、富有科技感与电竞感**：深邃暗色底 + 冷色调点缀。

- 首批游戏：**三角洲行动**、**无畏契约**、**王者荣耀**（后续可扩展）
- 数据来源：手动维护 JSON
- 结构：单页 + Tab 切换

## 2. 技术栈（已锁定）

| 项 | 选型 |
|---|---|
| 框架 | React 18 + Vite（`npm run build` 产出纯静态文件） |
| 样式 | Tailwind CSS |
| 动画 | Framer Motion |
| 图标 | lucide-react |
| 背景 | DriftWall（用户提供，DOM + CSS 3D） |
| 弹性卡 | ElasticMesh（用户提供，OGL WebGL），需重构为共享上下文 |
| 部署 | 任意静态托管（GitHub Pages / Vercel / Netlify） |

## 3. 页面结构（单页 + Tab）

```
┌──────────────────────────────────────────────┐
│  标题 / 副标题        [三角洲] [无畏契约] [王者] │  ← GameTabs（framer-motion 指示器）
│                                              │
│   ┌───────────────┐                          │
│   │  ElasticMesh  │  ← HeroCard：当前游戏封面   │
│   │  （主视觉卡）   │    悬停/拖动弹性鼓起         │
│   └───────────────┘                          │
│   ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐                  │
│   │段位│ │胜率│ │KDA│ │ACS│ │爆头│ ← KPI 弹性卡行 │
│   └──┘ └──┘ └──┘ └──┘ └──┘   （每张 ElasticMesh）│
│   ┌──────────────────────────────────┐       │
│   │ 毛玻璃 对局记录列表                  │       │
│   │ 日期 地图 英雄 比分  KDA  ACS  结果  │       │
│   └──────────────────────────────────┘       │
└──────────────────────────────────────────────┘
   ↑ 背景 DriftWall 全屏漂移「我的高光截图」，3D 视差
```

分层（z-index 由低到高）：
1. `DriftWall` — 固定全屏背景，我的高光截图，3D 视差漂移
2. `ElasticField` — 共享 WebGL 上下文的全屏透明 canvas，渲染 HeroCard + 所有 KPI 弹性卡表面
3. 内容层（DOM）— Tab、卡片上的文字、对局列表、毛玻璃面板

## 4. 组件设计

### 4.1 DriftWall（背景）— 原样使用，调参
- 纯 DOM/CSS 3D，非 WebGL，与 ElasticMesh 共存无冲突。
- `items` 数据源 = 当前选中游戏的 `highlights` 数组（或全游戏混合）。
- 调参方向（克制）：`columns 5~6`、`speed 30~45`、`parallax 0.5~0.7`、`tilt/turn` 取较小值（4~8°）、`dim 0.55~0.65`、`overlayColor #060010` 保持暗底，保证上层文字可读。
- 保留其自带 CSS 文件（CSS 变量 + JS 驱动 transform，不适合强行 Tailwind 化）。

### 4.2 ElasticMesh → 重构为 ElasticField（共享上下文）
**问题**：原组件每实例 `new Renderer()` = 每张卡一个 WebGL 上下文。若 Hero + 5 张 KPI = 6 个上下文，接近移动端上限、且浪费。

**方案**：引入 `ElasticField`，**一张全屏透明 canvas + 一个 WebGL 上下文**渲染所有弹性卡表面（多个 mesh）。每个 mesh 独立跑弹簧物理（原 `substep/commit` 逻辑按 mesh 复用），共享一个 rAF 循环与共享指针。
- 每张卡的**文字**（KPI 标签/数值、Hero 文案）用 HTML 绝对定位叠在 canvas 之上，位置与卡片矩形对齐。
- 指针命中：判断指针落在哪张卡，只向该卡注入局部坐标；其余卡回弹。
- **兜底**：若文字对齐在变形后不稳定，回退为「每卡一个小 canvas + 低分辨率网格」（桌面端可接受）。此为降级方案，非首选。

### 4.3 HeroCard
ElasticField 中的主 mesh，纹理 = 当前游戏 `cover`，含圆角 + 网格叠加 + 高光；HTML 层叠游戏名 + tagline。`interaction: 'hover'`（悬停鼓起）。

### 4.4 KpiCard / KpiGrid
每个 KPI 一张弹性卡（渐变或主题色表面，`showGrid` 可开），HTML 层叠 `label` + `value` + 可选 `delta`（涨跌小箭头）。悬停鼓起。布局为一排自适应网格（Tailwind grid）。

### 4.5 MatchList / MatchRow
毛玻璃面板（`backdrop-blur`）。行 = 通用列渲染，列由该游戏 `matchColumns` 声明。悬停高亮 + 点击展开详情（framer-motion `AnimatePresence` 折叠）。结果（胜/负）用克制配色标识。

### 4.6 GameTabs
顶部 Tab，framer-motion `layoutId` 做活动指示器滑动。切换时：背景 `highlights` 重 seed、ElasticField 主题色/封面更新、KPI 与对局列表淡入淡出（`AnimatePresence` mode="wait"）。

## 5. 数据模型（`src/data/games.json`）

手动维护。每个游戏自描述 KPI 与对局列，做到**通用可扩展**（新增游戏 = 新增一条数据 + 图片，不改代码）。

```jsonc
{
  "site": {
    "title": "我的电竞战绩",
    "subtitle": "Delta Force · Valorant · 王者荣耀",
    "accent": "#22d3ee"
  },
  "games": [
    {
      "id": "valorant",
      "name": "无畏契约",
      "tagline": "FPS · 战术射击",
      "accent": "#ff4655",              // 仅作小标识/描边，不破坏冷色调
      "icon": "crosshair",              // lucide-react 图标名
      "cover": "/images/valorant/cover.jpg",   // HeroCard 主视觉
      "highlights": ["/images/valorant/1.jpg", "/images/valorant/2.jpg"], // 背景瓦片
      "kpis": [
        { "label": "段位", "value": "钻石 1", "icon": "trophy", "delta": "+2" },
        { "label": "胜率", "value": "54.2%", "icon": "percent", "delta": "+1.8%" },
        { "label": "KDA", "value": "1.42", "icon": "target" },
        { "label": "ACS", "value": "238", "icon": "zap" },
        { "label": "爆头率", "value": "27%", "icon": "crosshair" }
      ],
      "matchColumns": [
        { "key": "date",  "label": "日期" },
        { "key": "map",   "label": "地图" },
        { "key": "agent", "label": "英雄" },
        { "key": "score", "label": "比分" },
        { "key": "kd",    "label": "K/D/A" },
        { "key": "acs",   "label": "ACS" },
        { "key": "result","label": "结果" }
      ],
      "matches": [
        { "date": "2026-09-15", "map": "源工重镇", "agent": "捷风", "score": "13-9", "kd": "21/14/8", "acs": "312", "result": "win" }
      ]
    }
  ]
}
```

各游戏默认 KPI / 对局字段（可在数据里改）：

| 游戏 | KPI | 对局列 |
|---|---|---|
| 三角洲行动 | 段位 · 胜率 · K/D · 场均伤害 · 撤离成功率 | 日期 · 模式 · 地图 · 结果 · K/D/A · 伤害 |
| 无畏契约 | 段位/RR · 胜率 · KDA · ACS · 爆头率 | 日期 · 地图 · 英雄 · 比分 · K/D/A · ACS · 结果 |
| 王者荣耀 | 段位 · 巅峰分 · 胜率 · KDA · 场次 | 日期 · 英雄 · 位置 · K/D/A · 段位变化 · 结果 |

`result` 取值：`win` / `loss` / `draw`。

## 6. 视觉 token（暗色 · 冷调 · 克制）

| 层级 | 值 |
|---|---|
| 底色 | `#05060f` → `#0a0c1a`（深邃蓝黑） |
| 主点缀 | 电光青 `#22d3ee` / `#38bdf8` |
| 次点缀 | 冰蓝 → 靛紫 `#6366f1` 渐变 |
| 玻璃面板 | `rgba(10,14,26,.55)` + `backdrop-blur` |
| 文字 | 冷白 `#e2e8f0`；次级 `#64748b`（slate） |
| 胜负 | 胜 = teal/cyan；负 = 冷调红（低饱和）；克制不刺眼 |
| 圆角 / 间距 | 统一圆角（12~16px）、宽松留白，体现「高级」 |

Tailwind 落地：以 `slate` 为基底、`cyan`/`indigo` 为点缀；暗色自定义色写入 `tailwind.config.js`。DriftWall / ElasticMesh 保留各自 scoped CSS。

## 7. 交互清单（全部满足）

| 交互 | 实现 |
|---|---|
| 背景 3D 视差 | DriftWall `parallax` 跟随鼠标 |
| 悬停瓦片暂停 + 抬起 | DriftWall `lift` + 列暂停 |
| 内容卡片交互 | 对局行悬停高亮、点击展开详情 |
| Tab 切换动画 | framer-motion `layoutId` 指示器 + 内容过渡 |
| ElasticMesh 弹性 | Hero/KPI 卡悬停（或拖动）鼓起 |
| 无障碍 | 尊重 `prefers-reduced-motion`（两组件已内置），关闭自动漂移/变形 |

## 8. 性能要点

- **单一 WebGL 上下文**（ElasticField 共享），避免多上下文开销。
- DriftWall（DOM 3D）+ 共享 WebGL + `backdrop-blur` 是主要开销；毛玻璃面板数量克制，必要时降低 blur 半径或加 `will-change`。
- 图片统一转 webp、按用途压缩：瓦片约 600×400，封面约 1200×800。
- 所有动画走 `requestAnimationFrame` + `transform/opacity`，避免触发 layout。

## 9. 目录结构

```
gaming-portfolio/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── public/images/{delta,valorant,hok}/   # 用户照片放这里
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── data/games.json
    ├── components/
    │   ├── DriftWall.jsx / DriftWall.css
    │   ├── elastic/ElasticMesh.jsx        # 原版（保留，供单卡使用）
    │   ├── elastic/ElasticField.jsx       # 重构：共享上下文渲染多卡
    │   ├── HeroCard.jsx
    │   ├── KpiGrid.jsx
    │   ├── MatchList.jsx / MatchRow.jsx
    │   ├── GameTabs.jsx
    │   └── GlassPanel.jsx
    └── hooks/
        ├── useGameData.js
        └── useReducedMotion.js
```

## 10. 待用户提供

- **高光截图 / 封面图**：放入 `public/images/`（可先占位图，后续替换）。
- 各游戏**真实战绩数据**：填入 `games.json`（先给示例数据）。

## 11. 范围外（YAGNI，暂不做）

- 平台 API 自动导入战绩
- 趋势折线图 / 分类统计图表（用户本轮未勾选）
- 登录 / 后台编辑器
- 多语言

---

*下一步：本 spec 评审通过后，进入实现计划（writing-plans）。*
