import { Difficulty } from "./Difficulty";

export interface TemplateCard {
  templateId: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  programmingLanguage: string;
  category?: string;
  points: number;
  usageCount: number;
  isPublished: boolean;
  createdAt: string;
}