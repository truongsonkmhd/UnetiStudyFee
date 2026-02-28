import { BaseService } from "./BaseService";
import { PostRequest } from "../model/post/PostRequest";
import { PostDetailResponse } from "../model/post/PostDetailResponse";
import { PageResponse } from "@/model/common/PageResponse";
import { IResponseMessage } from "@/model/common/IResponseMessage";

class PostService extends BaseService {
    constructor() {
        super("/posts");
    }

    async createPost(request: PostRequest): Promise<PostDetailResponse> {
        const formData = new FormData();
        formData.append("title", request.title);
        formData.append("content", request.content);
        formData.append("summary", request.summary || "");
        if (request.thumbnailFile) {
            formData.append("thumbnailFile", request.thumbnailFile);
        }
        if (request.category) {
            formData.append("category", request.category);
        }
        if (request.tags) {
            request.tags.forEach(tag => formData.append("tags", tag));
        }
        if (request.isPublished !== undefined) {
            formData.append("isPublished", request.isPublished.toString());
        }

        const response = await this.apiClient.post<IResponseMessage>(``, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data.data;
    }

    async updatePost(postId: string, request: PostRequest): Promise<PostDetailResponse> {
        const formData = new FormData();
        formData.append("title", request.title);
        formData.append("content", request.content);
        formData.append("summary", request.summary || "");
        if (request.thumbnailFile) {
            formData.append("thumbnailFile", request.thumbnailFile);
        }
        if (request.category) {
            formData.append("category", request.category);
        }
        if (request.tags) {
            request.tags.forEach(tag => formData.append("tags", tag));
        }
        if (request.isPublished !== undefined) {
            formData.append("isPublished", request.isPublished.toString());
        }

        const response = await this.apiClient.put<IResponseMessage>(`/${postId}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data.data;
    }

    async getPostById(postId: string): Promise<PostDetailResponse> {
        const response = await this.apiClient.get<IResponseMessage>(`/${postId}`);
        return response.data.data;
    }

    async getPostBySlug(slug: string): Promise<PostDetailResponse> {
        const response = await this.apiClient.get<IResponseMessage>(`/slug/${slug}`);
        return response.data.data;
    }

    async getAllPosts(params: {
        page?: number;
        size?: number;
        q?: string;
        status?: string;
        category?: string;
        authorId?: string;
    }): Promise<PageResponse<any>> {
        const queryParams = new URLSearchParams();
        if (params.page !== undefined) queryParams.append("page", params.page.toString());
        if (params.size !== undefined) queryParams.append("size", params.size.toString());
        if (params.q) queryParams.append("q", params.q);
        if (params.status) queryParams.append("status", params.status);
        if (params.category) queryParams.append("category", params.category);
        if (params.authorId) queryParams.append("authorId", params.authorId);

        const response = await this.apiClient.get<IResponseMessage>(`?${queryParams.toString()}`);
        return response.data.data;
    }

    async deletePost(postId: string): Promise<boolean> {
        const response = await this.apiClient.delete<IResponseMessage>(`/${postId}`);
        return response.data.status === true;
    }

    async uploadEditorImage(file: File): Promise<string> {
        const formData = new FormData();
        formData.append("file", file);
        const response = await this.apiClient.post<IResponseMessage>(`/upload-image`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data.data.url;
    }
}

const postService = new PostService();
export default postService;
