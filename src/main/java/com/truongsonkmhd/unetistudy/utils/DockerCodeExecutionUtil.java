package com.truongsonkmhd.unetistudy.utils;

import com.truongsonkmhd.unetistudy.strategy.coding.LanguageRunner;
import com.truongsonkmhd.unetistudy.strategy.coding.LanguageRunnerFactory;
import org.springframework.stereotype.Component;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Component
public class DockerCodeExecutionUtil {
    private static final int EXECUTION_TIMEOUT_SECONDS = 10;
    private static final int MEMORY_LIMIT_MB = 256;

    private final LanguageRunnerFactory runnerFactory;

    public DockerCodeExecutionUtil(LanguageRunnerFactory runnerFactory) {
        this.runnerFactory = runnerFactory;
    }

    /**
     * Biên dịch code (nếu cần) trong Docker container
     */
    public void compileInContainer(Path workingDir, String language) throws IOException, InterruptedException {
        LanguageRunner runner = runnerFactory.getRunnerOrThrow(language);
        List<String> compileCmd = runner.getCompileCommand(workingDir);

        if (compileCmd == null || compileCmd.isEmpty()) {
            return; // No compilation needed
        }

        List<String> dockerCommand = new ArrayList<>(Arrays.asList("docker", "run", "--rm",
                "--network", "none",
                "--memory=" + MEMORY_LIMIT_MB + "m",
                "--cpus=0.5",
                "-v", workingDir.toAbsolutePath() + ":/app",
                "-w", "/app",
                runner.getDockerImage()));
        dockerCommand.addAll(compileCmd);

        runDockerProcess(dockerCommand, "Lỗi biên dịch");
    }

    /**
     * Chạy code trong Docker container
     */
    public String runInContainer(Path workingDir, String language, String input)
            throws IOException, InterruptedException {
        LanguageRunner runner = runnerFactory.getRunnerOrThrow(language);
        String containerId = "code-exec-" + UUID.randomUUID().toString().substring(0, 8);
        String dockerImage = runner.getDockerImage();

        List<String> command = runner.getRunCommand();

        List<String> dockerCommand = new ArrayList<>(Arrays.asList(
                "docker", "run", "--rm", "--name", containerId,
                "--network", "none",
                "--memory=" + MEMORY_LIMIT_MB + "m",
                "--cpus=0.5",
                "-v", workingDir.toAbsolutePath() + ":/app",
                "-w", "/app",
                "-i",
                dockerImage));
        dockerCommand.addAll(command);

        ProcessBuilder builder = new ProcessBuilder(dockerCommand);
        builder.redirectErrorStream(true);
        Process process = builder.start();

        if (input != null && !input.isEmpty()) {
            try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(process.getOutputStream()))) {
                writer.write(input);
                writer.flush();
            }
        }

        if (!process.waitFor(EXECUTION_TIMEOUT_SECONDS, TimeUnit.SECONDS)) {
            try {
                new ProcessBuilder("docker", "kill", containerId).start().waitFor();
            } catch (Exception ignored) {
            }
            process.destroyForcibly();
            return " Chạy quá thời gian (" + EXECUTION_TIMEOUT_SECONDS + " giây)";
        }

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            return reader.lines().collect(Collectors.joining("\n"));
        }
    }

    /**
     * Chạy docker command (compile)
     */
    private static void runDockerProcess(List<String> dockerCommand, String errorMessage)
            throws IOException, InterruptedException {
        ProcessBuilder builder = new ProcessBuilder(dockerCommand);
        builder.redirectErrorStream(true);
        Process process = builder.start();

        if (!process.waitFor(EXECUTION_TIMEOUT_SECONDS, TimeUnit.SECONDS)) {
            process.destroyForcibly();
            throw new RuntimeException("⏰ " + errorMessage + " quá " + EXECUTION_TIMEOUT_SECONDS + " giây");
        }

        String output;
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            output = reader.lines().collect(Collectors.joining("\n"));
        }

        if (process.exitValue() != 0) {
            throw new CompilationException(output);
        }
    }

    public static void deleteDirectoryRecursively(Path path) {
        try {
            if (Files.exists(path)) {
                Files.walk(path)
                        .sorted(Comparator.reverseOrder())
                        .map(Path::toFile)
                        .forEach(File::delete);
            }
        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi xóa files", e);
        }
    }

    public static class CompilationException extends RuntimeException {
        private final String output;

        public CompilationException(String output) {
            super(output);
            this.output = output;
        }

        public String getOutput() {
            return output;
        }
    }
}
