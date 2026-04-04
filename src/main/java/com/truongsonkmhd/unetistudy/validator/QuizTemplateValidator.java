package com.truongsonkmhd.unetistudy.validator;

import com.truongsonkmhd.unetistudy.dto.quiz_dto.QuizTemplateDTO;
import com.truongsonkmhd.unetistudy.exception.custom_exception.OptimisticLockException;
import com.truongsonkmhd.unetistudy.model.quiz.template.QuizTemplate;
import org.springframework.stereotype.Component;

/**
 * Validator for QuizTemplate related operations.
 * Extracts validation logic from services to adhere to SRP.
 */
@Component
public class QuizTemplateValidator {

    /**
     * Validates the version for optimistic locking.
     * Throws OptimisticLockException if versions do not match.
     *
     * @param template        the existing template entity
     * @param providedVersion the version provided in the request
     */
    public void validateVersion(QuizTemplate template, Long providedVersion) {
        if (providedVersion != null && !providedVersion.equals(template.getVersion())) {
            throw new OptimisticLockException(
                    String.format(
                            "Template has been modified by another user. Current version: %d, Provided version: %d",
                            template.getVersion(), providedVersion));
        }
    }

    /**
     * Validates if the template is active for quiz creation.
     *
     * @param template the template entity
     */
    public void validateForQuizCreation(QuizTemplate template) {
        if (!Boolean.TRUE.equals(template.getIsActive())) {
            throw new IllegalStateException("Cannot create quiz from inactive template");
        }
    }
}
