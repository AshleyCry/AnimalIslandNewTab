import { useMemo, useState } from "react";
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "animal-island-ui";
import { GripVertical, Pencil, Plus, Trash2, ArrowLeft } from "lucide-react";
import { useNewtabStore, type BookmarkItem } from "../../../store";
import BookmarkEditorModal from "./BookmarkEditorModal";

type SortableBookmarkItemProps = {
  id: string;
  bookmarkItem: BookmarkItem;
  onDelete: () => void;
  onEdit: () => void;
};

const DEFAULT_BOOKMARK_BACKGROUND = "#fdf8e4";

function getBookmarkId(bookmarkItem: BookmarkItem, index: number) {
  return `${index}-${bookmarkItem.title}-${bookmarkItem.url}`;
}

function SortableBookmarkItem({
  id,
  bookmarkItem,
  onDelete,
  onEdit,
}: SortableBookmarkItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const transformStyle = transform
    ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
    : undefined;

  return (
    <div
      ref={setNodeRef}
      className="flex items-center gap-3 rounded-2xl bg-white/70 p-3 text-[#725d42] shadow-sm"
      style={{
        transform: transformStyle,
        transition,
      }}
    >
      <button
        type="button"
        className="cursor-grab text-[#8a7966] active:cursor-grabbing"
        aria-label="拖动排序"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-black">{bookmarkItem.title}</div>
        <div className="truncate text-xs font-bold text-[#8a7966]">
          {bookmarkItem.url}
        </div>
      </div>
      <div className="flex shrink-0 gap-1">
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#725d42] transition-colors hover:bg-[#f4efe3]"
          aria-label="编辑快捷方式"
          onClick={onEdit}
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#c45f4d] transition-colors hover:bg-[#f4efe3]"
          aria-label="删除快捷方式"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function BookmarkSettingsPanel({ onBack }: { onBack: () => void }) {
  const bookmarkItems = useNewtabStore((state) => state.config.bookmarkItems);
  const updateConfig = useNewtabStore((state) => state.updateConfig);
  const sensors = useSensors(useSensor(PointerSensor));
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const sortableIds = useMemo(
    () =>
      bookmarkItems.map((bookmarkItem, index) =>
        getBookmarkId(bookmarkItem, index),
      ),
    [bookmarkItems],
  );
  const isEditorOpen = editingIndex !== null;
  const editingBookmarkItem =
    editingIndex !== null ? bookmarkItems[editingIndex] : undefined;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = sortableIds.indexOf(String(active.id));
    const newIndex = sortableIds.indexOf(String(over.id));

    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    updateConfig({
      bookmarkItems: arrayMove(bookmarkItems, oldIndex, newIndex),
    });
  };

  const handleAdd = () => {
    setEditingIndex(bookmarkItems.length);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
  };

  const handleDelete = (index: number) => {
    updateConfig({
      bookmarkItems: bookmarkItems.filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    });
  };

  const handleCloseEditor = () => {
    setEditingIndex(null);
  };

  const handleSave = (bookmarkItem: BookmarkItem) => {
    const nextBookmarkItems = [...bookmarkItems];

    if (editingIndex === bookmarkItems.length) {
      nextBookmarkItems.push(bookmarkItem);
    } else if (editingIndex !== null) {
      nextBookmarkItems[editingIndex] = bookmarkItem;
    }

    updateConfig({ bookmarkItems: nextBookmarkItems });
    handleCloseEditor();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Button
          type="primary"
          icon={<ArrowLeft className="h-4 w-4" />}
          size="small"
          onClick={onBack}
        >
          返回
        </Button>
        <Button
          type="primary"
          icon={<Plus className="h-4 w-4" />}
          size="small"
          onClick={handleAdd}
        >
          添加
        </Button>
      </div>

      {bookmarkItems.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortableIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3 pb-1">
              {bookmarkItems.map((bookmarkItem, index) => (
                <SortableBookmarkItem
                  key={sortableIds[index]}
                  id={sortableIds[index]}
                  bookmarkItem={bookmarkItem}
                  onDelete={() => handleDelete(index)}
                  onEdit={() => handleEdit(index)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="rounded-2xl bg-white/70 p-4 text-center text-sm font-bold text-[#8a7966]">
          暂无快捷方式
        </div>
      )}

      <BookmarkEditorModal
        open={isEditorOpen}
        bookmarkItem={editingBookmarkItem}
        defaultBackgroundColor={DEFAULT_BOOKMARK_BACKGROUND}
        onClose={handleCloseEditor}
        onSave={handleSave}
      />
    </div>
  );
}

export default BookmarkSettingsPanel;
