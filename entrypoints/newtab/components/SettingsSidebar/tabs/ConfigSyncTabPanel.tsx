import { useRef, useState, type ChangeEvent } from "react";
import { Button, Typewriter } from "animal-island-ui";
import { Download, Upload } from "lucide-react";
import { useNewtabStore, type NewtabConfig } from "../../../store";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function ConfigSyncTabPanel() {
  const { config, setBigLoading } = useNewtabStore();
  const updateConfig = useNewtabStore((state) => state.updateConfig);
  const [syncMessage, setSyncMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportConfig = () => {
    const json = JSON.stringify(config, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `animal-cross-newtab-config-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setSyncMessage("配置已导出");
  };

  const handleImportConfig = () => {
    fileInputRef.current?.click();
  };

  const handleConfigFileChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const content = await file.text();
      const parsedConfig = JSON.parse(content) as unknown;

      if (!isRecord(parsedConfig)) {
        setSyncMessage("导入失败：请选择有效的配置 JSON 文件");
        return;
      }

      updateConfig(parsedConfig as Partial<NewtabConfig>);
      setSyncMessage("配置已导入");
      setBigLoading(true);
      setTimeout(() => {
        setBigLoading(false);
      }, 3000);
    } catch {
      setSyncMessage("导入失败：JSON 文件解析失败");
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleConfigFileChange}
      />
      <div className="flex flex-col gap-4">
        <Button
          block
          type="primary"
          icon={<Download className="h-5 w-5" />}
          onClick={handleExportConfig}
        >
          导出 JSON
        </Button>
        <Button
          block
          type="primary"
          icon={<Upload className="h-5 w-5" />}
          onClick={handleImportConfig}
        >
          导入配置
        </Button>
      </div>
      {syncMessage ? (
        <Typewriter>
          <div className="rounded-xl bg-[#f4efe3] px-3 py-2 text-[#725d42]">
            {syncMessage}
          </div>
        </Typewriter>
      ) : null}
    </div>
  );
}

export default ConfigSyncTabPanel;
