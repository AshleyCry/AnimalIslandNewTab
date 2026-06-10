# Animal Island New Tab

一个基于 WXT、React 和 animal-island-ui 开发的动物森友会风格浏览器新标签页插件。

chrome 插件地址：https://chromewebstore.google.com/detail/animal-island-new-tab/fbjccmnikphgnefincllnfhkjkcndjia

预览页面：https://ashleycry.github.io/AnimalIslandNewTab

## 功能

- 新标签页替换：打开浏览器新标签页时展示自定义页面。
- 时间组件：支持 12 小时制和 24 小时制。
- 日期组件：展示当前年月日、星期和农历日期。
- 天气组件：基于 Open-Meteo 获取天气、温度、湿度、定位和空气质量信息。
- 天气详情侧边栏：点击天气卡片可查看当前天气、未来 24 小时天气、近 15 日天气、紫外线、体感温度、风力、日出日落、气压等详情。
- 背景设置：支持纯色背景、预设图片背景和本地自定义图片背景。
- 快捷方式：支持自定义快捷方式、分页展示、编辑和删除。
- 快捷方式图标缓存：获取到的 favicon 会缓存到 IndexedDB，后续打开页面时优先使用本地缓存。
- 设置侧边栏：支持页面配置、配置导入和 JSON 导出。

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

- `backgroundType`：背景类型，支持 `color` 和 `image`
- `backgroundColor`：页面背景颜色
- `backgroundPresetImage`：当前选中的预设图片背景 ID；选择自定义图片时值为 `custom`
- `clockFormat`：时间制，支持 `12h` 和 `24h`
- `enableDate`：是否显示日期组件
- `enableWeather`：是否显示天气组件
- `weatherLocationMode`：天气定位模式，支持 `manual` 和 `auto`
- `manualWeatherLocation`：手动天气位置
- `searchEngine`：默认搜索引擎
- `bookmarkItems`：快捷方式列表

可在右下角设置按钮中修改部分配置，也可以通过「配置同步」导入或导出 JSON 配置。

自定义背景图片不会写入 JSON 配置文件，而是保存到 IndexedDB。导入或导出配置时只会同步背景类型和图片选择状态，不会同步本地上传的图片文件。

## 本地缓存

项目使用 IndexedDB 保存运行时产生的二进制数据：

- `animal-cross-newtab-background`：用户上传的自定义背景图片
- `animal-cross-newtab-favicons`：快捷方式 favicon 缓存

这些缓存不会进入配置导出文件。清理浏览器站点数据或扩展数据会删除这些本地缓存。

## 天气数据

天气数据使用 Open-Meteo：

- `https://api.open-meteo.com/*`
- `https://air-quality-api.open-meteo.com/*`
- `https://geocoding-api.open-meteo.com/*`

自动定位模式会请求浏览器定位权限。手动定位模式会使用配置中的城市名称和经纬度。

天气卡片和天气详情共用同一次数据加载。
快捷方式 favicon 会尝试从以下来源获取：

- `https://www.google.com/s2/favicons`
- `https://icons.duckduckgo.com/ip3`
- `https://favicon.im`
- 目标网站自身的 `apple-touch-icon` / `favicon.ico`

## 项目结构

```text
entrypoints/
  newtab/
    App.tsx
    backgroundPresets.ts
    customBackgroundImage.ts
    store.ts
    components/
      BookMark/
        favicon.ts
        useBookmarkFavicon.ts
      Calendar/
      CardWithTitle/
      Clock/
      SearchBar/
      SettingsSidebar/
      Sidebar/
      Weather/
        WeatherDetailSidebar.tsx
        weatherIcons.ts
    hooks/
      useOpenWeather.ts
```

## 注意事项

- 新标签页功能通过 `chrome_url_overrides.newtab` 启用。
- 如果修改了 `wxt.config.ts` 中的权限或 host permissions，需要重新加载扩展。
- `localStorage` 中已有旧配置时，新字段会使用默认配置兜底。
- 预设背景图片会随扩展一起打包，新增大图会明显增加构建产物体积。

## 版权声明

本项目是非官方的粉丝向新标签页插件，仅用于学习和个人使用。项目中涉及的《动物森友会》风格、名称、图形元素、角色意象、素材灵感及相关商标版权归 Nintendo 及其相关权利方所有。本项目与 Nintendo 没有关联，也未获得其赞助、授权或认可。
