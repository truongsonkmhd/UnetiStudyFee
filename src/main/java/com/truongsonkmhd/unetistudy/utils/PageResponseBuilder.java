package com.truongsonkmhd.unetistudy.utils;

import com.truongsonkmhd.unetistudy.dto.a_common.PageResponse;
import org.springframework.data.domain.Page;

/**
 * Utility class for building PageResponse objects from Spring Data Page
 * objects.
 * Provides a single point of responsibility for page response construction.
 * 
 * @author Clean Code Refactoring - Phase 2 (SRP)
 */
public final class PageResponseBuilder {

    private PageResponseBuilder() {
        // Private constructor to prevent instantiation
        throw new UnsupportedOperationException("Utility class cannot be instantiated");
    }

    /**
     * Build a PageResponse from a Spring Data Page object.
     *
     * @param page the Spring Data Page object
     * @param <T>  the type of elements in the page
     * @return a PageResponse containing the page data
     */
    public static <T> PageResponse<T> build(Page<T> page) {
        return PageResponse.<T>builder()
                .items(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .hasNext(page.hasNext())
                .build();
    }

    /**
     * Build a PageResponse with custom page number (useful when frontend uses
     * 1-based indexing).
     *
     * @param page       the Spring Data Page object
     * @param pageNumber custom page number to use in response
     * @param <T>        the type of elements in the page
     * @return a PageResponse containing the page data with custom page number
     */
    public static <T> PageResponse<T> buildWithCustomPageNumber(Page<T> page, int pageNumber) {
        return PageResponse.<T>builder()
                .items(page.getContent())
                .page(pageNumber)
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .hasNext(page.hasNext())
                .build();
    }

    /**
     * Build an empty PageResponse.
     *
     * @param page the requested page number
     * @param size the requested page size
     * @param <T>  the type of elements
     * @return an empty PageResponse
     */
    public static <T> PageResponse<T> empty(int page, int size) {
        return PageResponse.<T>builder()
                .items(java.util.Collections.emptyList())
                .page(page)
                .size(size)
                .totalElements(0L)
                .totalPages(0)
                .hasNext(false)
                .build();
    }
}
