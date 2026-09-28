/* Key builders shared by the store and the derived-data layer.
   Roadmap items are keyed by their stable ids from src/data/roadmap.ts. */

export const taskKey = (week: number, id: string) => `w${week}-${id}`;
export const dsaKey = (week: number) => `w${week}-dsa`;
export const customKey = (week: number, id: string) => `w${week}-c${id}`;

export const milestoneKey = (projectId: string, id: string) => `${projectId}-${id}`;
