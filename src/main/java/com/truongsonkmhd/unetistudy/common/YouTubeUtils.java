package com.truongsonkmhd.unetistudy.common;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Utility class để xử lý YouTube URL
 * Hỗ trợ các định dạng:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 */
public class YouTubeUtils {

    // Pattern bắt video_id từ nhiều dạng URL YouTube khác nhau
    private static final Pattern YOUTUBE_PATTERN = Pattern.compile(
            "(?:youtube\\.com/(?:watch\\?v=|embed/|shorts/|v/)|youtu\\.be/)([A-Za-z0-9_-]{11})");

    private YouTubeUtils() {
    }

    /**
     * Trích xuất video_id từ YouTube URL.
     * Ví dụ: "https://www.youtube.com/watch?v=DjlGte968ko" → "DjlGte968ko"
     *
     * @param url YouTube URL bất kỳ dạng nào
     * @return video_id nếu hợp lệ, null nếu không parse được
     */
    public static String extractVideoId(String url) {
        if (url == null || url.isBlank())
            return null;

        // Nếu người dùng paste thẳng video_id (11 ký tự, không có //)
        if (url.matches("[A-Za-z0-9_-]{11}"))
            return url;

        Matcher matcher = YOUTUBE_PATTERN.matcher(url);
        return matcher.find() ? matcher.group(1) : null;
    }

    /**
     * Tạo URL embed chuẩn từ video_id để nhúng vào iframe.
     * Ví dụ: "DjlGte968ko" → "https://www.youtube.com/embed/DjlGte968ko"
     * @param videoId YouTube video_id
     * @return embed URL hoặc null nếu videoId rỗng
     */
    public static String toEmbedUrl(String videoId) {
        if (videoId == null || videoId.isBlank())
            return null;
        return "https://www.youtube.com/embed/" + videoId;
    }
}
