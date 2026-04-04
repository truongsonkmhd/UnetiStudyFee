package com.truongsonkmhd.unetistudy.strategy.coding.impl;

import com.truongsonkmhd.unetistudy.strategy.coding.LanguageRunner;
import org.springframework.stereotype.Component;

import java.nio.file.Path;
import java.util.Arrays;
import java.util.List;

@Component
public class JavaRunner implements LanguageRunner {
    @Override
    public String getLanguageName() {
        return "java";
    }

    @Override
    public List<String> getAliases() {
        return List.of();
    }

    @Override
    public String getSourceFileName() {
        return "Main.java";
    }

    @Override
    public String getDockerImage() {
        return "java-runner:latest";
    }

    @Override
    public List<String> getCompileCommand(Path workingDir) {
        return Arrays.asList("javac", "Main.java");
    }

    @Override
    public List<String> getRunCommand() {
        return Arrays.asList("java", "Main");
    }
}
