package com.truongsonkmhd.unetistudy.strategy.coding.impl;

import com.truongsonkmhd.unetistudy.strategy.coding.LanguageRunner;
import org.springframework.stereotype.Component;

import java.nio.file.Path;
import java.util.Arrays;
import java.util.List;

@Component
public class PythonRunner implements LanguageRunner {
    @Override
    public String getLanguageName() {
        return "python";
    }

    @Override
    public List<String> getAliases() {
        return List.of("py");
    }

    @Override
    public String getSourceFileName() {
        return "main.py";
    }

    @Override
    public String getDockerImage() {
        return "python-runner:latest";
    }

    @Override
    public List<String> getCompileCommand(Path workingDir) {
        return null; // Python doesn't need compilation
    }

    @Override
    public List<String> getRunCommand() {
        return Arrays.asList("python3", "main.py");
    }
}
