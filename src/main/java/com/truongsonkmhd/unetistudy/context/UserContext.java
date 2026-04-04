package com.truongsonkmhd.unetistudy.context;

import java.util.UUID;

public class UserContext {
    private static final ThreadLocal<String> usernameHolder = new ThreadLocal<>();
    private static final ThreadLocal<UUID> userIDHolder = new ThreadLocal<>();

    public static void setUsername(String username) {
        usernameHolder.set(username);
    }

    public static String getUsername() {
        return usernameHolder.get();
    }

    public static void setUserID(UUID userID) {
        userIDHolder.set(userID);
    }

    public static UUID getUserID() {
        return userIDHolder.get();
    }

    public static void clear() {
        usernameHolder.remove();
        userIDHolder.remove();
    }
}
