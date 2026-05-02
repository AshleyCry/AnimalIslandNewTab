import { useState } from "react";
import { Button } from "animal-island-ui";
import { Settings, X } from "lucide-react";
import SettingsTabPanel from "./tabs/SettingsTabPanel";
import ConfigSyncTabPanel from "./tabs/ConfigSyncTabPanel";

type SettingsTab = "settings" | "sync";

function SettingsSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>("settings");

  return (
    <>
      <div className="fixed bottom-8 right-8 z-40">
        <Button
          type="primary"
          size="large"
          icon={<Settings className="h-5 w-5" />}
          onClick={() => setIsOpen(true)}
        />
      </div>
      {isOpen ? (
        <button
          type="button"
          aria-label="关闭设置侧边栏"
          className="fixed inset-0 z-40 bg-[#725d42]/20 backdrop-blur-[1px]"
          onClick={() => setIsOpen(false)}
        />
      ) : null}
      <aside
        className={[
          "fixed right-0 top-0 z-50 h-full w-[460px] max-w-[90vw] bg-[#f7f3df] p-6 text-[#725d42] shadow-[-8px_0_24px_rgba(114,93,66,0.2)] transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black">设置</h2>
          <Button
            type="text"
            icon={<X className="h-5 w-5" />}
            onClick={() => setIsOpen(false)}
          />
        </div>
        <div className="mt-6 flex gap-3 rounded-2xl bg-[#f4efe3] p-2">
          <Button
            block
            type={activeTab === "settings" ? "primary" : "text"}
            onClick={() => setActiveTab("settings")}
          >
            设置
          </Button>
          <Button
            block
            type={activeTab === "sync" ? "primary" : "text"}
            onClick={() => setActiveTab("sync")}
          >
            配置同步
          </Button>
        </div>
        <div className="mt-4 rounded-2xl bg-[#f4efe3] p-4 text-sm font-bold text-[#8a7966]">
          {activeTab === "settings" ? (
            <SettingsTabPanel />
          ) : (
            <ConfigSyncTabPanel />
          )}
        </div>
      </aside>
    </>
  );
}

export default SettingsSidebar;
