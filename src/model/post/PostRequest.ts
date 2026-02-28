export interface PostRequest {
    title: string;
    content: string;
    summary: string;
    thumbnailFile?: File | null;
    category?: string;
    tags?: string[];
    isPublished?: boolean;
}
