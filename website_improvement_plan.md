# 个人主页改进计划

## 背景
基于对你当前网站 (www.zhengyangwan.com) 的全面分析，以及与同领域优秀博士生主页（如 Zilin Huang、Pushkal Mishra 等）和学术网站设计最佳实践的对比研究，提出以下改进建议，按优先级排序。

---

## 优先级 1：清理与打磨（快速见效）

### 1.1 删除模板残留内容
网站中仍有大量 al-folio 默认内容，显得不够专业：
- **`_news/announcement_2.md`**：默认示例公告 → 删除
- **`_posts/` 下 30 个文件**：全部是默认演示博客文章（2015-2024）→ 全部删除
- **`_projects/4_project.md` 到 `9_project.md`**：模板项目 → 全部删除（虽然因分类过滤被隐藏了，但仍然占据仓库空间）
- **`_pages/profiles.md`**：仍是 Einstein 占位符 → 保持隐藏或自定义
- **`_pages/teaching.md`**：仍是占位文字 → 添加真实内容或保持隐藏

### 1.2 移除"开发中"提示
首页底部的黄色提示框 "This website is still under development" 给访客留下负面第一印象。研究表明**访客平均在你的网站上只停留约 30 秒**——这条提示暗示网站还没准备好。建议直接删除。学术网站本身就是持续更新的，无需特别声明。

### 1.3 修正过时信息
- **`_config.yml`**：博客名称仍为 "al-folio"，描述仍为 "a simple whitespace theme for academics" → 即使博客隐藏，这些信息也会出现在 HTML metadata/SEO 中，应更新

### 1.4 移除冗余下拉菜单
导航栏中 nav_order 为 8 的 "submenus" 下拉菜单，重复了已在主导航栏中的 Publications 和 Projects，还添加了未启用的 Blog。**建议移除**，避免混淆。
- 文件：`_pages/dropdown.md` → 设置 `nav: false` 或删除

---

## 优先级 2：内容增强

### 2.1 增加专门的研究页面
**现状问题**：你的研究兴趣在首页仅以 3 个 bullet point 列出，过于简略。优秀博士生主页（如 Zilin Huang）通常有专门的 Research 页面，包含：
- **研究愿景陈述**（2-3 段，阐述你的总体研究叙事和想解决的问题）
- **研究方向**（配有简要描述和代表性图片）
- 你的论文如何关联到各个研究方向

**建议操作**：创建 `_pages/research.md`，设置 `nav: true, nav_order: 1.5`（位于 About 和 Publications 之间），或者丰富首页的 bio 部分。

### 2.2 丰富项目页面
- **VRU 项目** (`_projects/VRU.md`)：当前跳转到 unsplash.com（一个图库网站！）→ 添加真实内容或删除此项目
- **SkyDrive 项目** (`_projects/skydrive.md`)：内容不错，可以添加演示视频、GIF 或更多可视化内容
- 每个项目应包含：问题陈述、方法、结果/演示、代码/论文链接

### 2.3 补全论文字段
- **`zhengyang2024vtt`**（VTT 论文）：缺少 `google_scholar_id` → 添加 `google_scholar_id={zYLM7Y9cAGgC}` 以显示引用徽章
- 考虑为新的 DriveVLM-RL 论文添加 `html` 或 `url` 字段（当有项目主页时）

### 2.4 丰富首页简介
你的简介功能上可以，但与顶尖博士生网站相比还有提升空间：
- 在开头添加一句**研究愿景**（如 "My research aims to build safe, human-centered autonomous driving systems that understand and collaborate with humans in complex traffic environments."）
- "Hello there!🤺" 开场体现了个性，但可以考虑在更专业的开场白之后再展开细节
- 考虑简要提及关键成就（如论文总数、SkyDrive 的 GitHub Stars 等）

---

## 优先级 3：视觉设计改进

### 3.1 使用圆形头像
当前设置 `image_circular: false` → 大多数专业学术网站使用**圆形裁剪头像**。当前照片较为休闲（标注 "Chicago, US, 2025"）。建议：
- 使用更专业的头像照片（或裁剪当前照片）
- 在 `_pages/about.md` 中设置 `image_circular: true`
- 移除或缩短图片说明——"Chicago, US, 2025" 对学术展示没有价值

### 3.2 改进分节标题
当前使用 `h6` 标题配红色下划线装饰，视觉上尚可但字号偏小。建议：
- 对 "Recent News" 和 "Selected Publications" 使用 `h2` 或 `h3` 级别标题
- 可在标题旁添加图标（如 📰 Recent News、📄 Selected Publications）

### 3.3 ClustrMaps 访问统计位置
首页底部的访问统计小部件（缩放至 70%）在主页面上显得突兀。建议：
- **移至页脚**或单独的页面
- **替换为更小巧的徽章式计数器**
- 或直接移除——大多数顶尖学术网站不在首页显示访问计数

### 3.4 论文预览图
你的论文预览图不错，但可以更一致：
- 确保所有论文都有预览图（新增的 DriveVLM-RL 已有 ✓）
- 使用一致的宽高比
- 考虑为重要论文使用**动画 GIF**（如 Zilin Huang 的网站那样）使其更吸引眼球

---

## 优先级 4：功能增强

### 4.1 启用 Open Graph 和 Schema.org 元数据
当前两者均禁用（`serve_og_meta: false`、`serve_schema_org: false`）。**强烈建议启用**——这会大幅改善你的网站在 Twitter、LinkedIn、微信、Slack 等平台分享时的展示效果，你的论文和项目会显示富预览（含图片和描述）。
- `_config.yml`：设置 `serve_og_meta: true` 和 `serve_schema_org: true`

### 4.2 添加网站分析
当前没有配置任何分析工具。建议添加 Google Analytics 或隐私友好的替代方案（如 Plausible、Umami），以了解哪些论文和页面获得最多流量。

### 4.3 考虑添加 Talks/报告页面
如果你做过演讲或海报展示（如你 News 中提到的 "Sky-Drive poster at 2025 Safety Mobility Conference"），一个专门的 Talks 页面（配幻灯片/视频）能增强学术可信度。

### 4.4 博客策略
你有博客基础设施但未启用，且保留了 30 篇演示文章。两个选项：
- **方案 A（推荐）**：删除所有演示文章，保持博客隐藏，待有真实内容（研究总结、教程、会议见闻）时再启用
- **方案 B**：现在就开始发布——即使 1-2 篇研究总结文章也能带来流量并展示沟通能力

---

## 优先级 5：细节润色

### 5.1 Favicon 网站图标
当前使用 emoji `🧐` 作为 favicon。建议：
- 制作一个带有你名字缩写 "ZW" 的自定义 favicon，更显专业
- 或者如果 emoji 符合你的个人品牌，保持不变也可以

### 5.2 配色方案
你使用 UW-Madison 红色 (`#c5050c`) 作为主题色是很好的品牌选择，青蓝色悬停效果 (`#0099cc`) 与之互补。整体配色无需大改。小建议：
- 引用框黄色背景 (`#fffacd`) 配红色边框视觉冲击较强，考虑是否所有引用框都需要这么突出

### 5.3 CV 页面
- 更新 PDF 文件名引用，从 `CV_ZhengyangWan_2412.pdf` 更新为最新版本（如有）
- 确认 PDF 文件存在且内容是最新的

### 5.4 页脚
固定页脚中 "Powered by Jekyll with al-folio theme" 是标准做法。可以考虑添加一句个性化文字如 "Built with ❤️ at UW-Madison"，但这非常可选。

---

## 总结：推荐实施顺序

| 步骤 | 类别 | 影响 | 工作量 |
|------|------|------|--------|
| 1 | 移除"开发中"提示 | 高 | 1 分钟 |
| 2 | 删除模板残留（演示文章、项目、公告） | 高 | 10 分钟 |
| 3 | 移除冗余下拉菜单 | 中 | 1 分钟 |
| 4 | 修正过时信息（resume.json、config 元数据） | 中 | 5 分钟 |
| 5 | 启用 Open Graph 和 Schema.org | 中 | 1 分钟 |
| 6 | 为 VTT 论文添加 `google_scholar_id` | 低 | 1 分钟 |
| 7 | 改为圆形头像 | 中 | 1 分钟 |
| 8 | 移动/移除首页 ClustrMaps | 低 | 5 分钟 |
| 9 | 修复 VRU 项目（移除 unsplash 跳转） | 中 | 5 分钟 |
| 10 | 添加 Research 页面（需要撰写内容） | 高 | 30+ 分钟 |
| 11 | 丰富首页简介（添加研究愿景） | 中 | 15 分钟 |

## 涉及的关键文件
- `_pages/about.md` — 首页内容和头像设置
- `_layouts/about.liquid` — 首页布局（ClustrMaps、分节顺序）
- `_config.yml` — 网站元数据、OG/Schema、博客名称
- `assets/json/resume.json` — CV 数据（地址更新）
- `_bibliography/papers.bib` — 论文条目（缺失的 google_scholar_id）
- `_pages/dropdown.md` — 冗余下拉菜单
- `_news/announcement_2.md` — 模板公告待删除
- `_posts/*.md` — 30 篇演示文章待删除
- `_projects/4-9_project.md` — 模板项目待删除

## 参考资源
- [Berkeley: Personal Academic Webpages Tips](https://townsendcenter.berkeley.edu/blog/personal-academic-webpages-how-tos-and-tips-better-site)
- [Rice: How to Make Your Own Academic Website](https://graduate.rice.edu/news/current-news/how-make-your-own-academic-website)
- [The Academic Designer: 35 Page Ideas](https://theacademicdesigner.com/2025/35-page-ideas-for-your-academic-personal-website/)
- [2025 Best Academic Websites Contest Winners](https://theacademicdesigner.com/2025/winners-of-the-best-personal-academic-websites-contest-2025/)
- [Zilin Huang 个人主页](https://www.huang-zilin.com/) — 同实验室博士生，优秀参考
- [Pushkal Mishra 个人主页](https://pushkalm11.github.io/) — 自动驾驶方向，简洁设计
