package com.truongsonkmhd.unetistudy.security;

/**
 * Constants for Spring Security authorities.
 */
public final class AuthoritiesConstants {
    public static final String SYS_ADMIN = "ROLE_SYS_ADMIN";

    public static final String ADMIN = "ROLE_ADMIN";

    public static final String STUDENT = "ROLE_STUDENT";

    public static final String TEACHER = "ROLE_TEACHER";

    private AuthoritiesConstants() {
    }
}
