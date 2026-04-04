package com.truongsonkmhd.unetistudy.repository.quiz;

import com.truongsonkmhd.unetistudy.model.quiz.template.QuizTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuizTemplateRepository extends JpaRepository<QuizTemplate, UUID> {
        Page<QuizTemplate> findByIsActiveTrue(Pageable pageable);

        Page<QuizTemplate> findByCategoryAndIsActiveTrue(String category, Pageable pageable);

        List<QuizTemplate> findTop10ByIsActiveTrueOrderByUsageCountDesc();

        @Query("SELECT DISTINCT qt FROM QuizTemplate qt LEFT JOIN FETCH qt.questionTemplates WHERE qt.id = :templateId AND qt.isDeleted = false")
        Optional<QuizTemplate> findByIdWithQuestions(@Param("templateId") UUID templateId);

        @Query("SELECT DISTINCT qt FROM QuizTemplate qt " +
                        "LEFT JOIN FETCH qt.questionTemplates qtpl " +
                        "LEFT JOIN FETCH qtpl.answerTemplates " +
                        "WHERE qt.id = :templateId AND qt.isDeleted = false")
        Optional<QuizTemplate> findByIdWithQuestionsAndAnswers(@Param("templateId") UUID templateId);

        @Query("SELECT qt FROM QuizTemplate qt WHERE qt.id = :id AND qt.isDeleted = false")
        Optional<QuizTemplate> findById(@Param("id") UUID id);

        Page<QuizTemplate> findByIsActiveTrueAndIsDeletedFalse(Pageable pageable);

        Page<QuizTemplate> findByCategoryAndIsActiveTrueAndIsDeletedFalse(String category, Pageable pageable);

        @Query("SELECT qt FROM QuizTemplate qt " +
                        "WHERE qt.isDeleted = false " +
                        "AND (:category IS NULL OR :category = '' OR qt.category = :category) " +
                        "AND (:isActive IS NULL OR qt.isActive = :isActive) " +
                        "AND (:searchTerm IS NULL OR :searchTerm = '' OR " +
                        "     LOWER(qt.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                        "     LOWER(qt.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
        Page<QuizTemplate> searchTemplates(
                        @Param("category") String category,
                        @Param("isActive") Boolean isActive,
                        @Param("searchTerm") String searchTerm,
                        Pageable pageable);

        List<QuizTemplate> findTop10ByIsActiveTrueAndIsDeletedFalseOrderByUsageCountDesc();

        @Query("SELECT DISTINCT qt.category FROM QuizTemplate qt WHERE qt.category IS NOT NULL AND qt.isDeleted = false ORDER BY qt.category")
        List<String> findAllCategories();

        boolean existsByIdAndIsDeletedFalse(UUID id);
}