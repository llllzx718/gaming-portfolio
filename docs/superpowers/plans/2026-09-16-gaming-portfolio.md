# 个人电竞战绩作品集网站 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个单页、静态部署的个人电竞战绩作品集网站：DriftWall 动态背景 + ElasticMesh 弹性卡片 + 毛玻璃对局列表，数据手动维护。

**Architecture:** React 18 + Vite 静态构建；Tailwind CSS v4（CSS-first 配置）+ Framer Motion + lucide-react；两个 WebGL/DOM 组件（DriftWall 背景、ElasticMesh 弹性卡）其中 ElasticMesh 重构为共享 WebGL 上下文的 ElasticField 以支持多张弹性卡；数据集中在 `src/data/games.json`，各游戏自描述 KPI 与对局列。

**Tech Stack:** React 18, Vite, Tailwind CSS v4, Framer Motion, lucide-react, ogl, Vitest + Testing Library。

**Spec:** `docs/superpowers/specs/2026-09-16-gaming-portfolio-design.md`（本计划从 spec 展开，执行者需同时读 spec）

## Global Constraints

- 项目目录：`gaming-portfolio/`，位于 `F:\CODE\GIT\主页设计\` 下；git 仓库根在 `F:\CODE\GIT\主页设计\`。
- Node 版本要求：>= 18。
- 视觉基调：暗色蓝黑底（`#05060f`→`#0a0c1a`），冷色点缀（电光青 `#22d3ee`、靛紫 `#6366f1`），克制、高级、电竞科技感。
- 颜色 token 通过 Tailwind v4 `@theme` 定义（无 tailwind.config.js / postcss.config.js）。
- 命名：游戏 id 分别为 `delta-force`、`valorant`、`hok`；`result` 取值 `win`/`loss`/`draw`。
- 所有数据只读，来自 `src/data/games.json`，运行时不对接任何 API。
- 尊重 `prefers-reduced-motion`（DriftWall / ElasticMesh 已内置）。
- 部署：`vite.config.js` 设 `base: './'`，产出纯静态文件。
- 图片：先使用 `https://picsum.photos/...` 占位，后续替换为 `public/images/{game}/` 本地图。

---

### Task 1: 脚手架 + 工具链 + 主题 token

**Files:**
- Create: `.gitignore`（仓库根 `F:\CODE\GIT\主页设计\`）
- Create: `gaming-portfolio/vite.config.js`
- Create: `gaming-portfolio/src/index.css`
- Create: `gaming-portfolio/src/test/setup.js`
- Modify: `gaming-portfolio/src/main.jsx`（Vite 模板生成后微调）

**Interfaces:**
- Produces: 可运行的 dev 服务器；Tailwind token `bg-ink-950`、`text-accent` 等；测试环境（vitest + jsdom + jest-dom）。

- [ ] **Step 1: 初始化仓库与脚手架**

```bash
cd "F:/CODE/GIT/主页设计"
git init
mkdir gaming-portfolio && cd gaming-portfolio
npm create vite@latest . -- --template react
npm install
npm install tailwindcss @tailwindcss/vite framer-motion lucide-react ogl
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 2: 写仓库根 `.gitignore`**

`F:\CODE\GIT\主页设计\.gitignore`：

```gitignore
node_modules/
dist/
.DS_Store
*.local
916test/
```

- [ ] **Step 3: 写 `vite.config.js`（覆盖模板）**

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    css: false,
  },
});
```

- [ ] **Step 4: 写 `src/index.css`（主题 token + 基础样式）**

```css
@import "tailwindcss";

@theme {
  --color-ink-950: #05060f;
  --color-ink-900: #0a0c1a;
  --color-ink-800: #10142a;
  --color-accent: #22d3ee;
  --color-accent-soft: #38bdf8;
  --color-accent-2: #6366f1;
  --color-frost: rgba(10, 14, 26, 0.55);
}

html,
body,
#root {
  height: 100%;
}

body {
  margin: 0;
  background: #05060f;
  color: #e2e8f0;
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  -webkit-font-smoothing: antialiased;
}

.elastic-field canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}
```

- [ ] **Step 5: 写 `src/test/setup.js`**

```js
import '@testing-library/jest-dom';
```

- [ ] **Step 6: 精简 `src/main.jsx` 与 `src/App.jsx`**

`src/main.jsx`：

```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

`src/App.jsx`（临时占位，后续任务会替换）：

```jsx
export default function App() {
  return <div className="min-h-screen bg-ink-950 text-slate-100" />;
}
```

删除模板残留：`src/App.css`、`src/assets/`、`public/vite.svg`（如存在）。

- [ ] **Step 7: 验证**

```bash
npm run dev
```

Expected：浏览器打开一个纯深色页面（无报错，无默认 Vite 页）。`Ctrl+C` 退出。

- [ ] **Step 8: 提交**

```bash
cd "F:/CODE/GIT/主页设计"
git add .gitignore gaming-portfolio
git commit -m "chore: scaffold vite + react + tailwind + vitest"
```

---

### Task 2: 数据层 + 工具函数

**Files:**
- Create: `gaming-portfolio/src/data/games.json`
- Create: `gaming-portfolio/src/lib/games.js`
- Create: `gaming-portfolio/src/lib/icons.js`
- Create: `gaming-portfolio/src/lib/result.js`
- Test: `gaming-portfolio/src/lib/games.test.js`

**Interfaces:**
- Produces:
  - `getSite()` → `{ title, subtitle, accent }`
  - `getGames()` → `Game[]`
  - `getGameById(id)` → `Game | undefined`
  - `getDefaultGame()` → `Game`
  - `getIcon(name)` → lucide 组件（未知名回退 `Target`）
  - `getResultMeta(result)` → `{ label, tone }`（tone ∈ `win`|`loss`|`draw`）

- [ ] **Step 1: 写 `src/data/games.json`**

```json
{
  "site": {
    "title": "我的电竞战绩",
    "subtitle": "Delta Force · Valorant · 王者荣耀",
    "accent": "#22d3ee"
  },
  "games": [
    {
      "id": "delta-force",
      "name": "三角洲行动",
      "tagline": "战术射击 · 撤离",
      "accent": "#38bdf8",
      "icon": "target",
      "cover": "https://picsum.photos/seed/delta-cover/1200/800",
      "highlights": [
        "https://picsum.photos/seed/delta-1/600/400",
        "https://picsum.photos/seed/delta-2/600/400",
        "https://picsum.photos/seed/delta-3/600/400",
        "https://picsum.photos/seed/delta-4/600/400",
        "https://picsum.photos/seed/delta-5/600/400",
        "https://picsum.photos/seed/delta-6/600/400"
      ],
      "kpis": [
        { "label": "段位", "value": "将军", "icon": "crown" },
        { "label": "胜率", "value": "58.3%", "icon": "percent", "delta": "+2.1%" },
        { "label": "K/D", "value": "1.86", "icon": "target" },
        { "label": "场均伤害", "value": "6120", "icon": "zap" },
        { "label": "撤离成功率", "value": "71%", "icon": "shield" }
      ],
      "matchColumns": [
        { "key": "date", "label": "日期" },
        { "key": "mode", "label": "模式" },
        { "key": "map", "label": "地图" },
        { "key": "kd", "label": "K/D/A" },
        { "key": "dmg", "label": "伤害" },
        { "key": "result", "label": "结果" }
      ],
      "matches": [
        { "date": "2026-09-15", "mode": "烽火地带", "map": "零号大坝", "kd": "18/6/4", "dmg": "8100", "result": "win" },
        { "date": "2026-09-14", "mode": "全面战场", "map": "溪谷", "kd": "22/11/7", "dmg": "6900", "result": "loss" },
        { "date": "2026-09-12", "mode": "烽火地带", "map": "长弓溪谷", "kd": "15/9/2", "dmg": "5400", "result": "win" },
        { "date": "2026-09-10", "mode": "全面战场", "map": "坠机之地", "kd": "9/14/3", "dmg": "4100", "result": "loss" }
      ]
    },
    {
      "id": "valorant",
      "name": "无畏契约",
      "tagline": "FPS · 战术射击",
      "accent": "#ff4655",
      "icon": "crosshair",
      "cover": "https://picsum.photos/seed/valorant-cover/1200/800",
      "highlights": [
        "https://picsum.photos/seed/v-1/600/400",
        "https://picsum.photos/seed/v-2/600/400",
        "https://picsum.photos/seed/v-3/600/400",
        "https://picsum.photos/seed/v-4/600/400",
        "https://picsum.photos/seed/v-5/600/400",
        "https://picsum.photos/seed/v-6/600/400"
      ],
      "kpis": [
        { "label": "段位", "value": "钻石 1", "icon": "trophy" },
        { "label": "胜率", "value": "54.2%", "icon": "percent", "delta": "+1.8%" },
        { "label": "KDA", "value": "1.42", "icon": "target" },
        { "label": "ACS", "value": "238", "icon": "zap" },
        { "label": "爆头率", "value": "27%", "icon": "crosshair" }
      ],
      "matchColumns": [
        { "key": "date", "label": "日期" },
        { "key": "map", "label": "地图" },
        { "key": "agent", "label": "英雄" },
        { "key": "score", "label": "比分" },
        { "key": "kd", "label": "K/D/A" },
        { "key": "acs", "label": "ACS" },
        { "key": "result", "label": "结果" }
      ],
      "matches": [
        { "date": "2026-09-15", "map": "源工重镇", "agent": "捷风", "score": "13-9", "kd": "21/14/8", "acs": "312", "result": "win" },
        { "date": "2026-09-14", "map": "裂变峡谷", "agent": "芮娜", "score": "10-13", "kd": "16/17/5", "acs": "224", "result": "loss" },
        { "date": "2026-09-12", "map": "森寒冬港", "agent": "霓虹", "score": "13-7", "kd": "19/10/6", "acs": "298", "result": "win" },
        { "date": "2026-09-11", "map": "深海明珠", "agent": "零", "score": "8-13", "kd": "11/15/4", "acs": "176", "result": "loss" }
      ]
    },
    {
      "id": "hok",
      "name": "王者荣耀",
      "tagline": "MOBA · 5v5",
      "accent": "#6366f1",
      "icon": "sword",
      "cover": "https://picsum.photos/seed/hok-cover/1200/800",
      "highlights": [
        "https://picsum.photos/seed/hok-1/600/400",
        "https://picsum.photos/seed/hok-2/600/400",
        "https://picsum.photos/seed/hok-3/600/400",
        "https://picsum.photos/seed/hok-4/600/400",
        "https://picsum.photos/seed/hok-5/600/400",
        "https://picsum.photos/seed/hok-6/600/400"
      ],
      "kpis": [
        { "label": "段位", "value": "王者 32星", "icon": "trophy" },
        { "label": "巅峰分", "value": "1850", "icon": "star" },
        { "label": "胜率", "value": "61.5%", "icon": "percent", "delta": "+3.2%" },
        { "label": "KDA", "value": "4.8", "icon": "target" },
        { "label": "场次", "value": "842", "icon": "activity" }
      ],
      "matchColumns": [
        { "key": "date", "label": "日期" },
        { "key": "hero", "label": "英雄" },
        { "key": "lane", "label": "位置" },
        { "key": "kd", "label": "K/D/A" },
        { "key": "result", "label": "结果" }
      ],
      "matches": [
        { "date": "2026-09-15", "hero": "镜", "lane": "打野", "kd": "12/3/8", "result": "win" },
        { "date": "2026-09-14", "hero": "公孙离", "lane": "发育路", "kd": "9/4/11", "result": "win" },
        { "date": "2026-09-13", "hero": "西施", "lane": "中路", "kd": "5/6/14", "result": "loss" },
        { "date": "2026-09-12", "hero": "马超", "lane": "对抗路", "kd": "11/2/7", "result": "win" }
      ]
    }
  ]
}
```

- [ ] **Step 2: 写 `src/lib/games.js`**

```js
import data from '../data/games.json';

export function getSite() {
  return data.site;
}

export function getGames() {
  return data.games;
}

export function getGameById(id) {
  return data.games.find((g) => g.id === id);
}

export function getDefaultGame() {
  return data.games[0];
}
```

- [ ] **Step 3: 写 `src/lib/icons.js`**

```js
import {
  Activity,
  Crosshair,
  Crown,
  Percent,
  Shield,
  Star,
  Sword,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';

const ICONS = {
  activity: Activity,
  crosshair: Crosshair,
  crown: Crown,
  percent: Percent,
  shield: Shield,
  star: Star,
  sword: Sword,
  target: Target,
  trophy: Trophy,
  zap: Zap,
};

export function getIcon(name) {
  return ICONS[name] || Target;
}
```

- [ ] **Step 4: 写 `src/lib/result.js`**

```js
const META = {
  win: { label: '胜', tone: 'win' },
  loss: { label: '负', tone: 'loss' },
  draw: { label: '平', tone: 'draw' },
};

export function getResultMeta(result) {
  return META[result] ?? { label: String(result ?? '—'), tone: 'draw' };
}
```

- [ ] **Step 5: 写 `src/lib/games.test.js`**

```js
import { describe, it, expect } from 'vitest';
import { getSite, getGames, getGameById, getDefaultGame } from './games';

describe('games data', () => {
  it('exposes site meta', () => {
    expect(getSite().title).toBeTruthy();
    expect(getSite().accent).toMatch(/^#/);
  });

  it('has the three expected games', () => {
    const ids = getGames().map((g) => g.id);
    expect(ids).toEqual(expect.arrayContaining(['delta-force', 'valorant', 'hok']));
  });

  it('resolves a game by id', () => {
    expect(getGameById('valorant')?.name).toBe('无畏契约');
    expect(getGameById('nope')).toBeUndefined();
  });

  it('defaults to the first game', () => {
    expect(getDefaultGame().id).toBe(getGames()[0].id);
  });

  it('every game has kpis, matchColumns and highlights', () => {
    for (const g of getGames()) {
      expect(g.kpis.length).toBeGreaterThan(0);
      expect(g.matchColumns.length).toBeGreaterThan(0);
      expect(g.highlights.length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 6: 运行测试**

```bash
npx vitest run
```

Expected：5 个测试全部 PASS。

- [ ] **Step 7: 提交**

```bash
git add gaming-portfolio/src/data gaming-portfolio/src/lib
git commit -m "feat: add games data layer and utils"
```

---

### Task 3: 游戏 Tab 导航

**Files:**
- Create: `gaming-portfolio/src/hooks/useActiveGame.js`
- Create: `gaming-portfolio/src/components/GameTabs.jsx`
- Test: `gaming-portfolio/src/components/GameTabs.test.jsx`

**Interfaces:**
- Consumes: `getGames`, `getIcon`
- Produces:
  - `useActiveGame()` → `{ games, activeGame, activeId, setActiveId }`
  - `GameTabs` props：`{ games, activeId, onChange }`（onChange 接收 game id）

- [ ] **Step 1: 写 `src/hooks/useActiveGame.js`**

```js
import { useState } from 'react';
import { getGames } from '../lib/games';

export function useActiveGame() {
  const games = getGames();
  const [activeId, setActiveId] = useState(games[0]?.id ?? null);
  const activeGame = games.find((g) => g.id === activeId) ?? games[0];
  return { games, activeGame, activeId, setActiveId };
}
```

- [ ] **Step 2: 写 `src/components/GameTabs.jsx`**

```jsx
import { motion } from 'framer-motion';
import { getIcon } from '../lib/icons';

export default function GameTabs({ games, activeId, onChange }) {
  return (
    <nav className="flex items-center gap-1 rounded-2xl border border-white/10 bg-white/5 p-1 backdrop-blur-xl">
      {games.map((game) => {
        const Icon = getIcon(game.icon);
        const active = game.id === activeId;
        return (
          <button
            key={game.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(game.id)}
            className="relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium"
          >
            {active && (
              <motion.span
                layoutId="tab-indicator"
                className="absolute inset-0 rounded-xl border border-white/10"
                style={{ background: `${game.accent}26` }}
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <Icon
              className="relative z-10 h-4 w-4"
              style={{ color: active ? game.accent : undefined }}
              strokeWidth={1.75}
            />
            <span className={`relative z-10 ${active ? 'text-white' : 'text-slate-400'}`}>
              {game.name}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 3: 写 `src/components/GameTabs.test.jsx`**

```jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GameTabs from './GameTabs';
import { getGames } from '../lib/games';

describe('GameTabs', () => {
  it('renders a tab per game', () => {
    render(<GameTabs games={getGames()} activeId="valorant" onChange={() => {}} />);
    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });

  it('calls onChange with the clicked game id', async () => {
    const onChange = vi.fn();
    render(<GameTabs games={getGames()} activeId="valorant" onChange={onChange} />);
    await userEvent.click(screen.getByRole('tab', { name: '三角洲行动' }));
    expect(onChange).toHaveBeenCalledWith('delta-force');
  });
});
```

- [ ] **Step 4: 运行测试**

```bash
npx vitest run src/components/GameTabs.test.jsx
```

Expected：2 个测试 PASS。

- [ ] **Step 5: 提交**

```bash
git add gaming-portfolio/src/hooks gaming-portfolio/src/components/GameTabs.jsx gaming-portfolio/src/components/GameTabs.test.jsx
git commit -m "feat: add game tabs navigation"
```

---

### Task 4: 毛玻璃面板 + 对局列表

**Files:**
- Create: `gaming-portfolio/src/components/GlassPanel.jsx`
- Create: `gaming-portfolio/src/components/ResultBadge.jsx`
- Create: `gaming-portfolio/src/components/MatchRow.jsx`
- Create: `gaming-portfolio/src/components/MatchList.jsx`
- Test: `gaming-portfolio/src/components/MatchList.test.jsx`

**Interfaces:**
- Consumes: `getResultMeta`
- Produces:
  - `GlassPanel` props：`{ className?, children }`
  - `MatchList` props：`{ matches, columns }`
  - `MatchRow` props：`{ match, columns, index }`

- [ ] **Step 1: 写 `src/components/GlassPanel.jsx`**

```jsx
export default function GlassPanel({ className = '', children }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-frost backdrop-blur-xl ${className}`}>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: 写 `src/components/ResultBadge.jsx`**

```jsx
import { getResultMeta } from '../lib/result';

const TONES = {
  win: 'text-cyan-300 border-cyan-400/30 bg-cyan-400/10',
  loss: 'text-rose-300/90 border-rose-400/20 bg-rose-400/10',
  draw: 'text-slate-300 border-slate-500/30 bg-slate-500/10',
};

export default function ResultBadge({ result }) {
  const meta = getResultMeta(result);
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-xs font-medium ${TONES[meta.tone]}`}
    >
      {meta.label}
    </span>
  );
}
```

- [ ] **Step 3: 写 `src/components/MatchRow.jsx`**

```jsx
import { motion } from 'framer-motion';
import ResultBadge from './ResultBadge';

export default function MatchRow({ match, columns, index }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      data-testid="match-row"
      className="grid items-center gap-2 px-4 py-3 transition-colors hover:bg-white/5"
      style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
    >
      {columns.map((col) => {
        const value = match[col.key];
        return col.key === 'result' ? (
          <ResultBadge key={col.key} result={value} />
        ) : (
          <span key={col.key} className="truncate text-sm text-slate-300">
            {value ?? '—'}
          </span>
        );
      })}
    </motion.div>
  );
}
```

- [ ] **Step 4: 写 `src/components/MatchList.jsx`**

```jsx
import GlassPanel from './GlassPanel';
import MatchRow from './MatchRow';

export default function MatchList({ matches, columns }) {
  return (
    <GlassPanel>
      <div
        className="grid items-center gap-2 border-b border-white/5 px-4 py-3 text-xs uppercase tracking-wider text-slate-400"
        style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
      >
        {columns.map((col) => (
          <span key={col.key}>{col.label}</span>
        ))}
      </div>
      <div className="divide-y divide-white/5">
        {matches.map((m, i) => (
          <MatchRow key={i} match={m} columns={columns} index={i} />
        ))}
      </div>
    </GlassPanel>
  );
}
```

- [ ] **Step 5: 写 `src/components/MatchList.test.jsx`**

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MatchList from './MatchList';

const columns = [
  { key: 'date', label: '日期' },
  { key: 'map', label: '地图' },
  { key: 'result', label: '结果' },
];
const matches = [
  { date: '2026-09-15', map: '源工重镇', result: 'win' },
  { date: '2026-09-14', map: '裂变峡谷', result: 'loss' },
];

describe('MatchList', () => {
  it('renders column headers', () => {
    render(<MatchList matches={matches} columns={columns} />);
    expect(screen.getByText('日期')).toBeInTheDocument();
    expect(screen.getByText('地图')).toBeInTheDocument();
  });

  it('renders one row per match', () => {
    render(<MatchList matches={matches} columns={columns} />);
    expect(screen.getAllByTestId('match-row')).toHaveLength(2);
  });

  it('renders result as a badge', () => {
    render(<MatchList matches={matches} columns={columns} />);
    expect(screen.getByText('胜')).toBeInTheDocument();
    expect(screen.getByText('负')).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: 运行测试**

```bash
npx vitest run src/components/MatchList.test.jsx
```

Expected：3 个测试 PASS。

- [ ] **Step 7: 提交**

```bash
git add gaming-portfolio/src/components
git commit -m "feat: add match list with glass panels and result badges"
```

---

### Task 5: KPI 弹性卡（HTML 结构）

**Files:**
- Create: `gaming-portfolio/src/components/KpiCard.jsx`
- Create: `gaming-portfolio/src/components/KpiGrid.jsx`
- Test: `gaming-portfolio/src/components/KpiGrid.test.jsx`

**Interfaces:**
- Consumes: `getIcon`
- Produces:
  - `KpiGrid` props：`{ kpis }`
  - 每张卡挂 `data-elastic-card` 及 `data-color1/data-color2/data-radius/data-resolution` 供 ElasticField 读取

- [ ] **Step 1: 写 `src/components/KpiCard.jsx`**

```jsx
import { getIcon } from '../lib/icons';

export default function KpiCard({ kpi }) {
  const Icon = getIcon(kpi.icon);
  return (
    <div
      data-elastic-card
      data-elastic-id={kpi.label}
      data-color1="#10142a"
      data-color2="#05060f"
      data-radius="16"
      data-resolution="12"
      className="relative overflow-hidden rounded-2xl"
    >
      <div className="relative z-10 flex flex-col gap-1 p-5">
        <span className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-400">
          <Icon className="h-4 w-4 text-accent" strokeWidth={1.75} />
          {kpi.label}
        </span>
        <span className="text-2xl font-semibold text-slate-100">{kpi.value}</span>
        {kpi.delta && <span className="text-xs text-cyan-300/80">{kpi.delta}</span>}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 写 `src/components/KpiGrid.jsx`**

```jsx
import KpiCard from './KpiCard';

export default function KpiGrid({ kpis }) {
  return (
    <div
      data-testid="kpi-grid"
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
    >
      {kpis.map((kpi) => (
        <KpiCard key={kpi.label} kpi={kpi} />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: 写 `src/components/KpiGrid.test.jsx`**

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import KpiGrid from './KpiGrid';

const kpis = [
  { label: '段位', value: '钻石 1', icon: 'trophy' },
  { label: '胜率', value: '54.2%', icon: 'percent' },
];

describe('KpiGrid', () => {
  it('renders each kpi label and value', () => {
    render(<KpiGrid kpis={kpis} />);
    expect(screen.getByText('段位')).toBeInTheDocument();
    expect(screen.getByText('钻石 1')).toBeInTheDocument();
    expect(screen.getByText('胜率')).toBeInTheDocument();
    expect(screen.getByText('54.2%')).toBeInTheDocument();
  });

  it('marks cards for the elastic canvas', () => {
    const { container } = render(<KpiGrid kpis={kpis} />);
    expect(container.querySelectorAll('[data-elastic-card]')).toHaveLength(2);
  });
});
```

- [ ] **Step 4: 运行测试**

```bash
npx vitest run src/components/KpiGrid.test.jsx
```

Expected：2 个测试 PASS。

- [ ] **Step 5: 提交**

```bash
git add gaming-portfolio/src/components/KpiCard.jsx gaming-portfolio/src/components/KpiGrid.jsx gaming-portfolio/src/components/KpiGrid.test.jsx
git commit -m "feat: add kpi grid cards"
```

---

### Task 6: HeroCard + App 骨架（静态，暂无动态背景/弹性）

**Files:**
- Create: `gaming-portfolio/src/components/HeroCard.jsx`
- Modify: `gaming-portfolio/src/App.jsx`

**Interfaces:**
- Consumes: `useActiveGame`, `getSite`, `GameTabs`, `HeroCard`, `KpiGrid`, `MatchList`
- Produces: 完整静态页面（纯色背景，内容可切换）

- [ ] **Step 1: 写 `src/components/HeroCard.jsx`**

```jsx
import { getIcon } from '../lib/icons';

export default function HeroCard({ game }) {
  const Icon = getIcon(game.icon);
  return (
    <div
      data-elastic-card
      data-elastic-id="hero"
      data-image={game.cover}
      data-color1={game.accent}
      data-color2="#05060f"
      data-radius="20"
      data-tilt="10"
      data-resolution="20"
      className="relative h-64 overflow-hidden rounded-3xl"
    >
      <div className="relative z-10 flex h-full flex-col justify-end p-6">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-slate-300">
          <Icon className="h-3.5 w-3.5" />
          {game.tagline}
        </span>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">{game.name}</h2>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 写 `src/App.jsx`（静态版）**

```jsx
import { AnimatePresence, motion } from 'framer-motion';
import GameTabs from './components/GameTabs';
import HeroCard from './components/HeroCard';
import KpiGrid from './components/KpiGrid';
import MatchList from './components/MatchList';
import { useActiveGame } from './hooks/useActiveGame';
import { getSite } from './lib/games';

export default function App() {
  const { games, activeGame, activeId, setActiveId } = useActiveGame();
  const site = getSite();

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-950 text-slate-100">
      <div className="relative z-20 mx-auto max-w-5xl px-6 py-10">
        <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white">{site.title}</h1>
            <p className="mt-1 text-slate-400">{site.subtitle}</p>
          </div>
          <GameTabs games={games} activeId={activeId} onChange={setActiveId} />
        </header>

        <AnimatePresence mode="wait">
          <motion.main
            key={activeGame.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <HeroCard game={activeGame} />
            <KpiGrid kpis={activeGame.kpis} />
            <MatchList matches={activeGame.matches} columns={activeGame.matchColumns} />
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 验证**

```bash
npm run dev
```

Expected：页面显示标题、Tab、Hero 卡（占位图已加载）、5 张 KPI 卡、对局列表；点击 Tab 内容平滑切换。此时 Hero/KPI 卡是透明底（文字直接浮在深色背景上），这是预期的中间状态。

- [ ] **Step 4: 提交**

```bash
git add gaming-portfolio/src/App.jsx gaming-portfolio/src/components/HeroCard.jsx
git commit -m "feat: assemble app shell with hero, kpi and match list"
```

---

### Task 7: DriftWall 背景

**Files:**
- Create: `gaming-portfolio/src/components/DriftWall.jsx`
- Create: `gaming-portfolio/src/components/DriftWall.css`
- Modify: `gaming-portfolio/src/App.jsx`

**Interfaces:**
- Produces: `DriftWall` props（与用户原组件一致）：`{ items, columns, tileWidth, tileHeight, gap, radius, tilt, turn, roll, perspective, depth, speed, direction, variance, parallax, pauseOnHover, lift, fade, dim, grayscale, overlayColor, className, style }`
- 注：`DriftWall.css` 为根据组件 class 名重建（用户仅提供 JSX），后续可视觉微调。

- [ ] **Step 1: 写 `src/components/DriftWall.jsx`（用户提供源码，原样粘贴）**

```jsx
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import './DriftWall.css';

const DEFAULT_ITEMS = Array.from({ length: 15 }, (_, i) => {
  const ids = [1015, 1025, 1039, 1043, 1044, 1050, 1062, 1069, 1074, 1080, 1084, 106, 110, 133, 164];
  return {
    image: `https://picsum.photos/id/${ids[i % ids.length]}/600/400`,
    title: `Tile ${i + 1}`,
    href: undefined,
  };
});

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const columnFactor = (index, variance) => {
  const pseudo = ((index * 0.6180339887 + 0.35) % 1) * 2 - 1;
  return 1 + variance * pseudo;
};

const DriftWall = ({
  items = DEFAULT_ITEMS,
  columns = 5,
  tileWidth = 200,
  tileHeight = 132,
  gap = 18,
  radius = 14,
  tilt = 16,
  turn = -14,
  roll = 0,
  perspective = 1200,
  depth = 120,
  speed = 42,
  direction = 'up',
  variance = 0.45,
  parallax = 0.6,
  pauseOnHover = false,
  lift = 64,
  fade = 0.6,
  dim = 0.55,
  grayscale = false,
  overlayColor = '#060010',
  className = '',
  style,
}) => {
  const containerRef = useRef(null);
  const planeRef = useRef(null);
  const trackRefs = useRef([]);
  const rafRef = useRef(null);

  const offsetsRef = useRef([]);
  const velocitiesRef = useRef([]);
  const hoveredColRef = useRef(-1);
  const wallHoveredRef = useRef(false);
  const pointerRef = useRef({ x: 0, y: 0 });
  const pointerDampedRef = useRef({ x: 0, y: 0 });
  const lastTsRef = useRef(null);

  const [containerHeight, setContainerHeight] = useState(600);
  const [activeId, setActiveId] = useState(null);
  const activeIdRef = useRef(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(prefersReducedMotion());
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const columnItems = useMemo(() => {
    const cols = Array.from({ length: columns }, () => []);
    items.forEach((item, i) => cols[i % columns].push(item));
    return cols.map((col) => (col.length ? col : items.slice(0, 1)));
  }, [items, columns]);

  const columnMeta = useMemo(() => {
    const unit = tileHeight + gap;
    return columnItems.map((col) => {
      const copyHeight = Math.max(unit, col.length * unit);
      const copies = Math.max(2, Math.ceil((containerHeight * 1.6) / copyHeight) + 1);
      return { copyHeight, copies };
    });
  }, [columnItems, tileHeight, gap, containerHeight]);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerHeight(entry.contentRect.height || 600);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const baseVelocities = useMemo(() => {
    const dirSign = direction === 'up' ? 1 : -1;
    return columnItems.map((_, c) => {
      const altSign = c % 2 === 0 ? 1 : -1;
      return speed * columnFactor(c, variance) * dirSign * altSign;
    });
  }, [columnItems, speed, direction, variance]);

  useEffect(() => {
    offsetsRef.current = columnMeta.map((meta, c) => meta.copyHeight * ((c * 0.37) % 1));
    velocitiesRef.current = columnItems.map(() => 0);
  }, [columnMeta, columnItems]);

  const applyPlaneTransform = useCallback(
    (px, py) => {
      const plane = planeRef.current;
      if (!plane) return;
      plane.style.transform =
        `translate(-50%, -50%) scale(1.18) ` +
        `rotateX(${tilt + py}deg) rotateY(${turn + px}deg) rotateZ(${roll}deg) ` +
        `translateZ(${-depth}px)`;
    },
    [tilt, turn, roll, depth],
  );

  useEffect(() => {
    const animate = (ts) => {
      if (lastTsRef.current === null) lastTsRef.current = ts;
      const dt = Math.min(0.05, Math.max(0, ts - lastTsRef.current) / 1000);
      lastTsRef.current = ts;

      const maxTilt = parallax * 8;
      const targetX = pointerRef.current.x * maxTilt;
      const targetY = -pointerRef.current.y * maxTilt;
      const damp = 1 - Math.exp(-dt / 0.12);
      pointerDampedRef.current.x += (targetX - pointerDampedRef.current.x) * damp;
      pointerDampedRef.current.y += (targetY - pointerDampedRef.current.y) * damp;
      applyPlaneTransform(pointerDampedRef.current.x, pointerDampedRef.current.y);

      if (!reduced) {
        for (let c = 0; c < trackRefs.current.length; c++) {
          const meta = columnMeta[c];
          if (!meta) continue;
          const paused = wallHoveredRef.current && pauseOnHover;
          const factor = paused || hoveredColRef.current === c ? 0 : 1;
          const target = baseVelocities[c] * factor;

          const ease = 1 - Math.exp(-dt / (target === 0 ? 0.16 : 0.28));
          velocitiesRef.current[c] += (target - velocitiesRef.current[c]) * ease;
          let next = (offsetsRef.current[c] ?? 0) + velocitiesRef.current[c] * dt;
          next = ((next % meta.copyHeight) + meta.copyHeight) % meta.copyHeight;
          offsetsRef.current[c] = next;

          const el = trackRefs.current[c];
          if (el) el.style.transform = `translate3d(0, ${-next}px, 0)`;
        }
      } else {
        for (let c = 0; c < trackRefs.current.length; c++) {
          const el = trackRefs.current[c];
          const meta = columnMeta[c];
          if (el && meta) el.style.transform = `translate3d(0, ${-(offsetsRef.current[c] ?? 0)}px, 0)`;
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
    };
  }, [baseVelocities, columnMeta, pauseOnHover, parallax, reduced, applyPlaneTransform]);

  const activate = useCallback((id, index) => {
    activeIdRef.current = id;
    hoveredColRef.current = index;
    setActiveId(id);
  }, []);
  const release = useCallback(() => {
    activeIdRef.current = null;
    hoveredColRef.current = -1;
    setActiveId(null);
  }, []);

  const handlePointerMove = useCallback(
    (e) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      if (parallax > 0 && !reduced) {
        pointerRef.current = {
          x: (e.clientX - rect.left) / rect.width - 0.5,
          y: (e.clientY - rect.top) / rect.height - 0.5,
        };
      }
      const hit = document.elementFromPoint(e.clientX, e.clientY);
      const tile = hit && hit.closest ? hit.closest('[data-tile-id]') : null;
      if (!tile) return;
      const id = tile.dataset.tileId;
      if (id === activeIdRef.current) return;
      activeIdRef.current = id;
      hoveredColRef.current = Number(tile.dataset.col);
      setActiveId(id);
    },
    [parallax, reduced],
  );

  const handlePointerLeaveWall = useCallback(() => {
    wallHoveredRef.current = false;
    pointerRef.current = { x: 0, y: 0 };
    release();
  }, [release]);

  const cssVars = useMemo(
    () => ({
      '--dw-tile-w': `${tileWidth}px`,
      '--dw-tile-h': `${tileHeight}px`,
      '--dw-gap': `${gap}px`,
      '--dw-radius': `${radius}px`,
      '--dw-perspective': `${perspective}px`,
      '--dw-lift': `${lift}px`,
      '--dw-dim': dim,
      '--dw-gray': grayscale ? 1 : 0,
      '--dw-overlay': overlayColor,
      '--dw-edge': `${Math.max(0, (1 - fade) * 100)}%`,
      ...style,
    }),
    [tileWidth, tileHeight, gap, radius, perspective, lift, dim, grayscale, overlayColor, fade, style],
  );

  const renderTile = (item, id, colIndex) => {
    const inner = (
      <span className="drift-wall__inner">
        <img src={item.image} alt={item.title ?? ''} loading="lazy" decoding="async" draggable={false} />
        <span className="drift-wall__overlay" aria-hidden="true" />
      </span>
    );
    const commonProps = {
      className: `drift-wall__tile${activeId === id ? ' is-active' : ''}`,
      'data-tile-id': id,
      'data-col': colIndex,
      onFocus: () => activate(id, colIndex),
      onBlur: release,
    };
    if (item.href) {
      return (
        <a key={id} href={item.href} target="_blank" rel="noreferrer noopener" {...commonProps}>
          {inner}
        </a>
      );
    }
    return (
      <div key={id} tabIndex={0} role="button" aria-label={item.title ?? 'tile'} {...commonProps}>
        {inner}
      </div>
    );
  };

  const rootClass = ['drift-wall', reduced ? 'drift-wall--reduced' : '', className].filter(Boolean).join(' ');

  return (
    <div
      ref={containerRef}
      className={rootClass}
      style={cssVars}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => {
        wallHoveredRef.current = true;
      }}
      onPointerLeave={handlePointerLeaveWall}
      role="group"
      aria-label="Drifting wall of tiles"
    >
      <div ref={planeRef} className="drift-wall__plane">
        {columnItems.map((col, c) => {
          const meta = columnMeta[c];
          const copies = Array.from({ length: meta.copies });
          return (
            <div className="drift-wall__col" key={`col-${c}`}>
              <div className="drift-wall__track" ref={(el) => (trackRefs.current[c] = el)}>
                {copies.map((_, copyIndex) =>
                  col.map((item, itemIndex) => renderTile(item, `${c}-${copyIndex}-${itemIndex}`, c)),
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DriftWall;
```

- [ ] **Step 2: 写 `src/components/DriftWall.css`（重建）**

```css
.drift-wall {
  position: absolute;
  inset: 0;
  overflow: hidden;
  perspective: var(--dw-perspective, 1200px);
}

.drift-wall__plane {
  position: absolute;
  left: 50%;
  top: 50%;
  display: flex;
  gap: var(--dw-gap, 18px);
  transform-style: preserve-3d;
  will-change: transform;
}

.drift-wall__col {
  flex: 0 0 auto;
  width: var(--dw-tile-w, 200px);
  transform-style: preserve-3d;
}

.drift-wall__track {
  display: flex;
  flex-direction: column;
  gap: var(--dw-gap, 18px);
  will-change: transform;
}

.drift-wall__tile {
  position: relative;
  width: var(--dw-tile-w, 200px);
  height: var(--dw-tile-h, 132px);
  border-radius: var(--dw-radius, 14px);
  overflow: hidden;
  cursor: pointer;
  outline: none;
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  transform: translateZ(0);
}

.drift-wall__tile.is-active {
  transform: translateZ(var(--dw-lift, 64px));
}

.drift-wall__tile:focus-visible {
  box-shadow: 0 0 0 2px #060010, 0 0 0 4px rgba(56, 189, 248, 0.6);
}

.drift-wall__inner {
  display: block;
  width: 100%;
  height: 100%;
}

.drift-wall__inner img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(var(--dw-gray, 0));
  user-select: none;
}

.drift-wall__overlay {
  position: absolute;
  inset: 0;
  background: var(--dw-overlay, #060010);
  opacity: var(--dw-dim, 0.55);
}

.drift-wall::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    var(--dw-overlay, #060010) var(--dw-edge, 40%),
    transparent 50%,
    var(--dw-overlay, #060010)
  );
  opacity: 0.8;
}

.drift-wall--reduced .drift-wall__tile {
  transition: none;
}
```

- [ ] **Step 3: 在 `App.jsx` 接入背景**

在 `App.jsx` 的根 `<div>` 内、内容层之前插入背景层：

```jsx
<div className="fixed inset-0 z-0">
  <DriftWall
    items={activeGame.highlights.map((src) => ({ image: src, title: activeGame.name, href: undefined }))}
    columns={6}
    tileWidth={220}
    tileHeight={140}
    speed={36}
    parallax={0.6}
    tilt={5}
    turn={-6}
    dim={0.6}
  />
</div>
```

并加入 import：

```jsx
import DriftWall from './components/DriftWall';
```

- [ ] **Step 4: 验证**

```bash
npm run dev
```

Expected：背景出现漂移的图片瓦片墙，鼠标移动时整体轻微倾斜，悬停瓦片该列暂停、瓦片抬起。前景文字可读。

- [ ] **Step 5: 提交**

```bash
git add gaming-portfolio/src/components/DriftWall.jsx gaming-portfolio/src/components/DriftWall.css gaming-portfolio/src/App.jsx
git commit -m "feat: add drift wall background"
```

---

### Task 8: ElasticMesh 原版（Hero 单卡）

**Files:**
- Create: `gaming-portfolio/src/components/elastic/ElasticMesh.jsx`
- Create: `gaming-portfolio/src/components/elastic/ElasticMesh.css`
- Modify: `gaming-portfolio/src/App.jsx`

**Interfaces:**
- Produces: `ElasticMesh`（用户原版，供单卡使用），props 见组件签名。
- 注：本任务先把原版接入 Hero 验证弹性效果，下一任务用共享上下文版 ElasticField 替换并覆盖 KPI。

- [ ] **Step 1: 写 `src/components/elastic/ElasticMesh.css`**

```css
.elastic-mesh {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.elastic-mesh canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}
```

- [ ] **Step 2: 写 `src/components/elastic/ElasticMesh.jsx`（用户提供源码，原样粘贴）**

```jsx
import { useEffect, useRef } from 'react';
import { Renderer, Geometry, Program, Mesh, Texture } from 'ogl';

import './ElasticMesh.css';

const DIST = 4.6;
const FIT = 0.82;

const VERT = `
precision highp float;
attribute vec2 aGrid;
attribute vec2 uv;
attribute vec3 aOffset;
attribute vec3 aNormal;

uniform float uAspect;
uniform float uTilt;
uniform float uDist;
uniform float uFit;

varying vec2 vUv;
varying vec3 vNormal;
varying float vDepth;

void main() {
  vUv = uv;

  vec2 base = vec2((aGrid.x * 2.0 - 1.0) * uAspect, 1.0 - aGrid.y * 2.0);
  vec3 p = vec3(base + aOffset.xy, aOffset.z);

  float ct = cos(uTilt);
  float st = sin(uTilt);
  float ry = p.y * ct - p.z * st;
  float rz = p.y * st + p.z * ct;
  p.y = ry;
  p.z = rz;

  float persp = uDist / (uDist - p.z);
  vec2 clip = vec2(p.x / uAspect, p.y) * persp * uFit;

  vNormal = aNormal;
  vDepth = aOffset.z;
  gl_Position = vec4(clip, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;

varying vec2 vUv;
varying vec3 vNormal;
varying float vDepth;

uniform sampler2D tMap;
uniform float uHasImage;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uHighlight;
uniform float uShading;
uniform vec2 uRes;
uniform float uRadius;
uniform float uGrid;
uniform float uGridDensity;
uniform float uGridOpacity;
uniform vec3 uGridColor;

void main() {
  vec3 base;
  if (uHasImage > 0.5) {
    base = texture2D(tMap, vUv).rgb;
  } else {
    base = mix(uColor1, uColor2, clamp(vUv.y, 0.0, 1.0));
  }

  vec3 N = normalize(vNormal);
  vec3 L = normalize(vec3(-0.35, 0.55, 0.78));
  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 H = normalize(L + V);

  float diff = clamp(dot(N, L), 0.0, 1.0);
  float specRaw = pow(clamp(dot(N, H), 0.0, 1.0), 26.0);
  float specFlat = pow(clamp(H.z, 0.0, 1.0), 26.0);
  float spec = clamp((specRaw - specFlat) / (1.0 - specFlat), 0.0, 1.0);
  float ao = clamp(1.0 + vDepth * 0.45, 0.65, 1.25);

  vec3 lit = base * (1.0 - uShading * 0.28);
  lit += base * diff * uShading * 0.55;
  lit *= ao;
  lit += uHighlight * spec * uShading * 0.25;

  if (uGrid > 0.5) {
    vec2 g = vUv * uGridDensity;
    vec2 w = uGridDensity / max(uRes, vec2(1.0));
    vec2 d = abs(fract(g - 0.5) - 0.5) / max(w * 1.5, vec2(1e-4));
    float line = 1.0 - clamp(min(d.x, d.y), 0.0, 1.0);
    lit = mix(lit, uGridColor, line * uGridOpacity * (0.45 + diff * 0.55));
  }

  vec2 p = (vUv - 0.5) * uRes;
  vec2 halfRes = uRes * 0.5;
  float r = min(uRadius, min(halfRes.x, halfRes.y));
  vec2 q = abs(p) - (halfRes - r);
  float sd = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  float alpha = 1.0 - smoothstep(-1.25, 1.25, sd);
  if (alpha <= 0.002) discard;

  gl_FragColor = vec4(lit, alpha);
}
`;

function hexToRgb(hex) {
  let h = (hex || '').replace('#', '').trim();
  if (h.length === 3)
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  const n = parseInt(h || '000000', 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

const ElasticMesh = ({
  image = '',
  color1 = '#5227FF',
  color2 = '#B19EEF',
  highlight = '#ffffff',
  showGrid = true,
  gridDensity = 20,
  gridOpacity = 0.28,
  gridColor = '#ffffff',
  borderRadius = 25,
  stiffness = 0.05,
  damping = 0.2,
  grabRadius = 0.6,
  pull = 0.4,
  wobble = 5,
  tilt = 14,
  shading = 0.5,
  resolution = 25,
  interaction = 'hover',
  enabled = true,
  className = '',
  style,
  ...rest
}) => {
  const containerRef = useRef(null);

  const propsRef = useRef({});
  propsRef.current = {
    color1, color2, highlight, showGrid, gridDensity, gridOpacity, gridColor,
    borderRadius, stiffness, damping, grabRadius, pull, wobble, tilt, shading,
    interaction, enabled,
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(window.devicePixelRatio || 1, 2) });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const N = Math.max(6, Math.min(40, Math.round(resolution)));
    const nodeCount = N * N;

    const aGrid = new Float32Array(nodeCount * 2);
    const uv = new Float32Array(nodeCount * 2);
    const aOffset = new Float32Array(nodeCount * 3);
    const aNormal = new Float32Array(nodeCount * 3);

    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const idx = j * N + i;
        const u = i / (N - 1);
        const v = j / (N - 1);
        aGrid[idx * 2] = u;
        aGrid[idx * 2 + 1] = v;
        uv[idx * 2] = u;
        uv[idx * 2 + 1] = v;
        aNormal[idx * 3 + 2] = 1;
      }
    }

    const quads = (N - 1) * (N - 1);
    const index = new Uint16Array(quads * 6);
    let t = 0;
    for (let j = 0; j < N - 1; j++) {
      for (let i = 0; i < N - 1; i++) {
        const a = j * N + i;
        const b = a + 1;
        const c = a + N;
        const d = c + 1;
        index[t++] = a; index[t++] = c; index[t++] = b;
        index[t++] = b; index[t++] = c; index[t++] = d;
      }
    }

    const geometry = new Geometry(gl, {
      aGrid: { size: 2, data: aGrid },
      uv: { size: 2, data: uv },
      aOffset: { size: 3, data: aOffset },
      aNormal: { size: 3, data: aNormal },
      index: { data: index },
    });

    const texture = new Texture(gl, { generateMipmaps: false, flipY: false });
    let hasImage = 0;
    if (image) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = image;
      img.onload = () => {
        texture.image = img;
        program.uniforms.uHasImage.value = 1;
      };
    }

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      transparent: true,
      cullFace: null,
      uniforms: {
        tMap: { value: texture },
        uHasImage: { value: hasImage },
        uColor1: { value: hexToRgb(color1) },
        uColor2: { value: hexToRgb(color2) },
        uHighlight: { value: hexToRgb(highlight) },
        uGrid: { value: showGrid ? 1 : 0 },
        uGridDensity: { value: gridDensity },
        uGridOpacity: { value: gridOpacity },
        uGridColor: { value: hexToRgb(gridColor) },
        uShading: { value: shading },
        uRes: { value: [1, 1] },
        uRadius: { value: borderRadius },
        uAspect: { value: 1 },
        uTilt: { value: (tilt * Math.PI) / 180 },
        uDist: { value: DIST },
        uFit: { value: FIT },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });

    const baseX = new Float32Array(nodeCount);
    const baseY = new Float32Array(nodeCount);
    const pos = new Float32Array(nodeCount * 3);
    const vel = new Float32Array(nodeCount * 3);
    const accel = new Float32Array(nodeCount * 3);

    let aspect = 1;
    function refreshBase() {
      for (let idx = 0; idx < nodeCount; idx++) {
        baseX[idx] = (aGrid[idx * 2] * 2 - 1) * aspect;
        baseY[idx] = 1 - aGrid[idx * 2 + 1] * 2;
      }
    }

    function resize() {
      const w = container.offsetWidth || 1;
      const h = container.offsetHeight || 1;
      renderer.setSize(w, h);
      aspect = w / h;
      program.uniforms.uAspect.value = aspect;
      program.uniforms.uRes.value = [w, h];
      refreshBase();
    }

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    const pointer = { x: 0, y: 0, tx: 0, ty: 0, active: false, targetActive: false };

    function toPlane(clientX, clientY) {
      const rect = container.getBoundingClientRect();
      const mx = (clientX - rect.left) / rect.width;
      const my = (clientY - rect.top) / rect.height;
      const clipX = mx * 2 - 1;
      const clipY = 1 - my * 2;
      const t = ((propsRef.current.tilt || 0) * Math.PI) / 180;
      const ct = Math.cos(t);
      const st = Math.sin(t);
      const a = clipY / (ct * FIT * DIST);
      const py = (a * DIST) / (1 + a * st);
      const persp = DIST / (DIST - py * st);
      pointer.tx = (clipX * aspect) / (persp * FIT);
      pointer.ty = py;
    }

    function onMove(e) {
      toPlane(e.clientX, e.clientY);
      if (propsRef.current.interaction === 'hover') pointer.targetActive = true;
    }
    function onEnter() {
      if (propsRef.current.interaction === 'hover') pointer.targetActive = true;
    }
    function onLeave() {
      pointer.targetActive = false;
    }
    function onDown(e) {
      if (propsRef.current.interaction === 'drag') {
        toPlane(e.clientX, e.clientY);
        pointer.x = pointer.tx;
        pointer.y = pointer.ty;
        pointer.targetActive = true;
      }
    }
    function onUp() {
      if (propsRef.current.interaction === 'drag') pointer.targetActive = false;
    }
    function onTouch(e) {
      if (e.touches.length) {
        toPlane(e.touches[0].clientX, e.touches[0].clientY);
        pointer.targetActive = true;
      }
    }

    container.addEventListener('mousemove', onMove);
    container.addEventListener('mouseenter', onEnter);
    container.addEventListener('mouseleave', onLeave);
    container.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    container.addEventListener('touchstart', onTouch, { passive: true });
    container.addEventListener('touchmove', onTouch, { passive: true });
    container.addEventListener('touchend', onLeave);

    const STEP = 1 / 120;
    const MAX_SUB = 5;
    let accTime = 0;
    let last = performance.now();
    let maxOffset = 0;
    let maxVel = 0;

    function substep() {
      const p = propsRef.current;
      const s = p.stiffness;
      const retain = 1 - p.damping;
      const coupling = 0.06 + p.wobble * 0.032;
      const active = pointer.active && p.enabled && !reduceMotion;
      const r = Math.max(0.08, p.grabRadius) * 1.4;
      const invR = 1 / r;
      const force = p.pull * 0.009;

      for (let j = 0; j < N; j++) {
        for (let i = 0; i < N; i++) {
          const idx = j * N + i;
          const o3 = idx * 3;
          const ox = pos[o3];
          const oy = pos[o3 + 1];
          const oz = pos[o3 + 2];

          let ax = -s * ox;
          let ay = -s * oy;
          let az = -s * oz;

          let sumx = 0;
          let sumy = 0;
          let sumz = 0;
          let cnt = 0;
          if (i > 0) { const n = (idx - 1) * 3; sumx += pos[n]; sumy += pos[n + 1]; sumz += pos[n + 2]; cnt++; }
          if (i < N - 1) { const n = (idx + 1) * 3; sumx += pos[n]; sumy += pos[n + 1]; sumz += pos[n + 2]; cnt++; }
          if (j > 0) { const n = (idx - N) * 3; sumx += pos[n]; sumy += pos[n + 1]; sumz += pos[n + 2]; cnt++; }
          if (j < N - 1) { const n = (idx + N) * 3; sumx += pos[n]; sumy += pos[n + 1]; sumz += pos[n + 2]; cnt++; }
          ax += coupling * (sumx - cnt * ox);
          ay += coupling * (sumy - cnt * oy);
          az += coupling * (sumz - cnt * oz);

          if (active) {
            const dx = pointer.x - (baseX[idx] + ox);
            const dy = pointer.y - (baseY[idx] + oy);
            const d = Math.sqrt(dx * dx + dy * dy);
            const tnorm = d * invR;
            if (tnorm < 1) {
              const zBump = 1 - tnorm * tnorm;
              az += force * zBump * zBump * 6.0;
              if (d > 1e-4) {
                const pinch = tnorm * (1 - tnorm) * (1 - tnorm) * 6.75;
                const dir = (force * pinch * 1.6) / d;
                ax += dx * dir;
                ay += dy * dir;
              }
            }
          }

          accel[o3] = ax;
          accel[o3 + 1] = ay;
          accel[o3 + 2] = az;
        }
      }

      for (let k = 0; k < nodeCount; k++) {
        const o3 = k * 3;
        const nvx = (vel[o3] + accel[o3]) * retain;
        const nvy = (vel[o3 + 1] + accel[o3 + 1]) * retain;
        const nvz = (vel[o3 + 2] + accel[o3 + 2]) * retain;
        vel[o3] = nvx;
        vel[o3 + 1] = nvy;
        vel[o3 + 2] = nvz;

        let px = pos[o3] + nvx;
        let py = pos[o3 + 1] + nvy;
        let pz = pos[o3 + 2] + nvz;
        if (px > 1.2) px = 1.2; else if (px < -1.2) px = -1.2;
        if (py > 1.2) py = 1.2; else if (py < -1.2) py = -1.2;
        if (pz > 1.2) pz = 1.2; else if (pz < -1.2) pz = -1.2;
        pos[o3] = px;
        pos[o3 + 1] = py;
        pos[o3 + 2] = pz;
      }
    }

    function commit() {
      maxOffset = 0;
      maxVel = 0;
      for (let j = 0; j < N; j++) {
        for (let i = 0; i < N; i++) {
          const idx = j * N + i;
          const o3 = idx * 3;
          const iL = i > 0 ? idx - 1 : idx;
          const iR = i < N - 1 ? idx + 1 : idx;
          const iD = j > 0 ? idx - N : idx;
          const iU = j < N - 1 ? idx + N : idx;

          const lx = baseX[iL] + pos[iL * 3];
          const ly = baseY[iL] + pos[iL * 3 + 1];
          const lz = pos[iL * 3 + 2];
          const rx = baseX[iR] + pos[iR * 3];
          const ry = baseY[iR] + pos[iR * 3 + 1];
          const rz = pos[iR * 3 + 2];
          const dx = baseX[iD] + pos[iD * 3];
          const dy = baseY[iD] + pos[iD * 3 + 1];
          const dz = pos[iD * 3 + 2];
          const ux = baseX[iU] + pos[iU * 3];
          const uy = baseY[iU] + pos[iU * 3 + 1];
          const uz = pos[iU * 3 + 2];

          const txx = rx - lx;
          const txy = ry - ly;
          const txz = rz - lz;
          const tyx = ux - dx;
          const tyy = uy - dy;
          const tyz = uz - dz;

          let nx = txy * tyz - txz * tyy;
          let ny = txz * tyx - txx * tyz;
          let nz = txx * tyy - txy * tyx;
          if (nz < 0) { nx = -nx; ny = -ny; nz = -nz; }
          const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
          aNormal[o3] = nx / len;
          aNormal[o3 + 1] = ny / len;
          aNormal[o3 + 2] = nz / len;

          aOffset[o3] = pos[o3];
          aOffset[o3 + 1] = pos[o3 + 1];
          aOffset[o3 + 2] = pos[o3 + 2];

          const om = Math.abs(pos[o3]) + Math.abs(pos[o3 + 1]) + Math.abs(pos[o3 + 2]);
          if (om > maxOffset) maxOffset = om;
          const vm = Math.abs(vel[o3]) + Math.abs(vel[o3 + 1]) + Math.abs(vel[o3 + 2]);
          if (vm > maxVel) maxVel = vm;
        }
      }
      geometry.attributes.aOffset.needsUpdate = true;
      geometry.attributes.aNormal.needsUpdate = true;
    }

    let raf = 0;
    function frame(now) {
      raf = requestAnimationFrame(frame);
      const p = propsRef.current;

      program.uniforms.uShading.value = p.shading;
      program.uniforms.uRadius.value = p.borderRadius;
      program.uniforms.uTilt.value = (p.tilt * Math.PI) / 180;
      program.uniforms.uColor1.value = hexToRgb(p.color1);
      program.uniforms.uColor2.value = hexToRgb(p.color2);
      program.uniforms.uHighlight.value = hexToRgb(p.highlight);
      program.uniforms.uGrid.value = p.showGrid ? 1 : 0;
      program.uniforms.uGridDensity.value = p.gridDensity;
      program.uniforms.uGridOpacity.value = p.gridOpacity;
      program.uniforms.uGridColor.value = hexToRgb(p.gridColor);

      let dt = (now - last) / 1000;
      last = now;
      if (dt > 0.25) dt = 0.25;

      const tau = 0.06;
      const kLerp = 1 - Math.exp(-Math.max(dt, 1e-4) / tau);
      pointer.x += (pointer.tx - pointer.x) * kLerp;
      pointer.y += (pointer.ty - pointer.y) * kLerp;
      pointer.active = pointer.targetActive;

      accTime += dt;
      let sub = 0;
      while (accTime >= STEP && sub < MAX_SUB) {
        substep();
        accTime -= STEP;
        sub++;
      }
      if (accTime > STEP) accTime = 0;

      commit();
      renderer.render({ scene: mesh });
    }
    raf = requestAnimationFrame(frame);

    container.appendChild(gl.canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('mouseenter', onEnter);
      container.removeEventListener('mouseleave', onLeave);
      container.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      container.removeEventListener('touchstart', onTouch);
      container.removeEventListener('touchmove', onTouch);
      container.removeEventListener('touchend', onLeave);
      if (gl.canvas.parentElement === container) container.removeChild(gl.canvas);
      const lose = gl.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, resolution]);

  return (
    <div ref={containerRef} className={`elastic-mesh${className ? ` ${className}` : ''}`} style={style} {...rest} />
  );
};

export default ElasticMesh;
```

- [ ] **Step 3: 在 HeroCard 中叠加原版 ElasticMesh 验证**

临时在 `HeroCard.jsx` 的 wrapper 内加一层（验证后下一步会移除、改用 ElasticField）：

```jsx
import ElasticMesh from './elastic/ElasticMesh';

// 在 HeroCard 的 return 中，wrapper 内、文字层之前插入：
<div className="absolute inset-0 z-0">
  <ElasticMesh
    image={game.cover}
    color1={game.accent}
    color2="#05060f"
    borderRadius={20}
    tilt={10}
    resolution={20}
    interaction="hover"
  />
</div>
```

同时把 wrapper 加上 `pointer-events-auto`（默认即有）。

- [ ] **Step 4: 验证**

```bash
npm run dev
```

Expected：Hero 卡显示为可弹性变形的 WebGL 表面（封面图 + 圆角 + 悬停鼓起高光）。确认原版 ElasticMesh 正常工作后进入下一任务。

- [ ] **Step 5: 提交**

```bash
git add gaming-portfolio/src/components/elastic/ElasticMesh.jsx gaming-portfolio/src/components/elastic/ElasticMesh.css gaming-portfolio/src/components/HeroCard.jsx
git commit -m "feat: integrate elastic mesh for hero card"
```

---

### Task 9: ElasticField 共享上下文（Hero + 全部 KPI 弹性卡）

**Files:**
- Create: `gaming-portfolio/src/components/elastic/ElasticField.jsx`
- Modify: `gaming-portfolio/src/components/HeroCard.jsx`（移除原版 ElasticMesh，改由 ElasticField 渲染）
- Modify: `gaming-portfolio/src/App.jsx`（挂载 ElasticField）

**Interfaces:**
- Consumes: DOM 上所有 `[data-elastic-card]` 元素及其 `data-*` 配置
- Produces: `ElasticField`（无 props），一张全屏透明 canvas、单一 WebGL 上下文渲染全部弹性卡表面；HTML 文字层在卡内 `z-10` 之上。

- [ ] **Step 1: 写 `src/components/elastic/ElasticField.jsx`**

```jsx
import { useEffect, useRef } from 'react';
import { Renderer, Geometry, Program, Mesh, Texture } from 'ogl';

const DIST = 4.6;

const VERT = `
precision highp float;
attribute vec2 aGrid;
attribute vec2 uv;
attribute vec3 aOffset;
attribute vec3 aNormal;
uniform float uTilt;
uniform float uDist;
uniform vec2 uCenter;
uniform vec2 uSize;
varying vec2 vUv;
varying vec3 vNormal;
varying float vDepth;
void main() {
  vUv = uv;
  vec2 half = uSize;
  vec2 base = vec2((aGrid.x * 2.0 - 1.0) * half.x, (1.0 - aGrid.y * 2.0) * half.y);
  vec3 p = vec3(base + aOffset.xy * half, aOffset.z * half.y);
  float ct = cos(uTilt);
  float st = sin(uTilt);
  float ry = p.y * ct - p.z * st;
  float rz = p.y * st + p.z * ct;
  p.y = ry;
  p.z = rz;
  float persp = uDist / (uDist - p.z);
  vec2 clip = vec2(uCenter.x + p.x * persp, uCenter.y + p.y * persp);
  vNormal = aNormal;
  vDepth = aOffset.z;
  gl_Position = vec4(clip, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;
varying vec2 vUv;
varying vec3 vNormal;
varying float vDepth;
uniform sampler2D tMap;
uniform float uHasImage;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uHighlight;
uniform float uShading;
uniform vec2 uRes;
uniform float uRadius;
uniform float uGrid;
uniform float uGridDensity;
uniform float uGridOpacity;
uniform vec3 uGridColor;
void main() {
  vec3 base;
  if (uHasImage > 0.5) {
    base = texture2D(tMap, vUv).rgb;
  } else {
    base = mix(uColor1, uColor2, clamp(vUv.y, 0.0, 1.0));
  }
  vec3 N = normalize(vNormal);
  vec3 L = normalize(vec3(-0.35, 0.55, 0.78));
  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 H = normalize(L + V);
  float diff = clamp(dot(N, L), 0.0, 1.0);
  float specRaw = pow(clamp(dot(N, H), 0.0, 1.0), 26.0);
  float specFlat = pow(clamp(H.z, 0.0, 1.0), 26.0);
  float spec = clamp((specRaw - specFlat) / (1.0 - specFlat), 0.0, 1.0);
  float ao = clamp(1.0 + vDepth * 0.45, 0.65, 1.25);
  vec3 lit = base * (1.0 - uShading * 0.28);
  lit += base * diff * uShading * 0.55;
  lit *= ao;
  lit += uHighlight * spec * uShading * 0.25;
  if (uGrid > 0.5) {
    vec2 g = vUv * uGridDensity;
    vec2 w = uGridDensity / max(uRes, vec2(1.0));
    vec2 d = abs(fract(g - 0.5) - 0.5) / max(w * 1.5, vec2(1e-4));
    float line = 1.0 - clamp(min(d.x, d.y), 0.0, 1.0);
    lit = mix(lit, uGridColor, line * uGridOpacity * (0.45 + diff * 0.55));
  }
  vec2 p = (vUv - 0.5) * uRes;
  vec2 halfRes = uRes * 0.5;
  float r = min(uRadius, min(halfRes.x, halfRes.y));
  vec2 q = abs(p) - (halfRes - r);
  float sd = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  float alpha = 1.0 - smoothstep(-1.25, 1.25, sd);
  if (alpha <= 0.002) discard;
  gl_FragColor = vec4(lit, alpha);
}
`;

function hexToRgb(hex) {
  let h = (hex || '').replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h || '000000', 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function readCardConfig(el) {
  const num = (v, d) => (Number.isFinite(Number(v)) ? Number(v) : d);
  return {
    image: el.dataset.image || '',
    color1: el.dataset.color1 || '#5227FF',
    color2: el.dataset.color2 || '#B19EEF',
    highlight: el.dataset.highlight || '#ffffff',
    grid: el.dataset.grid !== 'false',
    gridDensity: num(el.dataset.gridDensity, 18),
    gridOpacity: num(el.dataset.gridOpacity, 0.25),
    gridColor: el.dataset.gridColor || '#ffffff',
    radius: num(el.dataset.radius, 16),
    tilt: num(el.dataset.tilt, 0),
    shading: num(el.dataset.shading, 0.5),
    resolution: num(el.dataset.resolution, 12),
    interaction: el.dataset.interaction || 'hover',
    stiffness: num(el.dataset.stiffness, 0.05),
    damping: num(el.dataset.damping, 0.2),
    grabRadius: num(el.dataset.grabRadius, 0.6),
    pull: num(el.dataset.pull, 0.4),
    wobble: num(el.dataset.wobble, 5),
  };
}

export default function ElasticField() {
  const wrapRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(window.devicePixelRatio || 1, 2) });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    wrap.appendChild(gl.canvas);

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      transparent: true,
      cullFace: null,
      uniforms: {
        tMap: { value: null },
        uHasImage: { value: 0 },
        uColor1: { value: [0.32, 0.15, 1] },
        uColor2: { value: [0.69, 0.62, 0.94] },
        uHighlight: { value: [1, 1, 1] },
        uGrid: { value: 1 },
        uGridDensity: { value: 18 },
        uGridOpacity: { value: 0.25 },
        uGridColor: { value: [1, 1, 1] },
        uShading: { value: 0.5 },
        uRes: { value: [1, 1] },
        uRadius: { value: 16 },
        uTilt: { value: 0 },
        uDist: { value: DIST },
        uCenter: { value: [0, 0] },
        uSize: { value: [0.2, 0.2] },
      },
    });

    const cards = [];

    function createCard(el) {
      const cfg = readCardConfig(el);
      const N = Math.max(6, Math.min(40, cfg.resolution));
      const nodeCount = N * N;
      const aGrid = new Float32Array(nodeCount * 2);
      const uv = new Float32Array(nodeCount * 2);
      const aOffset = new Float32Array(nodeCount * 3);
      const aNormal = new Float32Array(nodeCount * 3);
      for (let j = 0; j < N; j++) {
        for (let i = 0; i < N; i++) {
          const idx = j * N + i;
          aGrid[idx * 2] = i / (N - 1);
          aGrid[idx * 2 + 1] = j / (N - 1);
          uv[idx * 2] = i / (N - 1);
          uv[idx * 2 + 1] = j / (N - 1);
          aNormal[idx * 3 + 2] = 1;
        }
      }
      const quads = (N - 1) * (N - 1);
      const index = new Uint16Array(quads * 6);
      let t = 0;
      for (let j = 0; j < N - 1; j++) {
        for (let i = 0; i < N - 1; i++) {
          const a = j * N + i, b = a + 1, c = a + N, d = c + 1;
          index[t++] = a; index[t++] = c; index[t++] = b;
          index[t++] = b; index[t++] = c; index[t++] = d;
        }
      }
      const geometry = new Geometry(gl, {
        aGrid: { size: 2, data: aGrid },
        uv: { size: 2, data: uv },
        aOffset: { size: 3, data: aOffset },
        aNormal: { size: 3, data: aNormal },
        index: { data: index },
      });
      const mesh = new Mesh(gl, { geometry, program });
      const texture = new Texture(gl, { generateMipmaps: false, flipY: false });

      const baseX = new Float32Array(nodeCount);
      const baseY = new Float32Array(nodeCount);
      const pos = new Float32Array(nodeCount * 3);
      const vel = new Float32Array(nodeCount * 3);
      const accel = new Float32Array(nodeCount * 3);
      for (let idx = 0; idx < nodeCount; idx++) {
        baseX[idx] = aGrid[idx * 2] * 2 - 1;
        baseY[idx] = 1 - aGrid[idx * 2 + 1] * 2;
      }

      const card = {
        el, cfg, N, nodeCount, geometry, mesh, texture,
        hasImage: 0, baseX, baseY, pos, vel, accel, aOffset, aNormal,
        rect: { left: 0, top: 0, w: 1, h: 1 },
        cx: 0, cy: 0, sx: 0.2, sy: 0.2,
        pointer: { x: 0, y: 0, active: false },
        ro: null,
      };

      if (cfg.image) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = cfg.image;
        img.onload = () => {
          texture.image = img;
          card.hasImage = 1;
        };
      }

      return card;
    }

    function updateRect(card) {
      const r = card.el.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      card.rect.left = r.left;
      card.rect.top = r.top;
      card.rect.w = r.width;
      card.rect.h = r.height;
      card.cx = ((r.left + r.width / 2) / vw) * 2 - 1;
      card.cy = 1 - ((r.top + r.height / 2) / vh) * 2;
      card.sx = r.width / vw;
      card.sy = r.height / vh;
    }

    function sync() {
      const els = Array.from(document.querySelectorAll('[data-elastic-card]'));
      const byEl = new Map(cards.map((c) => [c.el, c]));
      const next = [];
      for (const el of els) {
        let card = byEl.get(el);
        if (!card) {
          card = createCard(el);
          const ro = new ResizeObserver(() => updateRect(card));
          ro.observe(el);
          card.ro = ro;
        }
        updateRect(card);
        next.push(card);
      }
      for (const card of cards) {
        if (!els.includes(card.el)) {
          card.ro?.disconnect();
          card.geometry.dispose?.();
        }
      }
      cards.length = 0;
      cards.push(...next);
    }

    const mo = new MutationObserver(() => sync());
    mo.observe(document.body, { childList: true, subtree: true });

    function resizeRenderer() {
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    resizeRenderer();
    window.addEventListener('resize', resizeRenderer);
    sync();

    function hitTest(clientX, clientY) {
      let hit = false;
      for (const card of cards) {
        const { left, top, w, h } = card.rect;
        const inside = clientX >= left && clientX <= left + w && clientY >= top && clientY <= top + h;
        if (inside) {
          card.pointer.active = true;
          card.pointer.x = ((clientX - left) / w) * 2 - 1;
          card.pointer.y = 1 - ((clientY - top) / h) * 2;
          hit = true;
        } else {
          card.pointer.active = false;
        }
      }
      return hit;
    }

    const onMove = (e) => hitTest(e.clientX, e.clientY);
    const onLeave = () => {
      for (const card of cards) card.pointer.active = false;
    };
    window.addEventListener('pointermove', onMove);
    document.addEventListener('mouseleave', onLeave);

    const STEP = 1 / 120;
    const MAX_SUB = 5;
    let accTime = 0;
    let last = performance.now();

    function substepCard(card) {
      const c = card.cfg;
      const N = card.N;
      const s = c.stiffness;
      const retain = 1 - c.damping;
      const coupling = 0.06 + c.wobble * 0.032;
      const active = card.pointer.active && !reduceMotion;
      const r = Math.max(0.08, c.grabRadius) * 1.4;
      const invR = 1 / r;
      const force = c.pull * 0.009;
      const { pos, vel, accel, baseX, baseY } = card;
      for (let j = 0; j < N; j++) {
        for (let i = 0; i < N; i++) {
          const idx = j * N + i, o3 = idx * 3;
          const ox = pos[o3], oy = pos[o3 + 1], oz = pos[o3 + 2];
          let ax = -s * ox, ay = -s * oy, az = -s * oz;
          let sumx = 0, sumy = 0, sumz = 0, cnt = 0;
          if (i > 0) { const n = (idx - 1) * 3; sumx += pos[n]; sumy += pos[n + 1]; sumz += pos[n + 2]; cnt++; }
          if (i < N - 1) { const n = (idx + 1) * 3; sumx += pos[n]; sumy += pos[n + 1]; sumz += pos[n + 2]; cnt++; }
          if (j > 0) { const n = (idx - N) * 3; sumx += pos[n]; sumy += pos[n + 1]; sumz += pos[n + 2]; cnt++; }
          if (j < N - 1) { const n = (idx + N) * 3; sumx += pos[n]; sumy += pos[n + 1]; sumz += pos[n + 2]; cnt++; }
          ax += coupling * (sumx - cnt * ox);
          ay += coupling * (sumy - cnt * oy);
          az += coupling * (sumz - cnt * oz);
          if (active) {
            const dx = card.pointer.x - (baseX[idx] + ox);
            const dy = card.pointer.y - (baseY[idx] + oy);
            const d = Math.sqrt(dx * dx + dy * dy);
            const tnorm = d * invR;
            if (tnorm < 1) {
              const zBump = 1 - tnorm * tnorm;
              az += force * zBump * zBump * 6.0;
              if (d > 1e-4) {
                const pinch = tnorm * (1 - tnorm) * (1 - tnorm) * 6.75;
                const dir = (force * pinch * 1.6) / d;
                ax += dx * dir;
                ay += dy * dir;
              }
            }
          }
          accel[o3] = ax; accel[o3 + 1] = ay; accel[o3 + 2] = az;
        }
      }
      for (let k = 0; k < card.nodeCount; k++) {
        const o3 = k * 3;
        const nvx = (vel[o3] + accel[o3]) * retain;
        const nvy = (vel[o3 + 1] + accel[o3 + 1]) * retain;
        const nvz = (vel[o3 + 2] + accel[o3 + 2]) * retain;
        vel[o3] = nvx; vel[o3 + 1] = nvy; vel[o3 + 2] = nvz;
        pos[o3] = Math.max(-1.2, Math.min(1.2, pos[o3] + nvx));
        pos[o3 + 1] = Math.max(-1.2, Math.min(1.2, pos[o3 + 1] + nvy));
        pos[o3 + 2] = Math.max(-1.2, Math.min(1.2, pos[o3 + 2] + nvz));
      }
    }

    function commitCard(card) {
      const { pos, aOffset, aNormal, baseX, baseY, N } = card;
      for (let j = 0; j < N; j++) {
        for (let i = 0; i < N; i++) {
          const idx = j * N + i, o3 = idx * 3;
          const iL = i > 0 ? idx - 1 : idx, iR = i < N - 1 ? idx + 1 : idx;
          const iD = j > 0 ? idx - N : idx, iU = j < N - 1 ? idx + N : idx;
          const lx = baseX[iL] + pos[iL * 3], ly = baseY[iL] + pos[iL * 3 + 1], lz = pos[iL * 3 + 2];
          const rx = baseX[iR] + pos[iR * 3], ry = baseY[iR] + pos[iR * 3 + 1], rz = pos[iR * 3 + 2];
          const dx = baseX[iD] + pos[iD * 3], dy = baseY[iD] + pos[iD * 3 + 1], dz = pos[iD * 3 + 2];
          const ux = baseX[iU] + pos[iU * 3], uy = baseY[iU] + pos[iU * 3 + 1], uz = pos[iU * 3 + 2];
          const txx = rx - lx, txy = ry - ly, txz = rz - lz;
          const tyx = ux - dx, tyy = uy - dy, tyz = uz - dz;
          let nx = txy * tyz - txz * tyy;
          let ny = txz * tyx - txx * tyz;
          let nz = txx * tyy - txy * tyx;
          if (nz < 0) { nx = -nx; ny = -ny; nz = -nz; }
          const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
          aNormal[o3] = nx / len; aNormal[o3 + 1] = ny / len; aNormal[o3 + 2] = nz / len;
          aOffset[o3] = pos[o3]; aOffset[o3 + 1] = pos[o3 + 1]; aOffset[o3 + 2] = pos[o3 + 2];
        }
      }
      card.geometry.attributes.aOffset.needsUpdate = true;
      card.geometry.attributes.aNormal.needsUpdate = true;
    }

    function renderCard(card) {
      const c = card.cfg;
      program.uniforms.uColor1.value = hexToRgb(c.color1);
      program.uniforms.uColor2.value = hexToRgb(c.color2);
      program.uniforms.uHighlight.value = hexToRgb(c.highlight);
      program.uniforms.uGrid.value = c.grid ? 1 : 0;
      program.uniforms.uGridDensity.value = c.gridDensity;
      program.uniforms.uGridOpacity.value = c.gridOpacity;
      program.uniforms.uGridColor.value = hexToRgb(c.gridColor);
      program.uniforms.uShading.value = c.shading;
      program.uniforms.uRadius.value = c.radius;
      program.uniforms.uTilt.value = (c.tilt * Math.PI) / 180;
      program.uniforms.uRes.value = [card.rect.w, card.rect.h];
      program.uniforms.uCenter.value = [card.cx, card.cy];
      program.uniforms.uSize.value = [card.sx, card.sy];
      program.uniforms.tMap.value = card.texture;
      program.uniforms.uHasImage.value = card.hasImage;
      renderer.render({ scene: card.mesh });
    }

    let raf = 0;
    function frame(now) {
      raf = requestAnimationFrame(frame);
      let dt = (now - last) / 1000;
      last = now;
      if (dt > 0.25) dt = 0.25;
      accTime += dt;
      let sub = 0;
      while (accTime >= STEP && sub < MAX_SUB) {
        for (const card of cards) substepCard(card);
        accTime -= STEP;
        sub++;
      }
      if (accTime > STEP) accTime = 0;
      for (const card of cards) commitCard(card);

      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.clear(gl.COLOR_BUFFER_BIT);
      for (const card of cards) renderCard(card);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      window.removeEventListener('resize', resizeRenderer);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      for (const card of cards) card.ro?.disconnect();
      if (gl.canvas.parentElement === wrap) wrap.removeChild(gl.canvas);
      const lose = gl.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
    };
  }, []);

  return <div ref={wrapRef} className="elastic-field pointer-events-none fixed inset-0 z-10" />;
}
```

- [ ] **Step 2: 还原 HeroCard（移除原版 ElasticMesh）**

把 Task 8 中临时插入的 `<ElasticMesh … />` 层删除，并移除 `import ElasticMesh`，恢复为纯 HTML 结构（`data-elastic-card` 已在 Task 6 就位）。

- [ ] **Step 3: 在 `App.jsx` 挂载 ElasticField**

在背景层之后、内容层之前插入：

```jsx
<ElasticField />
```

并加入 import：

```jsx
import ElasticField from './components/elastic/ElasticField';
```

- [ ] **Step 4: 验证**

```bash
npm run dev
```

Expected：Hero 卡 + 5 张 KPI 卡全部是弹性卡（渐变/封面 + 圆角 + 网格叠加 + 悬停鼓起高光），仅一个 WebGL 上下文（可在 DevTools 检查 canvas 数量为 1）。文字正常浮在卡表面之上。

- [ ] **Step 5: 提交**

```bash
git add gaming-portfolio/src/components/elastic/ElasticField.jsx gaming-portfolio/src/components/HeroCard.jsx gaming-portfolio/src/App.jsx
git commit -m "feat: render all elastic cards on a shared webgl context"
```

---

### Task 10: 收尾 —— 全量测试、构建、部署说明、README

**Files:**
- Create: `gaming-portfolio/README.md`
- Create: `gaming-portfolio/public/images/README.md`（照片放置说明）
- Modify: `gaming-portfolio/package.json`（添加 test 脚本）

**Interfaces:**
- Consumes: 全部已完成组件
- Produces: 可部署的 `dist/`；可一键跑测试的 `npm test`。

- [ ] **Step 1: 在 `package.json` 添加脚本**

在 `"scripts"` 里加入：

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 2: 全量测试**

```bash
npm test
```

Expected：全部测试（games + GameTabs + MatchList + KpiGrid）PASS。

- [ ] **Step 3: 生产构建**

```bash
npm run build
npm run preview
```

Expected：`npm run build` 无报错产出 `dist/`；`npm run preview` 打开静态站点，背景漂移、弹性卡、Tab 切换均正常。

- [ ] **Step 4: 写 `public/images/README.md`**

```markdown
# 图片放置说明

把截图/封面放进对应子目录，然后在 `src/data/games.json` 里把 `cover` 和 `highlights`
里的 `https://picsum.photos/...` 占位地址替换为本地路径，例如：

- 封面：`/images/valorant/cover.jpg`
- 背景瓦片：`/images/valorant/1.jpg`

建议尺寸：
- 封面（Hero 弹性卡）：1200×800
- 背景瓦片（DriftWall）：600×400

格式用 webp 或 jpg（webp 更小）。目录结构：

    public/images/
      delta/     # 三角洲行动
      valorant/  # 无畏契约
      hok/       # 王者荣耀
```

- [ ] **Step 5: 写 `README.md`**

```markdown
# 个人电竞战绩作品集

单页静态站：DriftWall 动态背景 + ElasticMesh 弹性卡片 + 毛玻璃对局列表。

## 技术栈

React 18 · Vite · Tailwind CSS v4 · Framer Motion · lucide-react · ogl (WebGL)

## 本地开发

    npm install
    npm run dev

## 测试

    npm test

## 构建

    npm run build   # 产出 dist/
    npm run preview # 本地预览产物

## 数据维护

所有战绩在 `src/data/games.json` 手动维护。新增游戏 = 新增一条游戏对象 + 图片，无需改代码。

## 图片

截图/封面放入 `public/images/{game}/`，并在 `games.json` 里引用本地路径（见 `public/images/README.md`）。
```

- [ ] **Step 6: 提交**

```bash
cd "F:/CODE/GIT/主页设计"
git add -A
git commit -m "docs: add readme and finalize build"
```

---

## 自检记录

- **Spec 覆盖**：DriftWall 背景（T7）、ElasticMesh/ElasticField 弹性卡（T8/T9）、毛玻璃对局列表（T4）、KPI 卡（T5）、Tab 切换（T3/T6）、数据模型（T2）、暗色冷调主题（T1）、reduced-motion（组件内置 + T9 物理禁用）、部署（T10）。
- **占位符**：无 TBD/TODO；每个代码步骤都有完整源码。
- **类型/命名一致性**：`getSite/getGames/getGameById/getDefaultGame/getIcon/getResultMeta` 在 T2 定义、后续任务按此引用；游戏 id `delta-force/valorant/hok`、`result` 枚举 `win/loss/draw` 全程一致；`data-elastic-card` 由 T5/T6 写入、T9 读取。
- **已知重建项**：`DriftWall.css` 为按组件 class 名重建（用户仅提供 JSX），交付时若漂移/抬升细节与原版有差异，按视觉微调 CSS 变量即可。
