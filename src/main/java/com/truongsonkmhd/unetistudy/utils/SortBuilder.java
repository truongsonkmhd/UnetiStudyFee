package com.truongsonkmhd.unetistudy.utils;

import org.springframework.data.domain.Sort;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Utility class for parsing sort strings and building Spring Data Sort objects.
 * Eliminates duplicate sort parsing logic across services.
 * 
 * Supports format: "fieldName:asc" or "fieldName:desc"
 * 
 * @author Clean Code Refactoring - Phase 2 (SRP)
 */
public final class SortBuilder {

    /**
     * Pattern to match sort strings in format: "fieldName:direction"
     * Examples: "createdAt:desc", "name:asc", "title:DESC"
     */
    private static final Pattern SORT_PATTERN = Pattern.compile("(\\w+?)(:)(.*)");

    private static final String ASC = "asc";

    private SortBuilder() {
        // Private constructor to prevent instantiation
        throw new UnsupportedOperationException("Utility class cannot be instantiated");
    }

    /**
     * Parse a single sort string into a Sort object.
     * 
     * @param sortBy sort string in format "fieldName:direction" (e.g.,
     *               "createdAt:desc")
     * @return Sort object, or unsorted if sortBy is null/empty/invalid
     */
    public static Sort parse(String sortBy) {
        List<Sort.Order> orders = parseToOrders(sortBy);
        return orders.isEmpty() ? Sort.unsorted() : Sort.by(orders);
    }

    /**
     * Parse a single sort string into a list of Sort.Order.
     * 
     * @param sortBy sort string in format "fieldName:direction"
     * @return list of Sort.Order (may be empty if sortBy is invalid)
     */
    public static List<Sort.Order> parseToOrders(String sortBy) {
        if (!StringUtils.hasLength(sortBy)) {
            return Collections.emptyList();
        }

        List<Sort.Order> orders = new ArrayList<>();
        Matcher matcher = SORT_PATTERN.matcher(sortBy.trim());

        if (matcher.find()) {
            String field = matcher.group(1);
            String direction = matcher.group(3);

            if (StringUtils.hasLength(field)) {
                Sort.Direction sortDirection = ASC.equalsIgnoreCase(direction)
                        ? Sort.Direction.ASC
                        : Sort.Direction.DESC;
                orders.add(new Sort.Order(sortDirection, field));
            }
        }

        return orders;
    }

    /**
     * Parse multiple sort strings into a Sort object.
     * 
     * @param sortStrings list of sort strings, each in format "fieldName:direction"
     * @return Sort object combining all valid sort orders
     */
    public static Sort parse(List<String> sortStrings) {
        List<Sort.Order> orders = parseToOrders(sortStrings);
        return orders.isEmpty() ? Sort.unsorted() : Sort.by(orders);
    }

    /**
     * Parse multiple sort strings into a list of Sort.Order.
     * 
     * @param sortStrings list of sort strings
     * @return combined list of Sort.Order from all valid sort strings
     */
    public static List<Sort.Order> parseToOrders(List<String> sortStrings) {
        if (sortStrings == null || sortStrings.isEmpty()) {
            return Collections.emptyList();
        }

        List<Sort.Order> allOrders = new ArrayList<>();
        for (String sortBy : sortStrings) {
            allOrders.addAll(parseToOrders(sortBy));
        }
        return allOrders;
    }

    /**
     * Create a Sort object for a single field with specified direction.
     * 
     * @param field     the field name to sort by
     * @param ascending true for ascending, false for descending
     * @return Sort object
     */
    public static Sort of(String field, boolean ascending) {
        return Sort.by(ascending ? Sort.Direction.ASC : Sort.Direction.DESC, field);
    }

    /**
     * Create a descending Sort for a single field.
     * 
     * @param field the field name to sort by
     * @return Sort object with descending direction
     */
    public static Sort descending(String field) {
        return Sort.by(Sort.Direction.DESC, field);
    }

    /**
     * Create an ascending Sort for a single field.
     * 
     * @param field the field name to sort by
     * @return Sort object with ascending direction
     */
    public static Sort ascending(String field) {
        return Sort.by(Sort.Direction.ASC, field);
    }
}
