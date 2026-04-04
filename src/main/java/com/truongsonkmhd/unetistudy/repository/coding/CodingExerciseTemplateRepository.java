package com.truongsonkmhd.unetistudy.repository.coding;

import com.truongsonkmhd.unetistudy.model.coding_template.CodingExerciseTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import com.truongsonkmhd.unetistudy.common.Difficulty;
import java.time.Instant;
import com.truongsonkmhd.unetistudy.dto.coding_exercise_dto.CodingExerciseTemplateCardResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

@Repository
public interface CodingExerciseTemplateRepository extends JpaRepository<CodingExerciseTemplate, UUID> {

    boolean existsBySlug(String slug);

    Optional<CodingExerciseTemplate> findBySlug(String slug);

    // ========== OFFSET PAGINATION ==========

    /**
     * Tìm tất cả templates đã published
     */
    @Query("""
                select new com.truongsonkmhd.unetistudy.dto.coding_exercise_dto.CodingExerciseTemplateCardResponse(
                    t.templateId, t.title, t.slug, t.difficulty, t.programmingLanguage,
                    t.category, t.points, t.usageCount, t.isPublished, t.createdAt
                )
                from CodingExerciseTemplate t
                where t.isPublished = true
                order by t.createdAt desc
            """)
    Page<CodingExerciseTemplateCardResponse> findPublishedTemplates(Pageable pageable);

    /**
     * Tìm tất cả templates (bao gồm cả chưa published - cho admin)
     */
    @Query("""
                select new com.truongsonkmhd.unetistudy.dto.coding_exercise_dto.CodingExerciseTemplateCardResponse(
                    t.templateId, t.title, t.slug, t.difficulty, t.programmingLanguage,
                    t.category, t.points, t.usageCount, t.isPublished, t.createdAt
                )
                from CodingExerciseTemplate t
                order by t.createdAt desc
            """)
    Page<CodingExerciseTemplateCardResponse> findAllTemplates(Pageable pageable);

    /**
     * Search templates với filters
     */
    @Query("""
                select new com.truongsonkmhd.unetistudy.dto.coding_exercise_dto.CodingExerciseTemplateCardResponse(
                    t.templateId, t.title, t.slug, t.difficulty, t.programmingLanguage,
                    t.category, t.points, t.usageCount, t.isPublished, t.createdAt
                )
                from CodingExerciseTemplate t
                where t.isPublished = true
                  and (:q is null or :q = '' or
                       lower(t.title) like lower(concat('%', :q, '%')) or
                       lower(t.slug) like lower(concat('%', :q, '%')) or
                       lower(t.category) like lower(concat('%', :q, '%'))
                  )
                  and (:difficulty is null or t.difficulty = :difficulty)
                  and (:category is null or :category = '' or lower(t.category) = lower(:category))
                  and (:language is null or :language = '' or lower(t.programmingLanguage) = lower(:language))
                order by t.createdAt desc
            """)
    Page<CodingExerciseTemplateCardResponse> searchTemplates(
            @Param("q") String q,
            @Param("difficulty") Difficulty difficulty,
            @Param("category") String category,
            @Param("language") String language,
            Pageable pageable);

    /**
     * Search tất cả templates (cho admin)
     */
    @Query("""
                select new com.truongsonkmhd.unetistudy.dto.coding_exercise_dto.CodingExerciseTemplateCardResponse(
                    t.templateId, t.title, t.slug, t.difficulty, t.programmingLanguage,
                    t.category, t.points, t.usageCount, t.isPublished, t.createdAt
                )
                from CodingExerciseTemplate t
                where (:q is null or :q = '' or
                       lower(t.title) like lower(concat('%', :q, '%')) or
                       lower(t.slug) like lower(concat('%', :q, '%')) or
                       lower(t.category) like lower(concat('%', :q, '%'))
                  )
                  and (:difficulty is null or t.difficulty = :difficulty)
                  and (:category is null or :category = '' or lower(t.category) = lower(:category))
                  and (:language is null or :language = '' or lower(t.programmingLanguage) = lower(:language))
                  and (:published is null or t.isPublished = :published)
                order by t.createdAt desc
            """)
    Page<CodingExerciseTemplateCardResponse> searchAllTemplates(
            @Param("q") String q,
            @Param("difficulty") Difficulty difficulty,
            @Param("category") String category,
            @Param("language") String language,
            @Param("published") Boolean published,
            Pageable pageable);

    // ========== CURSOR PAGINATION ==========

    @Query("""
                select new com.truongsonkmhd.unetistudy.dto.coding_exercise_dto.CodingExerciseTemplateCardResponse(
                    t.templateId, t.title, t.slug, t.difficulty, t.programmingLanguage,
                    t.category, t.points, t.usageCount, t.isPublished, t.createdAt
                )
                from CodingExerciseTemplate t
                where t.isPublished = true
                  and (t.createdAt < :createdAt or (t.createdAt = :createdAt and t.templateId < :lastId))
                order by t.createdAt desc
            """)
    Page<CodingExerciseTemplateCardResponse> findPublishedTemplatesAfterCursor(
            @Param("createdAt") Instant createdAt,
            @Param("lastId") UUID lastId,
            Pageable pageable);

    @Query("""
                select new com.truongsonkmhd.unetistudy.dto.coding_exercise_dto.CodingExerciseTemplateCardResponse(
                    t.templateId, t.title, t.slug, t.difficulty, t.programmingLanguage,
                    t.category, t.points, t.usageCount, t.isPublished, t.createdAt
                )
                from CodingExerciseTemplate t
                where t.isPublished = true
                  and (:q is null or :q = '' or
                       lower(t.title) like lower(concat('%', :q, '%')) or
                       lower(t.slug) like lower(concat('%', :q, '%')) or
                       lower(t.category) like lower(concat('%', :q, '%'))
                  )
                  and (:difficulty is null or t.difficulty = :difficulty)
                  and (:category is null or :category = '' or lower(t.category) = lower(:category))
                  and (:language is null or :language = '' or lower(t.programmingLanguage) = lower(:language))
                  and (t.createdAt < :createdAt or (t.createdAt = :createdAt and t.templateId < :lastId))
                order by t.createdAt desc
            """)
    Page<CodingExerciseTemplateCardResponse> searchTemplatesAfterCursor(
            @Param("q") String q,
            @Param("difficulty") Difficulty difficulty,
            @Param("category") String category,
            @Param("language") String language,
            @Param("createdAt") Instant createdAt,
            @Param("lastId") UUID lastId,
            Pageable pageable);
}