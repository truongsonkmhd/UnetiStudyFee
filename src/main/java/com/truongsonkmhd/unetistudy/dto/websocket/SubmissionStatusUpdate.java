package com.truongsonkmhd.unetistudy.dto.websocket;

import java.util.UUID;

public record SubmissionStatusUpdate(UUID submissionId,String status){}
