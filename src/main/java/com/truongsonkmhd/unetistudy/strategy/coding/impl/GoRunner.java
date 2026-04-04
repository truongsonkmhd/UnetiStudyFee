package com.truongsonkmhd.unetistudy.strategy.coding.impl;

import com.truongsonkmhd.unetistudy.strategy.coding.LanguageRunner;
import org.springframework.stereotype.Component;

import java.nio.file.Path;
import java.util.Arrays;
import java.util.List;

@Component
public class GoRunner implements LanguageRunner {
    @Override
    public String getLanguageName() {
        return "go";
    }

    @Override
    public List<String> getAliases() {
        return List.of();
    }

    @Override
    public String getSourceFileName() {
        return "main.go";
    }

    @Override
    public String getDockerImage() {
        return "go-runner:latest";
    }

    @Override
    public List<String> getCompileCommand(Path workingDir) {
        return Arrays.asList("go", "build", "-o", "main", "main.go");
    }

    @Override
    public List<String> getRunCommand() {
        return List.of("./main");
    }
}
