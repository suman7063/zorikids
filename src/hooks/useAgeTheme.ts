import { useChildStore } from "../stores/childStore";
import { AGE_WORLDS, getAgeWorld, type AgeWorld, type AgeTheme } from "../theme/ageThemes";

export function useAgeTheme(): {
  world: AgeWorld;
  theme: AgeTheme;
  isBaby: boolean;
  isExplorer: boolean;
  isChampion: boolean;
} {
  const activeChild = useChildStore((s) => s.activeChild);

  // Default to explorer (3-5) when child not loaded yet
  const age   = activeChild?.age ?? 4;
  const world = getAgeWorld(age);
  const theme = AGE_WORLDS[world];

  return {
    world,
    theme,
    isBaby:     world === "baby",
    isExplorer: world === "explorer",
    isChampion: world === "champion",
  };
}
