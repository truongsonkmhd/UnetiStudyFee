package com.truongsonkmhd.unetistudy.dto.websocket;

import java.util.UUID;

public record RunStatusUpdate(UUID runId,String status){}
