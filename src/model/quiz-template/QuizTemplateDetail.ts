import { QuestionTemplateResponse } from "./QuestionTemplateResponse";
import { QuizTemplate } from "../../types/quiz/QuizTemplate";

export interface QuizTemplateDetail extends QuizTemplate {
  questions: QuestionTemplateResponse[];
}