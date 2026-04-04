package com.truongsonkmhd.unetistudy.configuration;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.List;

@Component
public class AuthChannelInterceptor implements ChannelInterceptor {

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor acc = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (acc == null) return message;

        if (StompCommand.CONNECT.equals(acc.getCommand())) {
            // Header from client
            String userId = firstNativeHeader(acc, "X-User-Id");
            if (userId == null || userId.isBlank()) {
                throw new IllegalArgumentException("Missing X-User-Id");
            }

            Principal principal = () -> userId;
            acc.setUser(principal);
        }
        return message;
    }

    private String firstNativeHeader(StompHeaderAccessor acc, String key) {
        List<String> values = acc.getNativeHeader(key);
        return (values == null || values.isEmpty()) ? null : values.get(0);
    }
}

