package com.truongsonkmhd.unetistudy.service.infrastructure;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.hc.client5.http.classic.HttpClient;
import org.apache.hc.client5.http.config.RequestConfig;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.client5.http.impl.io.PoolingHttpClientConnectionManager;
import org.apache.hc.core5.util.Timeout;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class SupabaseStorageService {

    @Value("${supabase.url:https://xyz.supabase.co}")
    private String supabaseUrl;

    @Value("${supabase.key:your-service-role-key}")
    private String supabaseKey;

    @Value("${supabase.bucket:uneti-study}")
    private String bucketName;

    private RestTemplate restTemplate;

    @PostConstruct
    public void init() {
        PoolingHttpClientConnectionManager connectionManager = new PoolingHttpClientConnectionManager();
        connectionManager.setMaxTotal(100);
        connectionManager.setDefaultMaxPerRoute(20);

        RequestConfig requestConfig = RequestConfig.custom()
                .setConnectionRequestTimeout(Timeout.ofSeconds(60))
                .setResponseTimeout(Timeout.ofMinutes(10))
                .build();

        HttpClient httpClient = HttpClients.custom()
                .setConnectionManager(connectionManager)
                .setDefaultRequestConfig(requestConfig)
                .build();

        HttpComponentsClientHttpRequestFactory factory = new HttpComponentsClientHttpRequestFactory(httpClient);
        this.restTemplate = new RestTemplate(factory);
    }

    public String uploadFile(String folder, MultipartFile file) {
        try {
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            // Xóa khoảng trắng trong tên file nếu có
            filename = filename.replace(" ", "_");

            String uploadUrl = String.format("%s/storage/v1/object/%s/%s/%s",
                    supabaseUrl, bucketName, folder, filename);

            log.info("📤 Uploading to Supabase: {}/{}", folder, filename);

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + supabaseKey);
            headers.set("apikey", supabaseKey);

            String contentType = file.getContentType();
            if (contentType == null || contentType.isEmpty()) {
                contentType = "application/octet-stream";
            }
            headers.setContentType(MediaType.valueOf(contentType));

            HttpEntity<byte[]> requestEntity = new HttpEntity<>(file.getBytes(), headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    uploadUrl,
                    HttpMethod.POST,
                    requestEntity,
                    String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                String publicUrl = String.format("%s/storage/v1/object/public/%s/%s/%s",
                        supabaseUrl, bucketName, folder, filename);
                log.info("Upload OK: {}", publicUrl);
                return publicUrl;
            } else {
                log.error("Upload failed: {} - {}", response.getStatusCode(), response.getBody());
            }
        } catch (IOException e) {
            log.error("Error reading file: {}", e.getMessage());
        } catch (Exception e) {
            log.error("Supabase upload error: {}", e.getMessage(), e);
        }
        return null;
    }

    public String toDisplayUrl(String url) {
        return url;
    }

    /**
     * Deletes a file from Supabase storage using its public URL.
     * 
     * @param publicUrl The full public URL of the file (e.g., https://xyz.supabase.co/storage/v1/object/public/uneti-study/folder/filename.png)
     */
    public void deleteFile(String publicUrl) {
        if (publicUrl == null || publicUrl.isBlank()) {
            return;
        }

        try {
            // Convert Public URL to Object URL for deletion
            // From: .../storage/v1/object/public/{bucket}/{path}
            // To:   .../storage/v1/object/{bucket}/{path}
            String deleteUrl = publicUrl.replace("/storage/v1/object/public/", "/storage/v1/object/");

            log.info("🗑️ Deleting from Supabase: {}", deleteUrl);

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + supabaseKey);
            headers.set("apikey", supabaseKey);

            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    deleteUrl,
                    HttpMethod.DELETE,
                    requestEntity,
                    String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Delete OK: {}", publicUrl);
            } else {
                log.error("Delete failed: {} - {}", response.getStatusCode(), response.getBody());
            }
        } catch (Exception e) {
            log.error("Supabase delete error: {}", e.getMessage());
        }
    }
}
