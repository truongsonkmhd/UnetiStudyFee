import apiService from "@/apis/apiService";
import { Answer } from "@/types/Answer";
import { Question } from "@/types/quiz/Question";
import { Quiz } from "@/types/quiz/Quiz";
import { QuizSummary } from "@/types/quiz/QuizSummary";

const QUIZ_BASE_ENDPOINT = "/admin/quiz";

const quizService = {
  // ===== Quiz CRUD =====
  getAll: (contestLessonId: string): Promise<QuizSummary[]> =>
    apiService.get<QuizSummary[]>(
      `${QUIZ_BASE_ENDPOINT}?contestLessonId=${contestLessonId}`
    ),

  getById: (quizId: string): Promise<Quiz> =>
    apiService.get<Quiz>(`${QUIZ_BASE_ENDPOINT}/${quizId}`),

  // create: (payload: Quiz): Promise<Quiz> =>
  //   apiService.post<Quiz>(QUIZ_BASE_ENDPOINT, payload),

  update: (quizId: string, payload: Partial<Quiz>): Promise<Quiz> =>
    apiService.put<Quiz>(`${QUIZ_BASE_ENDPOINT}/${quizId}`, payload),

  delete: (quizId: string): Promise<void> =>
    apiService.delete<void>(`${QUIZ_BASE_ENDPOINT}/${quizId}`),

  publish: (quizId: string): Promise<Quiz> =>
    apiService.post<Quiz>(`${QUIZ_BASE_ENDPOINT}/${quizId}/publish`),

  unpublish: (quizId: string): Promise<Quiz> =>
    apiService.post<Quiz>(`${QUIZ_BASE_ENDPOINT}/${quizId}/unpublish`),

  // ===== Question =====
  addQuestion: (payload: {
    quizId: string;
    content: string;
    timeLimitSeconds: number;
    points: number;
    answers: Answer[];
  }): Promise<Question> =>
    apiService.post<Question>(`${QUIZ_BASE_ENDPOINT}/question`, payload),

  updateQuestion: (
    questionId: string,
    payload: Partial<Question>
  ): Promise<Question> =>
    apiService.put<Question>(
      `${QUIZ_BASE_ENDPOINT}/question/${questionId}`,
      payload
    ),

  deleteQuestion: (questionId: string): Promise<void> =>
    apiService.delete<void>(
      `${QUIZ_BASE_ENDPOINT}/question/${questionId}`
    ),

  // ===== Answer =====
  addAnswer: (payload: {
    questionId: string;
    content: string;
    isCorrect: boolean;
  }): Promise<Answer> =>
    apiService.post<Answer>(`${QUIZ_BASE_ENDPOINT}/answer`, payload),

  updateAnswer: (
    answerId: string,
    payload: Partial<Answer>
  ): Promise<Answer> =>
    apiService.put<Answer>(
      `${QUIZ_BASE_ENDPOINT}/answer/${answerId}`,
      payload
    ),

  deleteAnswer: (answerId: string): Promise<void> =>
    apiService.delete<void>(
      `${QUIZ_BASE_ENDPOINT}/answer/${answerId}`
    ),
};

export default quizService;