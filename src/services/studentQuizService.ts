import apiService from "@/apis/apiService";
import { QuizDTO } from "@/model/course-admin/QuizDTO";

export interface StartQuizResponse {
    attemptId: string;
    quizId: string;
    quizTitle: string;
    totalQuestions: number;
    startedAt: string;
}

export interface AnswerOption {
    answerId: string;
    content: string;
    answerOrder: number;
}

export interface QuestionResponse {
    questionId: string;
    content: string;
    questionOrder: number;
    timeLimitSeconds: number;
    answers: AnswerOption[];
    currentQuestion: number;
    totalQuestions: number;
}

export interface SubmitAnswerRequest {
    questionId: string;
    selectedAnswerIds: string[];
    timeSpentSeconds: number;
}

export interface SubmitAnswerResponse {
    userAnswerId: string;
    isCorrect: boolean;
    pointsEarned: number;
    isTimeout: boolean;
    hasNextQuestion: boolean;
}

export interface QuestionResult {
    questionId: string;
    questionContent: string;
    isCorrect: boolean;
    pointsEarned: number;
    maxPoints: number;
    timeSpentSeconds: number;
    isTimeout: boolean;
    answers: {
        answerId: string;
        content: string;
        isCorrect: boolean;
        isSelected: boolean;
    }[];
}

export interface QuizResultResponse {
    attemptId: string;
    score: number;
    totalPoints: number;
    percentage: number;
    isPassed: boolean;
    startedAt: string;
    completedAt: string;
    totalQuestions?: number;
    correctAnswers?: number;
    incorrectAnswers?: number;
    questionResults?: QuestionResult[];
}

const QUIZ_API_BASE = "/quiz";

export const studentQuizService = {
    startQuiz: async (quizId: string): Promise<StartQuizResponse> => {
        return apiService.post(`${QUIZ_API_BASE}/${quizId}/start`, {});
    },

    getNextQuestion: async (attemptId: string): Promise<QuestionResponse | null> => {
        return apiService.get(`${QUIZ_API_BASE}/attempt/${attemptId}/next-question`);
    },

    submitAnswer: async (attemptId: string, data: SubmitAnswerRequest): Promise<SubmitAnswerResponse> => {
        return apiService.post(`${QUIZ_API_BASE}/attempt/${attemptId}/submit-answer`, data);
    },

    completeQuiz: async (attemptId: string): Promise<QuizResultResponse> => {
        return apiService.post(`${QUIZ_API_BASE}/attempt/${attemptId}/complete`, {});
    },

    getUserAttempts: async (quizId: string): Promise<QuizResultResponse[]> => {
        return apiService.get(`${QUIZ_API_BASE}/${quizId}/attempts`);
    },

    getQuizInfo: async (quizId: string): Promise<QuizDTO> => {
        return apiService.get(`${QUIZ_API_BASE}/${quizId}`);
    }
};
