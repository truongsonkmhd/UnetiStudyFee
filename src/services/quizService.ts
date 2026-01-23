import apiService from "@/apis/apiService";
import { AddAnswerRequest } from "@/model/quiz/AddAnswerRequest";
import { AddQuestionRequest } from "@/model/quiz/AddQuestionRequest";
import { AnswerResponse } from "@/model/quiz/AnswerResponse";
import { CreateQuizRequest } from "@/model/quiz/CreateQuizRequest";
import { QuestionResponse } from "@/model/quiz/QuestionResponse";
import { QuizResponse } from "@/model/quiz/QuizResponse";
import { QuizSummaryResponse } from "@/model/quiz/QuizSummaryResponse";
import { UpdateAnswerRequest } from "@/model/quiz/UpdateAnswerRequest";
import { UpdateQuestionRequest } from "@/model/quiz/UpdateQuestionRequest";
import { UpdateQuizRequest } from "@/model/quiz/UpdateQuizRequest";


const QUIZ_BASE_ENDPOINT = "/admin/quiz";

const quizService = {
  // ===== Quiz CRUD =====
  createQuiz: (payload: CreateQuizRequest): Promise<QuizResponse> =>
    apiService.post<QuizResponse>(QUIZ_BASE_ENDPOINT, payload),

  updateQuiz: (quizId: string, payload: UpdateQuizRequest): Promise<QuizResponse> =>
    apiService.put<QuizResponse>(`${QUIZ_BASE_ENDPOINT}/${quizId}`, payload),

  deleteQuiz: (quizId: string): Promise<void> =>
    apiService.delete<void>(`${QUIZ_BASE_ENDPOINT}/${quizId}`),

  getQuizById: (quizId: string): Promise<QuizResponse> =>
    apiService.get<QuizResponse>(`${QUIZ_BASE_ENDPOINT}/${quizId}`),

  getAllQuizzes: (contestLessonId: string): Promise<QuizSummaryResponse[]> =>
    apiService.get<QuizSummaryResponse[]>(
      `${QUIZ_BASE_ENDPOINT}?contestLessonId=${contestLessonId}`
    ),

  // ===== Quiz Publishing =====
  publishQuiz: (quizId: string): Promise<QuizResponse> =>
    apiService.post<QuizResponse>(`${QUIZ_BASE_ENDPOINT}/${quizId}/publish`),

  unpublishQuiz: (quizId: string): Promise<QuizResponse> =>
    apiService.post<QuizResponse>(`${QUIZ_BASE_ENDPOINT}/${quizId}/unpublish`),

  // ===== Question Management =====
  addQuestion: (payload: AddQuestionRequest): Promise<QuestionResponse> =>
    apiService.post<QuestionResponse>(`${QUIZ_BASE_ENDPOINT}/question`, payload),

  updateQuestion: (
    questionId: string,
    payload: UpdateQuestionRequest
  ): Promise<QuestionResponse> =>
    apiService.put<QuestionResponse>(
      `${QUIZ_BASE_ENDPOINT}/question/${questionId}`,
      payload
    ),

  deleteQuestion: (questionId: string): Promise<void> =>
    apiService.delete<void>(`${QUIZ_BASE_ENDPOINT}/question/${questionId}`),

  // ===== Answer Management =====
  addAnswer: (payload: AddAnswerRequest): Promise<AnswerResponse> =>
    apiService.post<AnswerResponse>(`${QUIZ_BASE_ENDPOINT}/answer`, payload),

  updateAnswer: (
    answerId: string,
    payload: UpdateAnswerRequest
  ): Promise<AnswerResponse> =>
    apiService.put<AnswerResponse>(
      `${QUIZ_BASE_ENDPOINT}/answer/${answerId}`,
      payload
    ),

  deleteAnswer: (answerId: string): Promise<void> =>
    apiService.delete<void>(`${QUIZ_BASE_ENDPOINT}/answer/${answerId}`),
};

export default quizService;