# 独立域名部署

- 域名目标：https://linksourcegames.com/
- 仓库：https://github.com/jinhekk777/linksource-studio
- 原 GitHub Pages 地址：https://jinhekk777.github.io/linksource-studio/（重定向到独立域名）
- 域名适配已合入 main：49d8429。
- 自动部署已成功：https://github.com/jinhekk777/linksource-studio/actions/runs/35068667897

## 当前状态

2026-09-16 已完成域名切换。注册局状态为 active，DNS 为 DNS19.HICHINA.COM / DNS20.HICHINA.COM。阿里云五条网站解析已启用，Google、Cloudflare 和 GitHub Pages DNS 健康检查均通过。

2026-09-16 22:06（北京时间）已确认 HTTPS 证书签发成功，覆盖 linksourcegames.com 与 www.linksourcegames.com。已启用 Enforce HTTPS，HTTP 自动跳转到 HTTPS，www 自动跳转到主域名；仓库官网链接已更新为 https://linksourcegames.com/。

HTTPS 上线后已通过 35 项在线检查，包括 16 个中英文内容页、2 个旧入口跳转、11 个图片/视频资源、样式文件、根域名与 www 的 HTTP 跳转、www 的 HTTPS 跳转、原 GitHub 地址的跳转，以及 404。浏览器已正常打开正式官网，内容页未发现 HTTP 图片或视频引用。

## 搜索与日常维护

2026-09-17 补齐搜索引擎入口：/robots.txt 指向 /sitemap.xml，站点地图随公开项目更新，包含 16 个中英文内容页，不包含 404 或旧入口。页面提供完整的语言对应关系、分享标题与图片；首页提供工作室和网站的结构化数据。搜索平台账号尚未接入，未提交 Google 或百度验证，也未启用访客统计。

每次 Deploy website 发布后会运行 verify-live 检查页面、媒体、站点地图、404 和 HTTPS 跳转；也可在 Actions → Check live website → Run workflow 手动执行。失败记录显示在运行日志和摘要中，通知取决于 GitHub 账号的 Actions 通知设置。当前没有定时巡检或外部告警服务。

本地执行 npm run verify:live，结果写入 qa/live-check.json。VERIFY_SITE_URL 可指定未来迁移后的检查地址。发布前的构建校验会检查中英文语言关系、站点地图覆盖、分享图片、404 禁止收录，并验证无正式域名的本地构建不会生成可抓取地址。

响应式验收覆盖 320、390、1440 像素宽度下的 16 个中英文内容页，共 48 组页面检查；菜单开关、首页项目切换、语言切换和影片播放也已检查。此结果来自桌面浏览器尺寸模拟，不代表微信内置浏览器、iOS 或国内移动网络的实机验收。

## 阿里云解析

以下记录已在云解析 DNS → 公网权威解析 → linksourcegames.com → 解析设置中保存。线路为默认，TTL 为 10 分钟（600 秒）。

| 类型 | 主机记录 | 记录值 |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | jinhekk777.github.io |

A 记录可以按四条添加；新版控制台也可在一条 A 记录的记录值集合里加入四个地址。www 不带仓库路径。仅调整根域名和 www 的网站解析；已有邮件等其他记录应保留。

## 切换步骤（供后续维护参考）

1. 确认阿里云解除 clientHold，并确认已有 DNS 记录。
2. 在 GitHub Pages 设置中将 Custom domain 设为 linksourcegames.com，再提交上述 DNS 配置。
3. 将域名适配合入 main 并推送，等待 GitHub Actions 成功部署根路径版本。
4. 等待 GitHub DNS 检查和 HTTPS 证书就绪，开启 Enforce HTTPS。
5. 检查根域名、www 跳转、中英文项目页、视频、404 和原 GitHub Pages 地址的跳转。

public/CNAME 记录预期域名；当前使用 GitHub Actions 发布，仍必须设置 Pages 的 Custom domain，CNAME 文件本身不会完成绑定。

## 验证与回退

运行 npm run check 和 npm run build:pages。当前生产 site 为 https://linksourcegames.com、base 为 /，本地开发也使用根路径。

若切换后出现域名或证书问题，恢复 GitHub Pages Custom domain 为空，并重新部署先前 main 版本；默认 GitHub 地址需要旧版 /linksource-studio 基础路径。

参考：[GitHub 域名设置](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) · [阿里云暂停解析处理](https://help.aliyun.com/zh/dws/support/how-to-unlock-a-domain-name-that-is-in-the-serverhold-or-clienthold-state) · [阿里云添加解析](https://help.aliyun.com/zh/dns/pubz-add-parsing-record)
