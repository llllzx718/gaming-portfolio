# 个人电竞战绩作品集

单页静态站：DriftWall 动态背景 + ElasticMesh 弹性卡片 + 毛玻璃对局列表。

## 技术栈

React 19 · Vite · Tailwind CSS v4 · Framer Motion · lucide-react · ogl (WebGL)

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
