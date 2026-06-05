import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button, Footer } from "animal-island-ui";
import { X } from "lucide-react";

type SidebarProps = {
  open: boolean;
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  ariaLabel?: string;
  className?: string;
  contentClassName?: string;
  widthClassName?: string;
};

function Sidebar({
  open,
  title,
  onClose,
  children,
  ariaLabel,
  className,
  contentClassName,
  widthClassName = "w-115",
}: SidebarProps) {
  const readableTitle = typeof title === "string" ? title : "侧边栏";

  const sidebar = (
    <>
      {open ? (
        <button
          type="button"
          aria-label={ariaLabel ?? `关闭${readableTitle}侧边栏`}
          className="fixed inset-0 z-40 bg-[#725d42]/20 backdrop-blur-[1px]"
          onClick={onClose}
        />
      ) : null}
      <aside
        className={[
          "fixed right-0 top-0 z-50 flex h-full max-w-[90vw] flex-col justify-between bg-[#f7f3df] text-[#725d42] shadow-[-8px_0_24px_rgba(114,93,66,0.2)] transition-transform duration-300 ease-out",
          widthClassName,
          open ? "translate-x-0" : "translate-x-full",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div
          className={[
            "flex max-h-[calc(100%-80px)] min-h-0 flex-col gap-6 p-6",
            contentClassName,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div className="flex items-center justify-between gap-4">
            <h2 className="min-w-0 text-2xl font-black">{title}</h2>
            <Button
              type="text"
              icon={<X className="h-5 w-5" />}
              onClick={onClose}
            />
          </div>
          {children}
        </div>

        <Footer type="sea" className="shrink-0 -mb-2.5" />
      </aside>
    </>
  );

  return createPortal(sidebar, document.body);
}

export default Sidebar;
