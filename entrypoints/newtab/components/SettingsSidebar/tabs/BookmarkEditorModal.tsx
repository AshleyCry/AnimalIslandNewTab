import { useEffect, useState } from "react";
import { Button, Input, Modal } from "animal-island-ui";
import type { BookmarkItem } from "../../../store";

type BookmarkDraft = {
  title: string;
  url: string;
  backgroundColor: string;
};

type BookmarkEditorModalProps = {
  open: boolean;
  bookmarkItem?: BookmarkItem;
  defaultBackgroundColor: string;
  onClose: () => void;
  onSave: (bookmarkItem: BookmarkItem) => void;
};

function normalizeUrl(url: string) {
  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  return `https://${trimmedUrl}`;
}

function BookmarkEditorModal({
  open,
  bookmarkItem,
  defaultBackgroundColor,
  onClose,
  onSave,
}: BookmarkEditorModalProps) {
  const [draft, setDraft] = useState<BookmarkDraft>({
    title: "",
    url: "",
    backgroundColor: defaultBackgroundColor,
  });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setDraft({
      title: bookmarkItem?.title ?? "",
      url: bookmarkItem?.url ?? "",
      backgroundColor: bookmarkItem?.backgroundColor ?? defaultBackgroundColor,
    });
    setFormError("");
  }, [bookmarkItem, defaultBackgroundColor, open]);

  const handleSave = () => {
    const title = draft.title.trim();
    const url = normalizeUrl(draft.url);

    if (!title || !url) {
      setFormError("请填写标题和 URL");
      return;
    }

    onSave({
      title,
      url,
      backgroundColor: draft.backgroundColor.trim() || defaultBackgroundColor,
    });
  };

  return (
    <Modal
      open={open}
      title={bookmarkItem ? "编辑快捷方式" : "新增快捷方式"}
      width={420}
      footer={null}
      onClose={onClose}
      typewriter={false}
    >
      <div className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-black text-[#725d42]">标题</span>
          <Input
            value={draft.title}
            placeholder="例如 GitHub"
            onChange={(event) =>
              setDraft((currentDraft) => ({
                ...currentDraft,
                title: event.target.value,
              }))
            }
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-black text-[#725d42]">URL</span>
          <Input
            value={draft.url}
            placeholder="https://example.com"
            onChange={(event) =>
              setDraft((currentDraft) => ({
                ...currentDraft,
                url: event.target.value,
              }))
            }
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-black text-[#725d42]">背景颜色</span>
          <div className="flex items-center gap-3">
            <input
              type="color"
              className="h-10 w-12 rounded-lg border-2 border-[#c4b89e]"
              value={draft.backgroundColor}
              onChange={(event) =>
                setDraft((currentDraft) => ({
                  ...currentDraft,
                  backgroundColor: event.target.value,
                }))
              }
            />
            <Input
              value={draft.backgroundColor}
              placeholder="#fdf8e4"
              onChange={(event) =>
                setDraft((currentDraft) => ({
                  ...currentDraft,
                  backgroundColor: event.target.value,
                }))
              }
            />
          </div>
        </label>
        {formError ? (
          <div className="rounded-xl bg-[#f4efe3] px-3 py-2 text-sm font-bold text-[#8a7966]">
            {formError}
          </div>
        ) : null}
        <div className="flex gap-3">
          <Button block type="primary" onClick={handleSave}>
            保存
          </Button>
          <Button block type="text" onClick={onClose}>
            取消
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default BookmarkEditorModal;
