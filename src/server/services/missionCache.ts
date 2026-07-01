export const missionCache = {
  cachedMission: null as any,
  cachedMissionNiche: "" as string,
  cachedMissionTime: 0 as number,
  invalidate: () => {
    missionCache.cachedMission = null;
    missionCache.cachedMissionNiche = "";
    missionCache.cachedMissionTime = 0;
    console.log("[MissionCache] Cache successfully invalidated.");
  }
};
