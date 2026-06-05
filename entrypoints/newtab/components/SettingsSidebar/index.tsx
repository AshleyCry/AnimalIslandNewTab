import { useState } from "react";
import { Tabs } from "animal-island-ui";
import Sidebar from "../Sidebar";
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
    <Sidebar open={open} title="设置" onClose={onClose} ariaLabel="关闭设置侧边栏">
      <Tabs
        className=" bg-[#f4efe3]!"
        items={tabItems}
        activeKey={activeTab}
        onChange={handleTabChange}
      />
    </Sidebar>
  );
}

export default SettingsSidebar;
