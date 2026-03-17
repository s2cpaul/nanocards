import { NanoCard } from "../types";

/**
 * Filter cards by search query
 */
export function filterBySearch(cards: NanoCard[], query: string): NanoCard[] {
  if (!query.trim()) return cards;
  
  const lowerQuery = query.toLowerCase();
  return cards.filter(card =>
    card.title.toLowerCase().includes(lowerQuery) ||
    card.createdBy.toLowerCase().includes(lowerQuery) ||
    card.id.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Filter cards by creator email
 */
export function filterByUser(cards: NanoCard[], userEmail: string, filter: string): NanoCard[] {
  if (filter === "all") return cards;
  if (filter === "my") return cards.filter(card => card.createdBy === userEmail);
  return cards.filter(card => card.createdBy === filter);
}

/**
 * Filter cards by month
 */
export function filterByMonth(cards: NanoCard[], month: string): NanoCard[] {
  if (month === "all") return cards;
  
  return cards.filter(card => {
    const cardDate = new Date(card.createdAt);
    const cardMonth = cardDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    return cardMonth === month;
  });
}

/**
 * Filter cards by stage
 */
export function filterByStage(cards: NanoCard[], stage: string): NanoCard[] {
  if (stage === "all") return cards;
  return cards.filter(card => card.stage === stage);
}

/**
 * Sort cards by criteria
 */
export function sortCards(cards: NanoCard[], sortBy: "likes" | "newest"): NanoCard[] {
  const sorted = [...cards];
  
  if (sortBy === "likes") {
    sorted.sort((a, b) => b.likes - a.likes);
  } else {
    sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  return sorted;
}

/**
 * Get unique months from cards
 */
export function getUniqueMonths(cards: NanoCard[]): string[] {
  const months = cards.map(card => {
    const date = new Date(card.createdAt);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  });
  
  return Array.from(new Set(months)).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });
}

/**
 * Get unique users from cards
 */
export function getUniqueUsers(cards: NanoCard[]): string[] {
  const users = cards.map(card => card.createdBy);
  return Array.from(new Set(users)).sort();
}

/**
 * Get unique stages from cards
 */
export function getUniqueStages(cards: NanoCard[]): string[] {
  const stages = cards
    .map(card => card.stage)
    .filter((stage): stage is string => stage !== undefined);
  return Array.from(new Set(stages)).sort();
}