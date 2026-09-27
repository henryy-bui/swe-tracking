/* Key builders shared by the store and the derived-data layer. */

export const taskKey = (week: number, i: number) => `w${week}-${i}`;
export const dsaKey = (week: number) => `w${week}-dsa`;
export const customKey = (week: number, id: string) => `w${week}-c${id}`;

export const milestoneKey = (projectId: string, i: number) => `${projectId}-m${i}`;
export const milestoneIndex = (projectId: string, key: string): number => Number(key.slice(`${projectId}-m`.length));
