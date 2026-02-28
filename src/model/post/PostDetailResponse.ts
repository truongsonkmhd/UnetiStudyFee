import { UserResponse } from "../UserResponse";

export enum PostStatus {
    DRAFT = "DRAFT",
    PUBLISHED = "PUBLISHED",
    ARCHIVED = "ARCHIVED"
}

export interface PostDetailResponse {
    postId: string;
    title: string;
    slug: string;
    content: string;
    summary: string;
    thumbnailUrl: string;
    author: UserResponse;
    category: string;
    tags: string[];
    viewCount: number;
    status: PostStatus;
    isPublished: boolean;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
}
