package com.truongsonkmhd.unetistudy.strategy.coding.impl;

import com.truongsonkmhd.unetistudy.strategy.coding.LanguageRunner;
import org.springframework.stereotype.Component;

import java.nio.file.Path;
import java.util.Arrays;
import java.util.List;

@Component
public class CppRunner implements LanguageRunner {
    @Override
    public String getLanguageName() {
        return "cpp";
    }

    @Override
    public List<String> getAliases() {
        return Arrays.asList("c++", "cpp");
    }

    @Override
    public String getSourceFileName() {
        return "main.cpp";
    }

    @Override
    public String getDockerImage() {
        return "cpp-runner:latest";
    }

    @Override
    public List<String> getCompileCommand(Path workingDir) {
        return Arrays.asList("g++", "main.cpp", "-o", "main");
    }

    @Override
    public List<String> getRunCommand() {
        return List.of("./main");
    }
}
