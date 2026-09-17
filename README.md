# LINK SOURCE STUDIO

LINK SOURCE STUDIO 官网，基于 Astro 静态生成，包含中英文首页、作品列表、项目详情、关于我们和合作信息。采用原生滚动、项目进度提示、视频背景和像素指针。

展示项目：机甲 VR 游戏概念占位、钟馗捉鬼图、陶寺：一脉千秋、爆笑虫子：梦幻乐园。已完成的三个项目提供全流程制作介绍；机甲页面明确标注概念示意。商务联系方式为占位。

## 开发与构建

需要 Node.js 24 或更高版本。首次运行 npm ci 安装锁定的依赖。

- npm run dev：开发预览。
- npm run check：Astro / TypeScript 检查。
- npm run build：本地根路径构建。
- npm run verify：校验页面、语言切换、媒体、字体和链接。
- npm run verify:live：检查正式域名的页面、媒体、搜索文件、404 和 HTTPS 跳转，输出 qa/live-check.json。
- npm run build:pages：构建并校验 GitHub Pages 版本。
- npm run preview：预览构建结果，默认端口 4174。

正式官网：https://linksourcegames.com/ 。GitHub Pages 自定义域名与强制 HTTPS 已启用；推送 main 后自动检查、构建、部署，再验证线上页面。参阅 [部署说明](docs/deployment.md)。

## 搜索与上线检查

构建自动生成 robots.txt 和 sitemap.xml，包含所有公开项目的中英文页面，排除错误页与旧入口。页面提供 canonical、自身与对应语言的 hreflang、Open Graph / Twitter 分享信息；首页提供工作室与网站的结构化数据。本地未设置 PUBLIC_SITE_URL 时禁止索引，不发布 localhost 站点地图。

Actions 中的 Check live website 可以手动检查线上状态；Deploy website 每次部署成功后也会检查。检查不采集访客数据、不等同于持续可用性监控。访客统计和 Google / 百度平台验证仍待账号准备后接入；提交站点地图不保证即时收录。

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
