export const convertMarksRankData = (leaderboard) => {
    const rankMap = new Map();

    leaderboard.forEach(({ rank, scoredMarks, percentile }) => {
        if (!rankMap.has(rank)) {
            rankMap.set(rank, {
                rank: parseInt(rank),
                marks: scoredMarks,
                percentile: parseFloat(percentile),
                noOfParticipants: 0,
            });
        }
        rankMap.get(rank).noOfParticipants += 1;
    });

    return Array.from(rankMap.values());
};
