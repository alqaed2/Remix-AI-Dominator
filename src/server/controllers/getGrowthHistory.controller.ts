import { Request, Response } from "express";
import { db } from "../db";

export async function getGrowthHistoryController(req: Request, res: Response) {
  try {
    const profile = await db.getCreatorProfileByUserId("user_1");
    if (!profile) {
      return res.json([]);
    }

    const videos = await db.getVideos(profile.id);
    
    // Sort videos by createdAt ascending
    const sortedVideos = [...videos].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // Grouping by calendar week number
    const weeks: Record<string, typeof sortedVideos> = {};
    sortedVideos.forEach(vid => {
      const date = new Date(vid.createdAt);
      // Calculate week of year or simple 7-day interval
      const startOfYear = new Date(date.getFullYear(), 0, 1);
      const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 3600 * 1000));
      const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
      const weekKey = `${date.getFullYear()}-W${weekNumber}`;
      if (!weeks[weekKey]) {
        weeks[weekKey] = [];
      }
      weeks[weekKey].push(vid);
    });

    const keys = Object.keys(weeks).sort();
    const historyData: { weekLabel: string; score: number; videoCount: number; dateRange: string }[] = [];

    for (let index = 0; index < keys.length; index++) {
      const weekKey = keys[index];
      const weekVids = weeks[weekKey];
      let totalWeightedScore = 0;
      let count = 0;

      for (const v of weekVids) {
        const met = await db.getMetrics(v.id);
        if (met && met.status === 'PROCESSED') {
          // Formula for Video Performance / Growth Score
          const viewsScore = Math.min(30, (met.views / 25000) * 30); // Max 30 points (average view target is 25K)
          const likesScore = Math.min(25, (met.likes / 2500) * 25);   // Max 25 points
          const savesScore = Math.min(20, (met.saves / 1000) * 20);   // Max 20 points
          const sharesScore = Math.min(10, (met.shares / 500) * 10);  // Max 10 points
          const compScore = Math.min(15, (met.completionRatePercentage / 50) * 15); // Max 15 points
          
          const videoScore = Math.round(viewsScore + likesScore + savesScore + sharesScore + compScore);
          const finalScore = Math.max(35, Math.min(100, videoScore));
          
          totalWeightedScore += finalScore;
          count++;
        }
      }

      if (count > 0) {
        const avgScore = Math.round(totalWeightedScore / count);
        
        // Get start & end of this week's videos for a beautiful subtitle or range label
        const sortedWeekVids = [...weekVids].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        const firstDate = new Date(sortedWeekVids[0].createdAt);
        const lastDate = new Date(sortedWeekVids[sortedWeekVids.length - 1].createdAt);
        
        const opt: Intl.DateTimeFormatOptions = { month: 'numeric', day: 'numeric' };
        const dateRangeStr = firstDate.toLocaleDateString('ar-EG', opt) === lastDate.toLocaleDateString('ar-EG', opt)
          ? firstDate.toLocaleDateString('ar-EG', opt)
          : `${firstDate.toLocaleDateString('ar-EG', opt)} - ${lastDate.toLocaleDateString('ar-EG', opt)}`;

        historyData.push({
          weekLabel: `الأسبوع ${index + 1}`,
          score: avgScore,
          videoCount: count,
          dateRange: dateRangeStr
        });
      }
    }

    return res.json(historyData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
