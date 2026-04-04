package com.truongsonkmhd.unetistudy.strategy.coding;

import java.nio.file.Path;
import java.util.List;

/**
 * Strategy interface for executing code in different programming languages.
 * Follows Open/Closed Principle: new languages can be added by implementing
 * this interface
 * without modifying existing execution logic.
 */
public interface LanguageRunner {

    /**
     * @return the primary name of the language (e.g., "java", "python")
     */
    String getLanguageName();

    /**
     * @return list of alternative names/extensions (e.g., ["py"], ["c++", "cpp"])
     */
    List<String> getAliases();

    /**
     * @return the name of the source code file (e.g., "Main.java", "main.py")
     */
    String getSourceFileName();

    /**
     * @return the Docker image used to run this language
     */
    String getDockerImage();

    /**
     * @param workingDir the directory containing the source code
     * @return the command to compile the code, or null if no compilation is needed
     */
    List<String> getCompileCommand(Path workingDir);

    /**
     * @return the command to run the compiled (or interpreted) code
     */
    List<String> getRunCommand();

    /**
     * Checks if this runner supports the given language string.
     * 
     * @param language the language string to check
     * @return true if supported
     */
    default boolean supports(String language) {
        if (language == null)
            return false;
        String lang = language.toLowerCase();
        return lang.equals(getLanguageName()) || getAliases().contains(lang);
    }
}
