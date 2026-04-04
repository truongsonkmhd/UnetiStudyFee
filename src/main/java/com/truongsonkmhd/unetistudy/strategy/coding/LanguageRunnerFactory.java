package com.truongsonkmhd.unetistudy.strategy.coding;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/**
 * Factory class for LanguageRunner strategies.
 * Provides the appropriate runner based on language string.
 */
@Component
public class LanguageRunnerFactory {

    private final List<LanguageRunner> runners;

    public LanguageRunnerFactory(List<LanguageRunner> runners) {
        this.runners = runners;
    }

    /**
     * Finds the runner that supports the given language.
     * 
     * @param language the language name or alias
     * @return an Optional containing the runner, or empty if not found
     */
    public Optional<LanguageRunner> getRunner(String language) {
        if (language == null || language.isBlank()) {
            return Optional.empty();
        }

        return runners.stream()
                .filter(r -> r.supports(language))
                .findFirst();
    }

    /**
     * Gets the runner for the language, or throws an exception if not supported.
     *
     * @param language the language name
     * @return the LanguageRunner implementation
     * @throws IllegalArgumentException if language is not supported
     */
    public LanguageRunner getRunnerOrThrow(String language) {
        return getRunner(language)
                .orElseThrow(() -> new IllegalArgumentException("Unsupported programming language: " + language));
    }
}
