package com.truongsonkmhd.unetistudy.configuration;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable simple broker cho topic/queue
        config.enableSimpleBroker("/topic", "/queue");

        // Prefix cho messages từ client
        config.setApplicationDestinationPrefixes("/app");

        // Prefix cho user messages
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint để client connect
        registry.addEndpoint("/ws-submission", "/ws") // Support both old and new
                .setAllowedOriginPatterns("*") // Cho phép mọi origin (dev only)
                .withSockJS(); // Fallback cho browsers không support WebSocket
    }
}
