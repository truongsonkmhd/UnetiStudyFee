package com.truongsonkmhd.unetistudy.strategy.coding.impl;

import com.truongsonkmhd.unetistudy.strategy.coding.LanguageRunner;
import org.springframework.stereotype.Component;

import java.nio.file.Path;
import java.util.Arrays;
import java.util.List;

@Component
public class CSharpRunner implements LanguageRunner {
    @Override
    public String getLanguageName() {
        return "csharp";
    }

    @Override
    public List<String> getAliases() {
        return List.of("cs");
    }

    @Override
    public String getSourceFileName() {
        return "Main.cs";
    }

    @Override
    public String getDockerImage() {
        return "csharp-runner:latest";
    }

    @Override
    public List<String> getCompileCommand(Path workingDir) {
        return Arrays.asList("mcs", "-out:Main.exe", "Main.cs");
    }

    @Override
    public List<String> getRunCommand() {
        return Arrays.asList("mono", "Main.exe");
    }
}
