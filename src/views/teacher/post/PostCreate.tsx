import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Image as ImageIcon,
    Type,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Code as CodeIcon,
    List as ListIcon,
    ListOrdered,
    Link as LinkIcon,
    MoreHorizontal,
    Undo,
    Redo,
    Upload,
    X,
    Plus,
    Settings2,
    FileText,
    Eye,
    CheckCircle2,
    Loader2,
    Trash2,
    Maximize2
} from 'lucide-react';
import postService from '@/services/postService';
import { PostRequest } from '@/model/post/PostRequest';
import { PostStatus } from '@/model/post/PostDetailResponse';
import { toast } from 'sonner';
import { PATHS } from '@/constants/paths';

const PostCreate: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditing = !!id;

    const [formData, setFormData] = useState<PostRequest>({
        title: '',
        content: '',
        summary: '',
        thumbnailFile: null,
        category: '',
        tags: [],
        isPublished: false
    });

    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tagInput, setTagInput] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing) {
            loadPostData(id!);
        }
    }, [id]);

    const loadPostData = async (postId: string) => {
        setLoading(true);
        try {
            const post = await postService.getPostById(postId);
            setFormData({
                title: post.title,
                content: post.content,
                summary: post.summary,
                category: post.category,
                tags: post.tags,
                isPublished: post.isPublished
            });
            setThumbnailPreview(post.thumbnailUrl);
        } catch (err) {
            toast.error('Không thể tải dữ liệu bài viết');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, thumbnailFile: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setThumbnailPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeThumbnail = () => {
        setFormData(prev => ({ ...prev, thumbnailFile: null }));
        setThumbnailPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!formData.tags?.includes(tagInput.trim())) {
                setFormData(prev => ({
                    ...prev,
                    tags: [...(prev.tags || []), tagInput.trim()]
                }));
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags?.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            toast.error('Vui lòng nhập tiêu đề bài viết');
            return;
        }

        setSubmitting(true);
        try {
            if (isEditing) {
                await postService.updatePost(id!, formData);
                toast.success('Cập nhật bài viết thành công!');
            } else {
                await postService.createPost(formData);
                toast.success('Tạo bài viết thành công!');
            }
            navigate(PATHS.HOME); // Redirect or go back
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu bài viết');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Top Header */}
            <div className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border shadow-sm">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-bold text-foreground tracking-tight">
                            {isEditing ? 'Sửa bài viết' : 'Thêm bài viết'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted rounded-xl transition-all"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex items-center gap-2 px-6 py-2 bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground rounded-xl font-bold transition-all shadow-lg shadow-primary/20 active:scale-95"
                        >
                            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Lưu bài viết
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 mt-8">
                <form className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content (Left Column) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Title & Category */}
                        <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden transition-all">
                            <div className="bg-muted/50 px-6 py-4 border-b border-border flex items-center gap-2 font-bold text-foreground">
                                <FileText size={20} className="text-primary" />
                                Thông tin cơ bản
                            </div>
                            <div className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-foreground mb-2">Tiêu đề bài viết <span className="text-destructive">*</span></label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="VD: Hướng dẫn học Java Spring Boot cho người mới"
                                        className="w-full px-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all text-foreground text-lg font-bold"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-foreground mb-2">Danh mục</label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-foreground"
                                        >
                                            <option value="">Chọn danh mục</option>
                                            <option value="Java">Java</option>
                                            <option value="Frontend">Frontend</option>
                                            <option value="Backend">Backend</option>
                                            <option value="DevOps">DevOps</option>
                                            <option value="Kinh nghiệm">Kinh nghiệm</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-foreground mb-2">Tags (Nhấn Enter để thêm)</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyDown={handleAddTag}
                                                placeholder="Thêm tag..."
                                                className="w-full px-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all text-foreground"
                                            />
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {formData.tags?.map(tag => (
                                                <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/20">
                                                    {tag}
                                                    <X size={12} className="cursor-pointer" onClick={() => removeTag(tag)} />
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-foreground mb-2">Tóm tắt ngắn</label>
                                    <textarea
                                        name="summary"
                                        rows={3}
                                        value={formData.summary}
                                        onChange={handleInputChange}
                                        placeholder="Tóm tắt về nội dung bài viết này..."
                                        className="w-full px-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all text-foreground"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Rich Text Editor Mockup */}
                        <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden flex flex-col h-[600px]">
                            <div className="bg-neutral-50 dark:bg-neutral-900 border-b border-border flex flex-wrap items-center p-1 gap-0.5">
                                {/* Editor Toolbar Mockup - Based on image */}
                                <div className="flex items-center p-1 gap-1 border-r border-border mr-1">
                                    <button type="button" className="p-1.5 hover:bg-muted rounded transition-colors"><Maximize2 size={16} /></button>
                                </div>

                                <div className="flex items-center p-1 gap-1 border-r border-border mr-1">
                                    <select className="bg-transparent text-xs font-medium outline-none px-1 h-8">
                                        <option>Paragraph</option>
                                        <option>Header 1</option>
                                        <option>Header 2</option>
                                    </select>
                                </div>

                                <div className="flex items-center p-1 gap-1 border-r border-border mr-1">
                                    <select className="bg-transparent text-xs font-medium outline-none px-1 h-8">
                                        <option>14</option>
                                        <option>16</option>
                                        <option>18</option>
                                    </select>
                                </div>

                                <div className="flex items-center p-1 gap-1 border-r border-border mr-1">
                                    <button type="button" className="p-1.5 hover:bg-muted rounded transition-colors"><Bold size={16} /></button>
                                    <button type="button" className="p-1.5 hover:bg-muted rounded transition-colors"><Italic size={16} /></button>
                                    <button type="button" className="p-1.5 hover:bg-muted rounded transition-colors"><Underline size={16} /></button>
                                    <button type="button" className="p-1.5 hover:bg-muted rounded transition-colors"><Strikethrough size={16} /></button>
                                    <button type="button" className="p-1.5 hover:bg-muted rounded transition-colors"><CodeIcon size={16} /></button>
                                </div>

                                <div className="flex items-center p-1 gap-1 border-r border-border mr-1">
                                    <button type="button" className="p-1.5 hover:bg-muted rounded transition-colors"><ListIcon size={16} /></button>
                                    <button type="button" className="p-1.5 hover:bg-muted rounded transition-colors"><ListOrdered size={16} /></button>
                                </div>

                                <div className="flex items-center p-1 gap-1 border-r border-border mr-1">
                                    <button type="button" className="p-1.5 hover:bg-muted rounded transition-colors text-primary"><ImageIcon size={16} /></button>
                                    <button type="button" className="p-1.5 hover:bg-muted rounded transition-colors"><LinkIcon size={16} /></button>
                                </div>

                                <div className="flex items-center p-1 gap-1 border-r border-border mr-1">
                                    <div className="w-6 h-6 rounded bg-black border border-border cursor-pointer"></div>
                                    <div className="w-6 h-6 rounded bg-red-500 border border-border cursor-pointer"></div>
                                </div>

                                <div className="flex items-center p-1 gap-1">
                                    <button type="button" className="p-1.5 hover:bg-muted rounded transition-colors"><Undo size={16} /></button>
                                    <button type="button" className="p-1.5 hover:bg-muted rounded transition-colors"><Redo size={16} /></button>
                                    <button type="button" className="p-1.5 hover:bg-muted rounded transition-colors"><MoreHorizontal size={16} /></button>
                                </div>
                            </div>

                            <div className="flex-1 relative">
                                <textarea
                                    name="content"
                                    value={formData.content}
                                    onChange={handleInputChange}
                                    placeholder="Viết nội dung bài viết tại đây..."
                                    className="w-full h-full p-8 bg-background outline-none resize-none text-foreground leading-relaxed prose prose-slate dark:prose-invert max-w-none"
                                />

                                {/* Status Bar Mockup */}
                                <div className="absolute bottom-0 left-0 right-0 bg-neutral-50 dark:bg-neutral-900 border-t border-border px-4 py-1.5 flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                    <div className="flex items-center gap-3">
                                        <span>Path: p</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span>Words: {formData.content.length > 0 ? formData.content.trim().split(/\s+/).length : 0}</span>
                                        <span>Chars: {formData.content.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Sidebar Settings) */}
                    <div className="space-y-6">

                        {/* Thumbnail Upload */}
                        <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
                            <div className="bg-muted/50 px-6 py-4 border-b border-border flex items-center gap-2 font-bold text-foreground">
                                <ImageIcon size={20} className="text-primary" />
                                Ảnh bìa (Thumbnail)
                            </div>
                            <div className="p-6">
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`relative aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${thumbnailPreview ? 'border-primary/50' : 'border-border hover:border-primary/30 hover:bg-muted/30'}`}
                                >
                                    {thumbnailPreview ? (
                                        <>
                                            <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <div className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white">
                                                    <Upload size={24} />
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); removeThumbnail(); }}
                                                className="absolute top-2 right-2 p-1.5 bg-destructive/80 text-white rounded-lg hover:bg-destructive transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3 text-muted-foreground">
                                                <Upload size={24} />
                                            </div>
                                            <p className="font-bold text-sm text-foreground">Tải ảnh lên</p>
                                            <p className="text-[10px] text-muted-foreground mt-1 text-center px-4 uppercase tracking-tighter">Hỗ trợ JPG, PNG, WEBP (Tối đa 5MB)</p>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleThumbnailChange}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Quick Settings */}
                        <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden sticky top-24">
                            <div className="bg-muted/50 px-6 py-4 border-b border-border flex items-center gap-2 font-bold text-foreground">
                                <Settings2 size={20} className="text-primary" />
                                Cấu hình bài viết
                            </div>
                            <div className="p-6 space-y-6">

                                <div className="pt-4 space-y-4">
                                    <div
                                        className="flex items-center justify-between p-4 bg-muted rounded-2xl group cursor-pointer hover:bg-primary/5 transition-colors"
                                        onClick={() => setFormData(p => ({ ...p, isPublished: !p.isPublished }))}
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-sm font-extrabold text-foreground">Xuất bản ngay</span>
                                            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter">Công khai cho sinh viên</span>
                                        </div>
                                        <div className={`w-12 h-6 rounded-full transition-all flex items-center px-1 ${formData.isPublished ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-all ${formData.isPublished ? 'translate-x-6' : 'translate-x-0'}`} />
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-2xl border border-dashed border-border">
                                        <div className="flex items-start gap-3">
                                            <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="text-sm font-bold text-foreground">Tự động SEO</h4>
                                                <p className="text-xs text-muted-foreground leading-relaxed">Chúng tôi tự động tạo slug tối ưu và cấu hình metadata dựa trên tiêu đề và tóm tắt của bạn.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-muted text-foreground border border-border rounded-2xl font-bold hover:bg-muted/80 transition-all active:scale-95"
                                    >
                                        <Eye size={18} />
                                        Xem thử (Preview)
                                    </button>

                                    {isEditing && (
                                        <button
                                            type="button"
                                            className="w-full flex items-center justify-center gap-2 py-3 px-4 text-destructive hover:bg-destructive/10 rounded-2xl font-bold transition-all border border-transparent hover:border-destructive/20"
                                        >
                                            <Trash2 size={18} />
                                            Xóa bài viết
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostCreate;
