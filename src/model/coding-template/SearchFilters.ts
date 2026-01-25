import { Difficulty } from "./Difficulty";

export interface SearchFilters {
  q?: string;
  difficulty?: Difficulty;
  category?: string;
  language?: string;
  published?: boolean;
}
