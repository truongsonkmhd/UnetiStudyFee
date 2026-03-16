package com.truongsonkmhd.unetistudy.configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JudgeRabbitConfig {

    public static final String JUDGE_EXCHANGE = "judge.exchange";
    public static final String JUDGE_RETRY_EXCHANGE = "judge.retry.exchange";

    public static final String QUEUE_SUBMIT = "judge.submit.queue";
    public static final String QUEUE_SUBMIT_RETRY = "judge.submit.retry.queue";
    public static final String QUEUE_SUBMIT_DLQ = "judge.submit.dlq";

    public static final String RK_SUBMIT = "judge.submit";
    public static final String RK_SUBMIT_RETRY = "judge.submit.retry";
    public static final String RK_SUBMIT_DLQ = "judge.submit.dlq";

    public static final String QUEUE_RUN = "judge.run.queue";
    public static final String RK_RUN = "judge.run";

    // retry delay (ms)
    public static final int RETRY_TTL_MS = 5000;

    @Bean
    public DirectExchange judgeExchange() {
        return new DirectExchange(JUDGE_EXCHANGE, true, false);
    }

    @Bean
    public DirectExchange judgeRetryExchange() {
        return new DirectExchange(JUDGE_RETRY_EXCHANGE, true, false);
    }

    /**
     * MAIN queue: khi reject(requeue=false) => DLX sang retry exchange
     */
    @Bean
    public Queue submitQueue() {
        return QueueBuilder.durable(QUEUE_SUBMIT)
                .withArgument("x-dead-letter-exchange", JUDGE_RETRY_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", RK_SUBMIT_RETRY)
                .build();
    }

    /**
     * RETRY queue: giữ message RETRY_TTL_MS rồi DLX quay về main exchange
     */
    @Bean
    public Queue submitRetryQueue() {
        return QueueBuilder.durable(QUEUE_SUBMIT_RETRY)
                .withArgument("x-message-ttl", RETRY_TTL_MS)
                .withArgument("x-dead-letter-exchange", JUDGE_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", RK_SUBMIT)
                .build();
    }

    /**
     * DLQ: nơi chứa message fail quá số lần
     */
    @Bean
    public Queue submitDlq() {
        return QueueBuilder.durable(QUEUE_SUBMIT_DLQ).build();
    }

    @Bean
    public Binding submitBinding() {
        return BindingBuilder.bind(submitQueue()).to(judgeExchange()).with(RK_SUBMIT);
    }

    @Bean
    public Binding submitRetryBinding() {
        return BindingBuilder.bind(submitRetryQueue()).to(judgeRetryExchange()).with(RK_SUBMIT_RETRY);
    }

    @Bean
    public Binding submitDlqBinding() {
        return BindingBuilder.bind(submitDlq()).to(judgeExchange()).with(RK_SUBMIT_DLQ);
    }

    @Bean
    public Queue runQueue() {
        return QueueBuilder.durable(QUEUE_RUN).build();
    }

    @Bean
    public Binding runBinding() {
        return BindingBuilder.bind(runQueue()).to(judgeExchange()).with(RK_RUN);
    }

    // JSON converter (giống bạn đã làm)
    @Bean
    public Jackson2JsonMessageConverter jacksonConverter(ObjectMapper objectMapper) {
        return new Jackson2JsonMessageConverter(objectMapper);
    }
}
