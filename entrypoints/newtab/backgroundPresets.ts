const backgroundPresetModules = import.meta.glob(
  "../../assets/backgroundPreset/*.{jpg,jpeg,png,webp}",
  {
    eager: true,
    import: "default",
    query: "?url",
  },
) as Record<string, string>;

function getPresetId(path: string) {
  return path.split("/").pop() ?? path;
}

function getPresetSortValue(id: string) {
  const numericPrefix = Number.parseInt(id, 10);

  return Number.isNaN(numericPrefix) ? Number.MAX_SAFE_INTEGER : numericPrefix;
}

export const backgroundPresets = Object.entries(backgroundPresetModules)
  .map(([path, src]) => ({
    id: getPresetId(path),
    src,
  }))
  .sort((currentPreset, nextPreset) => {
    const currentSortValue = getPresetSortValue(currentPreset.id);
    const nextSortValue = getPresetSortValue(nextPreset.id);

    return currentSortValue - nextSortValue;
  });

export function getBackgroundPresetSrc(id: string) {
  return backgroundPresets.find((preset) => preset.id === id)?.src ?? "";
}
