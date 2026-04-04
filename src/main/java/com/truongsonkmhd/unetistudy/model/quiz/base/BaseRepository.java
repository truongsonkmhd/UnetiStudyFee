package com.truongsonkmhd.unetistudy.model.quiz.base;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.NoRepositoryBean;

import java.util.Optional;
import java.util.UUID;

/**
 * Base repository interface for all entities extending BaseEntity
 * Provides common query methods with soft delete support
 */
@NoRepositoryBean
public interface BaseRepository<T extends BaseEntityQuiz> extends JpaRepository<T, UUID>, JpaSpecificationExecutor<T> {

    /**
     * Find by ID excluding soft-deleted records
     */
    default Optional<T> findByIdAndIsDeletedFalse(UUID id) {
        return findById(id).filter(entity -> !entity.getIsDeleted());
    }

    /**
     * Check if entity exists excluding soft-deleted records
     */
    default boolean existsByIdAndIsDeletedFalse(UUID id) {
        return findByIdAndIsDeletedFalse(id).isPresent();
    }

    /**
     * Soft delete an entity
     */
    default void softDelete(T entity) {
        entity.setIsDeleted(true);
        save(entity);
    }

    /**
     * Soft delete by ID
     */
    default void softDeleteById(UUID id) {
        findById(id).ifPresent(this::softDelete);
    }

    /**
     * Restore a soft-deleted entity
     */
    default void restore(T entity) {
        entity.setIsDeleted(false);
        save(entity);
    }

    /**
     * Restore by ID
     */
    default void restoreById(UUID id) {
        findById(id).ifPresent(this::restore);
    }
}