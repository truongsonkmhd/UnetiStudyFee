package com.truongsonkmhd.unetistudy.dto.a_common;

import lombok.*;

import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class CursorResponse<T> {
    private List<T> items;
    private String nextCursor;
    private boolean hasNext;
}
