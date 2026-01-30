// ============================================
// 📁 services/codingExercise.ts
// ============================================

import apiService from "@/apis/apiService";
import { PageResponse } from "@/model/common/PageResponse";
import { CodingExerciseDetail } from "@/types/coding/CodingExerciseDetail";
import { CreateCodingExerciseRequest } from "@/types/coding/CreateCodingExerciseRequest";
import { SearchExerciseParams } from "@/types/coding/SearchExerciseParams";
import { TestCase } from "@/types/coding/TestCase";
import { UpdateCodingExerciseRequest } from "@/types/coding/UpdateCodingExerciseRequest";

const CODING_EXERCISE_BASE_ENDPOINT = "/admin/coding-exercises";

const codingExerciseService = {
    // ===== Exercise CRUD =====

    /**
     * Create a new coding exercise
     */
    createExercise: (payload: CreateCodingExerciseRequest): Promise<CodingExerciseDetail> =>
        apiService.post<CodingExerciseDetail>(CODING_EXERCISE_BASE_ENDPOINT, payload),

    /**
     * Update an existing coding exercise
     */
    updateExercise: (
        templateId: string,
        payload: UpdateCodingExerciseRequest
    ): Promise<CodingExerciseDetail> =>
        apiService.put<CodingExerciseDetail>(
            `${CODING_EXERCISE_BASE_ENDPOINT}/${templateId}`,
            payload
        ),

    /**
     * Delete exercise (soft delete)
     */
    deleteExercise: (templateId: string): Promise<void> =>
        apiService.delete<void>(`${CODING_EXERCISE_BASE_ENDPOINT}/${templateId}`),

    /**
     * Get exercise by ID
     */
    getExerciseById: (templateId: string): Promise<CodingExerciseDetail> =>
        apiService.get<CodingExerciseDetail>(`${CODING_EXERCISE_BASE_ENDPOINT}/${templateId}`),

    /**
     * Get all categories
     */
    getAllCategories: (): Promise<string[]> =>
        apiService.get<string[]>(`${CODING_EXERCISE_BASE_ENDPOINT}/categories`),

    /**
     * Get all supported programming languages
     */
    getSupportedLanguages: (): Promise<string[]> =>
        apiService.get<string[]>(`${CODING_EXERCISE_BASE_ENDPOINT}/languages`),

    /**
     * Toggle exercise status (active/inactive)
     */
    toggleExerciseStatus: (templateId: string, isActive: boolean): Promise<void> =>
        apiService.put<void>(
            `${CODING_EXERCISE_BASE_ENDPOINT}/${templateId}/status?isActive=${isActive}`
        ),

    /**
     * Search exercises with filters
     */
    searchExercises: (
        params: SearchExerciseParams
    ): Promise<PageResponse<CodingExerciseDetail>> => {
        const queryParams = new URLSearchParams();
        if (params.page !== undefined) queryParams.append('page', String(params.page));
        if (params.size !== undefined) queryParams.append('size', String(params.size));
        if (params.difficulty) queryParams.append('difficulty', params.difficulty);
        if (params.category) queryParams.append('category', params.category);
        if (params.programmingLanguage) queryParams.append('programmingLanguage', params.programmingLanguage);
        if (params.isActive !== undefined) queryParams.append('isActive', String(params.isActive));
        if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);

        return apiService.get<PageResponse<CodingExerciseDetail>>(
            `${CODING_EXERCISE_BASE_ENDPOINT}/search?${queryParams}`
        );
    },

    /**
     * Get most used exercises
     */
    getMostUsedExercises: (): Promise<CodingExerciseDetail[]> =>
        apiService.get<CodingExerciseDetail[]>(`${CODING_EXERCISE_BASE_ENDPOINT}/most-used`),

    /**
     * Duplicate exercise
     */
    duplicateExercise: (templateId: string, newTitle: string): Promise<CodingExerciseDetail> =>
        apiService.post<CodingExerciseDetail>(
            `${CODING_EXERCISE_BASE_ENDPOINT}/${templateId}/duplicate?newTitle=${encodeURIComponent(newTitle)}`
        ),

    /**
     * Get exercises by difficulty
     */
    getExercisesByDifficulty: (difficulty: 'EASY' | 'MEDIUM' | 'HARD'): Promise<CodingExerciseDetail[]> =>
        apiService.get<CodingExerciseDetail[]>(
            `${CODING_EXERCISE_BASE_ENDPOINT}/difficulty/${difficulty}`
        ),

    /**
     * Get exercises by category
     */
    getExercisesByCategory: (category: string): Promise<CodingExerciseDetail[]> =>
        apiService.get<CodingExerciseDetail[]>(
            `${CODING_EXERCISE_BASE_ENDPOINT}/category/${encodeURIComponent(category)}`
        ),

    // ===== Test Case Management =====

    /**
     * Add test case to exercise
     */
    addTestCase: (templateId: string, testCase: TestCase): Promise<CodingExerciseDetail> =>
        apiService.post<CodingExerciseDetail>(
            `${CODING_EXERCISE_BASE_ENDPOINT}/${templateId}/test-cases`,
            testCase
        ),

    /**
     * Update test case
     */
    updateTestCase: (
        templateId: string,
        testCaseId: string,
        testCase: Partial<TestCase>
    ): Promise<CodingExerciseDetail> =>
        apiService.put<CodingExerciseDetail>(
            `${CODING_EXERCISE_BASE_ENDPOINT}/${templateId}/test-cases/${testCaseId}`,
            testCase
        ),

    /**
     * Delete test case
     */
    deleteTestCase: (templateId: string, testCaseId: string): Promise<void> =>
        apiService.delete<void>(
            `${CODING_EXERCISE_BASE_ENDPOINT}/${templateId}/test-cases/${testCaseId}`
        ),

    // ===== Import/Export Functions =====

    /**
     * Export exercise to JSON
     */
    exportExerciseToJSON(exercise: CodingExerciseDetail): void {
        try {
            const exportData = {
                title: exercise.title,
                description: exercise.description,
                difficulty: exercise.difficulty,
                category: exercise.category,
                programmingLanguage: exercise.programmingLanguage,
                points: exercise.points,
                timeLimitSeconds: exercise.timeLimitSeconds,
                memoryLimitMB: exercise.memoryLimitMB,
                problemStatement: exercise.problemStatement,
                inputFormat: exercise.inputFormat,
                outputFormat: exercise.outputFormat,
                constraints: exercise.constraints,
                sampleInput: exercise.sampleInput,
                sampleOutput: exercise.sampleOutput,
                testCases: exercise.testCases,
            };

            const json = JSON.stringify(exportData, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${exercise.title.replace(/\s+/g, '_')}_exercise.json`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error('Error exporting exercise:', error);
            throw new Error('Failed to export exercise to JSON');
        }
    },

    /**
     * Import exercise from JSON file
     */
    async importExerciseFromJSON(file: File): Promise<CodingExerciseDetail> {
        try {
            const text = await readFileAsText(file);
            const data = JSON.parse(text);

            const request: CreateCodingExerciseRequest = {
                title: data.title || 'Imported Exercise',
                description: data.description || '',
                difficulty: data.difficulty || 'MEDIUM',
                category: data.category || 'General',
                programmingLanguage: data.programmingLanguage || 'Python',
                points: data.points || 10,
                timeLimitSeconds: data.timeLimitSeconds || 60,
                memoryLimitMB: data.memoryLimitMB || 256,
                problemStatement: data.problemStatement || '',
                inputFormat: data.inputFormat,
                outputFormat: data.outputFormat,
                constraints: data.constraints,
                sampleInput: data.sampleInput,
                sampleOutput: data.sampleOutput,
                testCases: data.testCases || [],
            };

            return await codingExerciseService.createExercise(request);
        } catch (error) {
            console.error('Error importing exercise:', error);
            throw new Error('Failed to import exercise from JSON. Please check file format.');
        }
    },

    /**
     * Export exercise to Markdown
     */
    exportExerciseToMarkdown(exercise: CodingExerciseDetail): void {
        try {
            let markdown = `# ${exercise.title}\n\n`;
            markdown += `**Difficulty:** ${exercise.difficulty}\n`;
            markdown += `**Category:** ${exercise.category}\n`;
            markdown += `**Language:** ${exercise.programmingLanguage}\n`;
            markdown += `**Points:** ${exercise.points}\n`;
            markdown += `**Time Limit:** ${exercise.timeLimitSeconds}s\n`;
            markdown += `**Memory Limit:** ${exercise.memoryLimitMB}MB\n\n`;
            markdown += `---\n\n`;
            markdown += `## Description\n\n${exercise.description}\n\n`;
            markdown += `## Problem Statement\n\n${exercise.problemStatement}\n\n`;

            if (exercise.inputFormat) {
                markdown += `## Input Format\n\n${exercise.inputFormat}\n\n`;
            }

            if (exercise.outputFormat) {
                markdown += `## Output Format\n\n${exercise.outputFormat}\n\n`;
            }

            if (exercise.constraints) {
                markdown += `## Constraints\n\n${exercise.constraints}\n\n`;
            }

            if (exercise.sampleInput && exercise.sampleOutput) {
                markdown += `## Sample Input\n\n\`\`\`\n${exercise.sampleInput}\n\`\`\`\n\n`;
                markdown += `## Sample Output\n\n\`\`\`\n${exercise.sampleOutput}\n\`\`\`\n\n`;
            }

            if (exercise.testCases && exercise.testCases.length > 0) {
                markdown += `## Test Cases\n\n`;
                exercise.testCases.forEach((tc, idx) => {
                    markdown += `### Test Case ${idx + 1} ${tc.isHidden ? '(Hidden)' : ''}\n\n`;
                    markdown += `**Input:**\n\`\`\`\n${tc.input}\n\`\`\`\n\n`;
                    markdown += `**Expected Output:**\n\`\`\`\n${tc.expectedOutput}\n\`\`\`\n\n`;
                    markdown += `**Points:** ${tc.points}\n\n`;
                });
            }

            const blob = new Blob([markdown], { type: 'text/markdown' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${exercise.title.replace(/\s+/g, '_')}_exercise.md`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error('Error exporting exercise to Markdown:', error);
            throw new Error('Failed to export exercise to Markdown');
        }
    },

    /**
     * Download exercise template example
     */
    downloadExerciseExample(): void {
        const example: CreateCodingExerciseRequest = {
            title: 'Two Sum Problem',
            description: 'Find two numbers in an array that add up to a target value',
            difficulty: 'EASY',
            category: 'Array',
            programmingLanguage: 'Python',
            points: 10,
            timeLimitSeconds: 60,
            memoryLimitMB: 256,
            problemStatement: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
            inputFormat: 'First line: array of integers\nSecond line: target integer',
            outputFormat: 'Two space-separated indices',
            constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9',
            sampleInput: '[2, 7, 11, 15]\n9',
            sampleOutput: '0 1',
            testCases: [
                {
                    input: '[2, 7, 11, 15]\n9',
                    expectedOutput: '0 1',
                    isHidden: false,
                    points: 5,
                    testCaseOrder: 1,
                },
                {
                    input: '[3, 2, 4]\n6',
                    expectedOutput: '1 2',
                    isHidden: false,
                    points: 5,
                    testCaseOrder: 2,
                },
            ],
        };

        const json = JSON.stringify(example, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'coding_exercise_example.json';
        link.click();
        URL.revokeObjectURL(link.href);
    },
};

// ===== Helper Functions =====

function readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}

export default codingExerciseService;
