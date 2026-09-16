# 独立域名部署

- 域名目标：https://linksourcegames.com/
- 仓库：https://github.com/jinhekk777/linksource-studio
- 原 GitHub Pages 地址：https://jinhekk777.github.io/linksource-studio/（重定向到独立域名）
- 域名适配已合入 main：49d8429。
- 自动部署已成功：https://github.com/jinhekk777/linksource-studio/actions/runs/35068667897

## 当前状态

2026-09-16 已完成域名切换。注册局状态为 active，DNS 为 DNS19.HICHINA.COM / DNS20.HICHINA.COM。阿里云五条网站解析已启用，Google、Cloudflare 和 GitHub Pages DNS 健康检查均通过。

HTTP 网站已经可用；HTTPS 证书仍在 GitHub 签发中，尚未启用 Enforce HTTPS。2026-09-16 已按 GitHub 官方指引重新保存同一自定义域名，重新触发证书签发。

已通过 32 项在线检查，包括 16 个中英文内容页、2 个旧入口跳转、11 个图片/视频资源、www 与原 GitHub 地址的跳转，以及 404。

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
