package com.truongsonkmhd.unetistudy.controller;

import com.truongsonkmhd.unetistudy.dto.a_common.IResponseMessage;
import com.truongsonkmhd.unetistudy.dto.a_common.ResponseMessage;
import com.truongsonkmhd.unetistudy.service.infrastructure.SupabaseStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/files")
@Tag(name = "File Controller")
@Slf4j(topic = "FILE_CONTROLLER")
@RequiredArgsConstructor
public class FileController {

    private final SupabaseStorageService storageService;

    @Operation(summary = "Upload file", description = "Upload file to Supabase Storage")
    @PostMapping("/upload")
    public ResponseEntity<IResponseMessage> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "general") String folder) {
        
        log.info("Request to upload file: {} to folder: {}", file.getOriginalFilename(), folder);

        String fileUrl = storageService.uploadFile(folder, file);

            return ResponseEntity.ok().body(ResponseMessage.CreatedSuccess(fileUrl));
    }
}
