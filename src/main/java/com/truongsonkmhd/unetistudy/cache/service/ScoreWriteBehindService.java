package com.truongsonkmhd.unetistudy.cache.service;

import com.truongsonkmhd.unetistudy.cache.AppCacheService;
import com.truongsonkmhd.unetistudy.cache.CacheConstants;
import com.truongsonkmhd.unetistudy.cache.strategy.CacheStrategy;
import com.truongsonkmhd.unetistudy.model.quiz.UserQuizAttempt;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.*;
import java.util.function.Consumer;

/**
 * Service Write-Behind cho Quiz Scores
 * Ghi điểm thi vào cache ngay lập tức, sau đó batch write vào DB
 * Giảm tải database khi có nhiều người dùng hoàn thành bài kiểm tra cùng lúc
 */
@Service
@RequiredArgsConstructor
public class ScoreWriteBehindService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(ScoreWriteBehindService.class);

    private static final String SCORE_CACHE = "quiz_score_write_behind";
    private static final int BATCH_SIZE = 50;
    private static final int FLUSH_INTERVAL_SECONDS = 10;

    private final AppCacheService appCacheService;

    // Buffer để lưu scores chờ ghi vào DB
    private final ConcurrentHashMap<UUID, UserQuizAttempt> writeBuffer = new ConcurrentHashMap<>();

    // Executor để chạy background flush
    private ScheduledExecutorService flushExecutor;

    // Consumer để ghi vào DB (inject từ bên ngoài)
    private Consumer<UserQuizAttempt> databaseWriter;

    // Cache cho quick reads
    private CacheStrategy<UUID, UserQuizAttempt> scoreCache;

    @PostConstruct
    public void init() {
        // Tạo cache riêng cho scores
        scoreCache = appCacheService.createCaffeineCache(
                SCORE_CACHE,
                CacheConstants.SIZE_LARGE,
                CacheConstants.TTL_SHORT);

        // Start background flush
        flushExecutor = Executors.newSingleThreadScheduledExecutor(
                r -> new Thread(r, "score-write-behind"));

        flushExecutor.scheduleWithFixedDelay(
                this::flushToDatabase,
                FLUSH_INTERVAL_SECONDS,
                FLUSH_INTERVAL_SECONDS,
                TimeUnit.SECONDS);

        log.info("ScoreWriteBehindService initialized with flush interval: {}s", FLUSH_INTERVAL_SECONDS);
    }

    /**
     * Set database writer (được gọi từ configuration)
     */
    public void setDatabaseWriter(Consumer<UserQuizAttempt> writer) {
        this.databaseWriter = writer;
    }

    /**
     * Write-Behind: Ghi điểm thi
     * 1. Ghi vào cache ngay lập tức
     * 2. Thêm vào write buffer
     * 3. Background thread sẽ flush vào DB
     */
    public void recordScore(UserQuizAttempt attempt) {
        if (attempt == null || attempt.getAttemptId() == null) {
            log.warn("Invalid attempt, skipping");
            return;
        }

        UUID attemptId = attempt.getAttemptId();

        // 1. Ghi vào cache ngay
        scoreCache.put(attemptId, attempt);

        // 2. Thêm vào write buffer
        writeBuffer.put(attemptId, attempt);

        log.debug("Recorded score to buffer: attemptId={}, score={}", attemptId, attempt.getScore());

        // 3. Nếu buffer đầy, trigger flush ngay
        if (writeBuffer.size() >= BATCH_SIZE) {
            log.info("Write buffer full ({}), triggering immediate flush", writeBuffer.size());
            CompletableFuture.runAsync(this::flushToDatabase);
        }
    }

    /**
     * Lấy score từ cache
     */
    public UserQuizAttempt getScore(UUID attemptId) {
        // Kiểm tra write buffer trước (có thể chưa flush)
        UserQuizAttempt fromBuffer = writeBuffer.get(attemptId);
        if (fromBuffer != null) {
            return fromBuffer;
        }

        // Sau đó kiểm tra cache
        return scoreCache.get(attemptId).orElse(null);
    }

    /**
     * Flush tất cả scores trong buffer vào database
     */
    private void flushToDatabase() {
        if (writeBuffer.isEmpty()) {
            return;
        }

        if (databaseWriter == null) {
            log.warn("Database writer not set, cannot flush scores");
            return;
        }

        int bufferSize = writeBuffer.size();
        log.info("Flushing {} scores to database", bufferSize);

        // Copy buffer để tránh concurrent modification
        ConcurrentHashMap<UUID, UserQuizAttempt> toFlush = new ConcurrentHashMap<>(writeBuffer);
        writeBuffer.clear();

        int successCount = 0;
        int failCount = 0;

        for (UserQuizAttempt attempt : toFlush.values()) {
            try {
                databaseWriter.accept(attempt);
                successCount++;
                log.debug("Flushed score: attemptId={}", attempt.getAttemptId());
            } catch (Exception e) {
                failCount++;
                log.error("Failed to flush score: attemptId={}", attempt.getAttemptId(), e);
                // Put back to buffer for retry
                writeBuffer.put(attempt.getAttemptId(), attempt);
            }
        }

        log.info("Flush complete: success={}, failed={}", successCount, failCount);
    }

    /**
     * Force flush tất cả scores ngay lập tức
     */
    public void forceFlush() {
        log.info("Force flushing scores");
        flushToDatabase();
    }

    /**
     * Lấy số lượng scores trong buffer
     */
    public int getBufferSize() {
        return writeBuffer.size();
    }

    /**
     * Kiểm tra có scores pending không
     */
    public boolean hasPendingScores() {
        return !writeBuffer.isEmpty();
    }

    @PreDestroy
    public void shutdown() {
        log.info("Shutting down ScoreWriteBehindService...");

        // Flush remaining scores
        forceFlush();

        // Shutdown executor
        if (flushExecutor != null) {
            flushExecutor.shutdown();
            try {
                if (!flushExecutor.awaitTermination(30, TimeUnit.SECONDS)) {
                    flushExecutor.shutdownNow();
                }
            } catch (InterruptedException e) {
                flushExecutor.shutdownNow();
                Thread.currentThread().interrupt();
            }
        }

        log.info("ScoreWriteBehindService shut down");
    }
}
