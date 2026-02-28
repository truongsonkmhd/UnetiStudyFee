import apiService from "@/apis/apiService";
import { PageResponse } from "@/model/common/PageResponse";
import { CreateQuizTemplateRequest } from "@/model/quiz-template/CreateQuizTemplateRequest";
import { QuizTemplateDetail } from "@/model/quiz-template/QuizTemplateDetail";
import { UpdateQuizTemplateRequest } from "@/model/quiz-template/UpdateQuizTemplateRequest";

const QUIZ_BASE_ENDPOINT = "/admin/quiz-templates";

interface SearchTemplateParams {
  page?: number;
  size?: number;
  category?: string;
  isActive?: boolean;
  searchTerm?: string;
}

const quizTemplateService = {

  /**
   * Create a new quiz template
   */
  createTemplate: (payload: CreateQuizTemplateRequest): Promise<QuizTemplateDetail> =>
    apiService.post<QuizTemplateDetail>(QUIZ_BASE_ENDPOINT, payload),

  /**
   * Update an existing quiz template
   */
  updateTemplate: (templateId: string, payload: UpdateQuizTemplateRequest): Promise<QuizTemplateDetail> =>
    apiService.put<QuizTemplateDetail>(`${QUIZ_BASE_ENDPOINT}/${templateId}`, payload),

  /**
   * Delete template (soft delete)
   */
  deleteTemplate: (templateId: string): Promise<void> =>
    apiService.patch<void>(`${QUIZ_BASE_ENDPOINT}/${templateId}`),

  /**
   * Get template by ID
   */
  getTemplateById: (templateId: string): Promise<QuizTemplateDetail> =>
    apiService.get<QuizTemplateDetail>(`${QUIZ_BASE_ENDPOINT}/${templateId}`),

  /**
   * Get all categories
   */
  getAllCategory: (): Promise<string[]> =>
    apiService.get<string[]>(`${QUIZ_BASE_ENDPOINT}/categories`),

  /**
   * Toggle template status (active/inactive)
   */
  toggleTemplateStatus: (templateId: string, isActive: boolean): Promise<void> =>
    apiService.patch<void>(`${QUIZ_BASE_ENDPOINT}/${templateId}/status?isActive=${isActive}`),

  /**
   * Search templates with filters
   * Using URLSearchParams approach (consistent with contest search)
   */
  searchTemplates: (params: SearchTemplateParams): Promise<PageResponse<QuizTemplateDetail>> => {
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) queryParams.append('page', String(params.page));
    if (params.size !== undefined) queryParams.append('size', String(params.size));
    if (params.category) queryParams.append('category', params.category);
    if (params.isActive !== undefined) queryParams.append('isActive', String(params.isActive));
    if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);

    return apiService.get<PageResponse<QuizTemplateDetail>>(
      `${QUIZ_BASE_ENDPOINT}/search?${queryParams}`
    );
  },

  /**
   * Get most used templates
   */
  getMostUsedTemplates: (): Promise<QuizTemplateDetail[]> =>
    apiService.get<QuizTemplateDetail[]>(`${QUIZ_BASE_ENDPOINT}/most-used`),

  /**
   * Duplicate template
   */
  duplicateTemplate: (templateId: string, newName: string): Promise<QuizTemplateDetail> =>
    apiService.post<QuizTemplateDetail>(
      `${QUIZ_BASE_ENDPOINT}/${templateId}/duplicate?newName=${encodeURIComponent(newName)}`
    ),

  /**
   * Create quiz from template
   */
  createQuizFromTemplate: (templateId: string): Promise<string> =>
    apiService.post<string>(`${QUIZ_BASE_ENDPOINT}/${templateId}/create-quiz`),

  // ===== Import/Export Functions =====

  /**
   * Export template to Excel/CSV
   */
  exportTemplateToExcel(template: QuizTemplateDetail): void {
    try {
      const rows = [
        ['Quiz Template Export'],
        ['Template Name', template.templateName],
        ['Description', template.description],
        ['Category', template.category],
        ['Pass Score', template.passScore.toString()],
        ['Max Attempts', (template.maxAttempts || 3).toString()],
        [],
        ['Questions'],
        [
          '#',
          'Question Content',
          'Order',
          'Time Limit (sec)',
          'Points',
          'Answer 1',
          'Correct 1',
          'Answer 2',
          'Correct 2',
          'Answer 3',
          'Correct 3',
          'Answer 4',
          'Correct 4',
        ],
      ];

      template.questions?.forEach((q, idx) => {
        const row: string[] = [
          (idx + 1).toString(),
          q.content,
          q.questionOrder.toString(),
          q.timeLimitSeconds.toString(),
          q.points.toString(),
        ];

        for (let i = 0; i < 4; i++) {
          if (q.answers?.[i]) {
            row.push(q.answers[i].content, q.answers[i].isCorrect ? 'TRUE' : 'FALSE');
          } else {
            row.push('', 'FALSE');
          }
        }

        rows.push(row);
      });

      const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${template.templateName.replace(/\s+/g, '_')}_template.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error exporting template:', error);
      throw new Error('Failed to export template to Excel');
    }
  },

  /**
   * Import template from Excel/CSV file
   */
  async importTemplateFromExcel(file: File): Promise<QuizTemplateDetail> {
    try {
      const text = await readFileAsText(file);
      const rows = parseCSV(text);

      const templateName = rows[1]?.[1] || 'Imported Template';
      const description = rows[2]?.[1] || '';
      const category = rows[3]?.[1] || 'General';
      const passScore = parseFloat(rows[4]?.[1] || '70');
      const maxAttempts = parseInt(rows[5]?.[1] || '3');

      const questions: any[] = [];

      for (let i = 9; i < rows.length; i++) {
        const row = rows[i];
        if (row.length < 5 || !row[1]) continue;

        const answers: any[] = [];
        for (let j = 0; j < 4; j++) {
          const answerIdx = 5 + j * 2;
          const correctIdx = answerIdx + 1;
          if (row[answerIdx]) {
            answers.push({
              content: row[answerIdx],
              isCorrect: row[correctIdx]?.toUpperCase() === 'TRUE',
              answerOrder: j + 1,
            });
          }
        }

        if (answers.length > 0) {
          questions.push({
            content: row[1],
            questionOrder: parseInt(row[2]) || i - 8,
            timeLimitSeconds: parseInt(row[3]) || 60,
            points: parseFloat(row[4]) || 1,
            answers,
          });
        }
      }

      const request: CreateQuizTemplateRequest = {
        templateName,
        description,
        category,
        passScore,
        maxAttempts,
        questions,
      };

      return await quizTemplateService.createTemplate(request);
    } catch (error) {
      console.error('Error importing template:', error);
      throw new Error('Failed to import template from Excel. Please check file format.');
    }
  },

  /**
   * Download template example file
   */
  downloadTemplateExample(): void {
    const rows = [
      ['Quiz Template Export'],
      ['Template Name', 'Sample Quiz Template'],
      ['Description', 'This is a sample template for importing'],
      ['Category', 'Mathematics'],
      ['Pass Score', '70'],
      ['Max Attempts', '3'],
      [],
      ['Questions'],
      [
        '#',
        'Question Content',
        'Order',
        'Time Limit (sec)',
        'Points',
        'Answer 1',
        'Correct 1',
        'Answer 2',
        'Correct 2',
        'Answer 3',
        'Correct 3',
        'Answer 4',
        'Correct 4',
      ],
      [
        '1',
        'What is 2 + 2?',
        '1',
        '60',
        '1',
        '3',
        'FALSE',
        '4',
        'TRUE',
        '5',
        'FALSE',
        '6',
        'FALSE',
      ],
      [
        '2',
        'What is 5 × 5?',
        '2',
        '60',
        '1',
        '20',
        'FALSE',
        '25',
        'TRUE',
        '30',
        'FALSE',
        '35',
        'FALSE',
      ],
    ];

    const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'quiz_template_example.csv';
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

function parseCSV(text: string): string[][] {
  const rows = text.split('\n').map((row) => {
    const matches = row.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g);
    return matches ? matches.map((cell) => cell.replace(/^"|"$/g, '').trim()) : [];
  });
  return rows;
}

export default quizTemplateService;


