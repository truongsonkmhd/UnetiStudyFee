package com.truongsonkmhd.unetistudy.service;

import com.truongsonkmhd.unetistudy.dto.a_custom.GlobalSearchResponse;

public interface GlobalSearchService {
    GlobalSearchResponse quickSearch(String q, int limit);
}
