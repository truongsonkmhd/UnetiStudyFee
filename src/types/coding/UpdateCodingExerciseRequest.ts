export interface UpdateCodingExerciseRequest {
    version: number;
    title?: string;
    description?: string;
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
    category?: string;
    programmingLanguage?: string;
    points?: number;
    timeLimitSeconds?: number;
    memoryLimitMB?: number;
    problemStatement?: string;
    inputFormat?: string;
    outputFormat?: string;
    constraints?: string;
    sampleInput?: string;
    sampleOutput?: string;
    isActive?: boolean;
}

