package com.truongsonkmhd.unetistudy.controller;

import com.truongsonkmhd.unetistudy.dto.a_common.IResponseMessage;
import com.truongsonkmhd.unetistudy.dto.a_common.ResponseMessage;
import com.truongsonkmhd.unetistudy.service.GlobalSearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/global-search")
@Slf4j(topic = "GLOBAL-SEARCH-CONTROLLER")
@Tag(name = "Global Search Controller", description = "Tìm kiếm tổng hợp toàn hệ thống")
@RequiredArgsConstructor
public class GlobalSearchController {

    private final GlobalSearchService globalSearchService;

    @GetMapping("/quick")
    @Operation(summary = "Tìm kiếm nhanh cả khóa học và lớp học song song")
    public ResponseEntity<IResponseMessage> quickSearch(
            @RequestParam String q,
            @RequestParam(defaultValue = "5") int limit) {
        log.info("Global Search - q: {}, limit: {}", q, limit);
        return ResponseEntity.ok()
                .body(ResponseMessage.LoadedSuccess(globalSearchService.quickSearch(q, limit)));
    }
}
