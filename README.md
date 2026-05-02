# Animal Island New Tab

一个基于 WXT、React 和 animal-island-ui 开发的动物森友会风格浏览器新标签页插件。

## 功能

- 新标签页替换：打开浏览器新标签页时展示自定义页面。
- 时间组件：支持 12 小时制和 24 小时制。
- 日期组件：展示当前年月日、星期和农历日期。
- 天气组件：基于 Open-Meteo 获取天气、温度、湿度和定位信息。
- 搜索栏：支持 Google、Bing、百度和 DuckDuckGo。
- 快捷方式：支持自定义快捷方式、分页展示、拖拽排序、编辑和删除。
- 设置侧边栏：支持页面配置、配置导入和 JSON 导出。
- 配置持久化：所有配置会保存到 `localStorage`。

## 技术栈

- WXT
- React
- TypeScript
- Tailwind CSS
- Zustand
- animal-island-ui
- lucide-react
- dnd-kit

## 开发

安装依赖：

```bash
pnpm install
```

启动 Chrome 开发模式：

```bash
pnpm dev
```

启动 Firefox 开发模式：

```bash
pnpm dev:firefox
```

类型检查：

```bash
pnpm compile
```

## 浏览器调试

Chrome / Chromium：

1. 运行 `pnpm dev`
2. 打开 `chrome://extensions`
3. 开启「开发者模式」
4. 点击「加载已解压的扩展程序」
5. 选择 `.output/chrome-mv3-dev`
6. 打开新标签页进行调试

Firefox：

1. 运行 `pnpm dev:firefox`
2. 打开 `about:debugging#/runtime/this-firefox`
3. 加载生成的开发扩展

## 构建

构建 Chrome 版本：

```bash
pnpm build
```

构建 Firefox 版本：

```bash
pnpm build:firefox
```

打包 Chrome 版本：

```bash
pnpm zip
```

打包 Firefox 版本：

```bash
pnpm zip:firefox
```

## 配置说明

当前配置存储在 `localStorage` 中，key 为：

```text
animal-cross-newtab-config
```

主要配置项包括：

- `backgroundColor`：页面背景颜色
- `clockFormat`：时间制，支持 `12h` 和 `24h`
- `enableDate`：是否显示日期组件
- `enableWeather`：是否显示天气组件
- `weatherLocationMode`：天气定位模式，支持 `manual` 和 `auto`
- `manualWeatherLocation`：手动天气位置
- `searchEngine`：默认搜索引擎
- `bookmarkItems`：快捷方式列表

可在右下角设置按钮中修改部分配置，也可以通过「配置同步」导入或导出 JSON 配置。

## 天气数据

天气数据使用 Open-Meteo：

- `https://api.open-meteo.com/*`
- `https://geocoding-api.open-meteo.com/*`

自动定位模式会请求浏览器定位权限。手动定位模式会使用配置中的城市名称和经纬度。

## 项目结构

```text
entrypoints/
  newtab/
    App.tsx
    store.ts
    components/
      BookMark/
      Calendar/
      CardWithTitle/
      Clock/
      SearchBar/
      SettingsSidebar/
      Weather/
    hooks/
      useOpenWeather.ts
```

## 注意事项

- 新标签页功能通过 `chrome_url_overrides.newtab` 启用。
- 如果修改了 `wxt.config.ts` 中的权限或 host permissions，需要重新加载扩展。
- `localStorage` 中已有旧配置时，新字段会使用默认配置兜底。
