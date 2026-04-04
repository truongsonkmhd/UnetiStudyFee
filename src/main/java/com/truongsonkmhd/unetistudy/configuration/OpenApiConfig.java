package com.truongsonkmhd.unetistudy.configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import java.util.List;

@Configuration
public class OpenApiConfig {

        @Value("${jhipster.clientApp.name:UnetiStudyBee}")
        private String appName;

        @Bean
        public OpenAPI customOpenAPI() {
                return new OpenAPI()
                                .info(new Info()
                                                .title("Uneti Study Bee API")
                                                .description("API documentation for Uneti Study Bee application")
                                                .version("v1.0")
                                                .contact(new Contact()
                                                                .name("Trường Sơn")
                                                                .email("trongsonkmhd@gmail.com"))
                                                .license(new License()
                                                                .name("Apache 2.0")
                                                                .url("https://springdoc.org")))
                                .servers(List.of(
                                                new Server().url("http://localhost:8097").description("Local Server"),
                                                new Server().url("https://api.unetistudy.com")
                                                                .description("Production Server (Example)")))
                                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                                .components(new Components()
                                                .addSecuritySchemes("bearerAuth",
                                                                new SecurityScheme()
                                                                                .name("bearerAuth")
                                                                                .type(SecurityScheme.Type.HTTP)
                                                                                .scheme("bearer")
                                                                                .bearerFormat("JWT")));
        }
}
