import { useState } from "react";
import { Button, Footer, Tabs } from "animal-island-ui";
import { X } from "lucide-react";
import SettingsTabPanel from "./tabs/SettingsTabPanel";
import ConfigSyncTabPanel from "./tabs/ConfigSyncTabPanel";

type SettingsTab = "settings" | "sync";

type SettingsSidebarProps = {
  open: boolean;
  onClose: () => void;
};

const TAB_PANEL_CLASS_NAME =
  "max-h-[calc(100vh-330px)] overflow-y-auto bg-[#f4efe3] p-4 text-sm font-bold text-[#8a7966]";

function isSettingsTab(value: string): value is SettingsTab {
  return value === "settings" || value === "sync";
}

function SettingsSidebar({ open, onClose }: SettingsSidebarProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("settings");

  const handleTabChange = (key: string) => {
    if (!isSettingsTab(key)) {
      return;
    }

    setActiveTab(key);
  };

  const tabItems = [
    {
      key: "settings",
      label: "设置",
      children: (
        <div className={TAB_PANEL_CLASS_NAME}>
          <SettingsTabPanel />
        </div>
      ),
    },
    {
      key: "sync",
      label: "配置同步",
      children: (
        <div className={TAB_PANEL_CLASS_NAME}>
          <ConfigSyncTabPanel />
        </div>
      ),
    },
  ];

  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label="关闭设置侧边栏"
          className="fixed inset-0 z-40 bg-[#725d42]/20 backdrop-blur-[1px]"
          onClick={onClose}
        />
      ) : null}
      <aside
        className={[
          "fixed right-0 top-0 z-50 h-full w-115 max-w-[90vw] bg-[#f7f3df] text-[#725d42] shadow-[-8px_0_24px_rgba(114,93,66,0.2)] transition-transform duration-300 ease-out flex flex-col justify-between",
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <div className="flex max-h-[calc(100%-80px)] min-h-0 flex-col gap-6 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black">设置</h2>
            <Button
              type="text"
              icon={<X className="h-5 w-5" />}
              onClick={onClose}
            />
          </div>
          <Tabs
            className=" bg-[#f4efe3]!"
            items={tabItems}
            activeKey={activeTab}
            onChange={handleTabChange}
          />
        </div>

        <Footer type="sea" className="shrink-0 -mb-2.5" />
      </aside>
    </>
  );
}

export default SettingsSidebar;
