package com.truongsonkmhd.unetistudy.configuration.security;

import com.truongsonkmhd.unetistudy.security.AuthoritiesConstants;
import com.truongsonkmhd.unetistudy.security.impl.JwtServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.web.BearerTokenAuthenticationEntryPoint;
import org.springframework.security.oauth2.server.resource.web.access.BearerTokenAccessDeniedHandler;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.servlet.util.matcher.MvcRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.handler.HandlerMappingIntrospector;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class SecurityConfiguration {

        private final JwtAuthenticationFilter jwtAuthFilter;

        private final AuthenticationProvider authenticationProvider;

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http, MvcRequestMatcher.Builder mvc) throws Exception {
                http
                                .cors(Customizer.withDefaults()) // cấu hình cors
                                .csrf(AbstractHttpConfigurer::disable)
                                .authorizeHttpRequests(
                                                authz -> authz
                                                                .requestMatchers(JwtServiceImpl.WHITE_LIST_URL)
                                                                .permitAll()
                                                                .requestMatchers(mvc.pattern("/api/v1/global-search/**"))
                                                                .hasAuthority(AuthoritiesConstants.STUDENT)
                                                                .requestMatchers(mvc.pattern("/api/permissions/**"))
                                                                .hasAnyAuthority(AuthoritiesConstants.ADMIN,
                                                                                AuthoritiesConstants.SYS_ADMIN)
                                                                .requestMatchers(mvc.pattern("/api/users/*")).hasAnyAuthority(AuthoritiesConstants.ADMIN, AuthoritiesConstants.SYS_ADMIN, AuthoritiesConstants.STUDENT, AuthoritiesConstants.TEACHER)
                                                                .requestMatchers(mvc.pattern("/api/users/upd/*")).hasAnyAuthority(AuthoritiesConstants.ADMIN, AuthoritiesConstants.SYS_ADMIN, AuthoritiesConstants.STUDENT, AuthoritiesConstants.TEACHER)
                                                                .requestMatchers(mvc.pattern("/api/users/*/avatar")).hasAnyAuthority(AuthoritiesConstants.ADMIN, AuthoritiesConstants.SYS_ADMIN, AuthoritiesConstants.STUDENT, AuthoritiesConstants.TEACHER)
                                                                .requestMatchers(mvc.pattern("/api/users/**"))
                                                                .hasAnyAuthority(AuthoritiesConstants.ADMIN,
                                                                                AuthoritiesConstants.SYS_ADMIN)
                                                                .requestMatchers(mvc.pattern("/api/roles/**"))
                                                                .hasAnyAuthority(AuthoritiesConstants.ADMIN,
                                                                                AuthoritiesConstants.SYS_ADMIN)
                                                                .requestMatchers(mvc.pattern("/api/courses/**"))
                                                                .hasAnyAuthority(AuthoritiesConstants.ADMIN,
                                                                                AuthoritiesConstants.SYS_ADMIN,
                                                                                AuthoritiesConstants.TEACHER,
                                                                                AuthoritiesConstants.STUDENT)
                                                                .requestMatchers(mvc.pattern("/api/course-module/**"))
                                                                .hasAnyAuthority(AuthoritiesConstants.ADMIN,
                                                                                AuthoritiesConstants.SYS_ADMIN,
                                                                                AuthoritiesConstants.TEACHER,
                                                                                AuthoritiesConstants.STUDENT)
                                                                .requestMatchers(mvc.pattern("/api/course-lesson/**"))
                                                                .hasAnyAuthority(AuthoritiesConstants.ADMIN,
                                                                                AuthoritiesConstants.SYS_ADMIN,
                                                                                AuthoritiesConstants.TEACHER)
                                                                .requestMatchers(mvc.pattern("/api/practice/lesson/**"))
                                                                .hasAnyAuthority(AuthoritiesConstants.ADMIN,
                                                                                AuthoritiesConstants.SYS_ADMIN,
                                                                                AuthoritiesConstants.STUDENT,
                                                                                AuthoritiesConstants.TEACHER)
                                                                .requestMatchers(mvc.pattern("/api/judge/**"))
                                                                .hasAnyAuthority(AuthoritiesConstants.ADMIN,
                                                                                AuthoritiesConstants.SYS_ADMIN,
                                                                                AuthoritiesConstants.STUDENT,
                                                                                AuthoritiesConstants.TEACHER)
                                                                .requestMatchers(mvc.pattern("/api/course-catalog/**"))
                                                                .hasAnyAuthority(AuthoritiesConstants.ADMIN,
                                                                                AuthoritiesConstants.SYS_ADMIN,
                                                                                AuthoritiesConstants.STUDENT,
                                                                                AuthoritiesConstants.TEACHER)
                                                                .requestMatchers(mvc.pattern(
                                                                                "/api/admin/courses/*/submit-approval"))
                                                                .hasAnyAuthority(AuthoritiesConstants.ADMIN,
                                                                                AuthoritiesConstants.SYS_ADMIN)
                                                                .requestMatchers(mvc.pattern("/admin/courses/*/reject"))
                                                                .hasAnyAuthority(AuthoritiesConstants.ADMIN,
                                                                                AuthoritiesConstants.SYS_ADMIN)
                                                                .requestMatchers(
                                                                                mvc.pattern("/admin/courses/*/approve"))
                                                                .hasAnyAuthority(AuthoritiesConstants.ADMIN,
                                                                                AuthoritiesConstants.SYS_ADMIN)
                                                                .requestMatchers(mvc.pattern("/published/scroll"))
                                                                .hasAnyAuthority(AuthoritiesConstants.ADMIN,
                                                                                AuthoritiesConstants.SYS_ADMIN,
                                                                                AuthoritiesConstants.TEACHER)
                                                                .requestMatchers(mvc.pattern(
                                                                                "/api/admin/coding-exercise-template/**"))
                                                                .hasAnyAuthority(AuthoritiesConstants.ADMIN,
                                                                                AuthoritiesConstants.SYS_ADMIN,
                                                                                AuthoritiesConstants.TEACHER)
                                                                .requestMatchers(mvc.pattern(
                                                                                "/api/admin/contest-lesson/**"))
                                                                .hasAnyAuthority(AuthoritiesConstants.ADMIN,
                                                                                AuthoritiesConstants.SYS_ADMIN,
                                                                                AuthoritiesConstants.TEACHER)
                                                                .requestMatchers(mvc.pattern("/api/admin/quiz/**"))
                                                                .hasAnyAuthority(AuthoritiesConstants.ADMIN,
                                                                                AuthoritiesConstants.SYS_ADMIN,
                                                                                AuthoritiesConstants.TEACHER)
                                                                .requestMatchers(mvc.pattern(
                                                                                "/api/admin/class-contests/**"))
                                                                .hasAnyAuthority(AuthoritiesConstants.ADMIN,
                                                                                AuthoritiesConstants.SYS_ADMIN,
                                                                                AuthoritiesConstants.TEACHER)
                                                                .requestMatchers(mvc.pattern("/api/admin/class/**"))
                                                                .hasAnyAuthority(AuthoritiesConstants.ADMIN,
                                                                                AuthoritiesConstants.SYS_ADMIN,
                                                                                AuthoritiesConstants.TEACHER)
                                                                .requestMatchers(mvc.pattern("/api/student/class/**"))
                                                                .hasAnyAuthority(AuthoritiesConstants.ADMIN,
                                                                                AuthoritiesConstants.SYS_ADMIN,
                                                                                AuthoritiesConstants.TEACHER,
                                                                                AuthoritiesConstants.STUDENT)
                                                                .requestMatchers(mvc.pattern(
                                                                                "/api/student/class-contests/**"))
                                                                .hasAnyAuthority(AuthoritiesConstants.ADMIN,
                                                                                AuthoritiesConstants.SYS_ADMIN,
                                                                                AuthoritiesConstants.TEACHER,
                                                                                AuthoritiesConstants.STUDENT)
                                                                .requestMatchers(mvc.pattern("/api/class/**"))
                                                                .hasAnyAuthority(AuthoritiesConstants.ADMIN,
                                                                                AuthoritiesConstants.SYS_ADMIN,
                                                                                AuthoritiesConstants.TEACHER)
                                                                .requestMatchers(mvc.pattern(
                                                                                "/api/admin/quiz-templates/**"))
                                                                .hasAnyAuthority(AuthoritiesConstants.ADMIN,
                                                                                AuthoritiesConstants.SYS_ADMIN,
                                                                                AuthoritiesConstants.TEACHER)
                                                                .requestMatchers(mvc.pattern(
                                                                                "/api/admin/managerment-cache/**"))
                                                                .hasAuthority(AuthoritiesConstants.SYS_ADMIN)
                                                                .requestMatchers(mvc.pattern("/api/enrollments/**"))
                                                                .hasAnyAuthority(AuthoritiesConstants.ADMIN,
                                                                                AuthoritiesConstants.SYS_ADMIN,
                                                                                AuthoritiesConstants.TEACHER,
                                                                                AuthoritiesConstants.STUDENT)
                                                                .requestMatchers(mvc.pattern("/api/quiz/**"))
                                                                .hasAnyAuthority(AuthoritiesConstants.ADMIN,
                                                                                AuthoritiesConstants.SYS_ADMIN,
                                                                                AuthoritiesConstants.TEACHER,
                                                                                AuthoritiesConstants.STUDENT)
                                                                .requestMatchers(mvc.pattern("/api/progress/**"))
                                                                .hasAnyAuthority(AuthoritiesConstants.ADMIN,
                                                                                AuthoritiesConstants.SYS_ADMIN,
                                                                                AuthoritiesConstants.TEACHER,
                                                                                AuthoritiesConstants.STUDENT))
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .exceptionHandling(
                                                exceptions -> exceptions
                                                                .authenticationEntryPoint(
                                                                                new BearerTokenAuthenticationEntryPoint())
                                                                .accessDeniedHandler(
                                                                                new BearerTokenAccessDeniedHandler()))
                                .authenticationProvider(authenticationProvider)
                                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
                return http.build();
        }

        @Bean
        MvcRequestMatcher.Builder mvc(HandlerMappingIntrospector introspector) {
                return new MvcRequestMatcher.Builder(introspector);
        }

        @Bean
        public WebSecurityCustomizer ignoreResources() {
                return webSecurity -> webSecurity
                                .ignoring()
                                .requestMatchers("/actuator/**", "/v3/**", "/webjars/**",
                                                "/swagger-ui*/*swagger-initializer.js", "/swagger-ui*/**",
                                                "/favicon.ico");
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration config = new CorsConfiguration();
                config.setAllowedOrigins(List.of(
                                "http://localhost:8080",
                                "http://localhost:8081",
                                "http://localhost:5173",
                                "http://localhost:4221",
                                "https://localhost:4221"));
                config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
                config.setAllowedHeaders(List.of("*"));
                config.setExposedHeaders(List.of("Authorization", "Link", "X-Total-Count"));
                config.setAllowCredentials(true);
                config.setMaxAge(1800L);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", config);
                return source;
        }

}