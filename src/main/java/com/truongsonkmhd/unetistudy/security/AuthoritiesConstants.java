package com.truongsonkmhd.unetistudy.security;

/**
 * Constants for Spring Security authorities.
 */
public final class AuthoritiesConstants {
    public static final String SYS_ADMIN = "SYS_ADMIN";

    public static final String ADMIN = "ROLE_ADMIN";

    public static final String STUDENT = "ROLE_STUDENT";

    public static final String TEACHER = "ROLE_TEACHER";

    public static final String FULL_ACCESS = "FULL_ACCESS";
    public static final String UPDATE_DATA = "UPDATE_DATA";
    public static final String CREATE_DATA = "CREATE_DATA";
    public static final String VIEW_DATA = "VIEW_DATA";
    public static final String UPLOAD_DATA = "UPLOAD_DATA";
    public static final String IMPORT_DATA = "IMPORT_DATA";
    public static final String EXPORT_DATA = "EXPORT_DATA";
    public static final String SHARE_DATA = "SHARE_DATA";
    public static final String SEND_DATA = "SEND_DATA";


    private AuthoritiesConstants() {}
}
