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
