# LINK SOURCE STUDIO

LINK SOURCE STUDIO 官网，基于 Astro 静态生成，包含中英文首页、作品列表、项目详情、关于我们和合作信息。采用原生滚动、项目进度提示、视频背景和像素指针。

展示项目：机甲 VR 游戏概念占位、钟馗捉鬼图、陶寺：一脉千秋、爆笑虫子：梦幻乐园。已完成的三个项目提供全流程制作介绍；机甲页面明确标注概念示意。商务联系方式为占位。

## 开发与构建

需要 Node.js 24 或更高版本。首次运行 npm ci 安装锁定的依赖。

- npm run dev：开发预览。
- npm run check：Astro / TypeScript 检查。
- npm run build：本地根路径构建。
- npm run verify：校验页面、语言切换、媒体、字体和链接。
- npm run build:pages：构建并校验 GitHub Pages 版本。
- npm run preview：预览构建结果，默认端口 4174。

GitHub Pages 目标地址：https://jinhekk777.github.io/linksource-studio/ 。正式发布状态见仓库 Actions 和 Settings → Pages。参阅 [部署说明](docs/deployment.md)。

## 维护

- src/content/projects/ 与 src/data/projects-localized.ts：项目和中英文内容。
- src/data/studio.ts：工作室与商务信息。
- src/views/、src/layouts/Layout.astro：页面、导航和语言入口。
- src/styles/newbee.css、src/styles/studio-motion.css：布局与动效。
- src/scripts/newbee.ts：首页进度、视频、导航与弹窗。
- src/data/urls.ts：托管子路径。
- public/：本地字体、标志和优化后的项目媒体。

项目停留长度由 --home-dwell-distance 控制。用户启用减少动态效果时，背景视频不自动播放。网站没有购票、支付、登录或消息接收后台。

历史设计截图、原始生成文件、依赖、缓存和退役项目媒体不进入仓库。构建排除退役媒体。网站运行不依赖旧站图片服务器。概念图来源见 [generation.md](docs/mecha-preview/generation.md)。
