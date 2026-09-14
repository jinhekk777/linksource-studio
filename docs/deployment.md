# GitHub Pages 部署

- 仓库：https://github.com/jinhekk777/linksource-studio
- 网站目标地址：https://jinhekk777.github.io/linksource-studio/
- 工作流：.github/workflows/deploy.yml
- 构建：npm run check，然后 npm run build:pages

## 首次发布

上传到 main 后，在 Settings → Pages → Build and deployment 将 Source 设为 GitHub Actions。每次 main 更新或手动运行工作流都会检查、构建和发布。首次未开启 Pages 时部署可能失败，开启后重新运行即可。

仓库可见性决定源码与媒体是否公开；GitHub Pages 网站用于对外展示。免费个人方案通常需要公开仓库使用 Pages。保留私有仓库时需确认账号支持私有仓库 Pages。

## 本地复现

运行 npm run build:pages 后，预览时设置 PUBLIC_SITE_URL=https://jinhekk777.github.io 和 PUBLIC_BASE_PATH=/linksource-studio，然后运行 npm run preview。访问 http://127.0.0.1:4174/linksource-studio/ 。正常本地开发不需要设置这两个变量。

## 自定义域名

完成域名与 DNS 配置后，在 public/CNAME 中写入域名。将 build-pages.mjs 默认 PUBLIC_SITE_URL 改为该 HTTPS 域名、PUBLIC_BASE_PATH 改为 /，重新构建和部署。

## 内容与媒体

发布使用本地项目图片与压缩视频，不依赖旧站 HTTP 海报。原始素材、评审截图与山神熊猫媒体保留在本地；.gitignore 排除上传，构建钩子排除退役媒体。联系方式继续保留占位，机甲概念图明确标注非实机画面。

参考：[Astro 部署指南](https://docs.astro.build/en/guides/deploy/github/) · [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)

## 已完成的本地验证

2026-09-14：Astro 检查 65 个文件，0 错误、0 警告；部署构建 20 个页面、364 条本地链接、194 条媒体与脚本引用通过校验。部署子路径上的 48 项页面/视口检查及滚动、触摸、语言切换、返回、菜单、影片和减少动态效果通过。

当前发布文件约 57.4 MiB。
