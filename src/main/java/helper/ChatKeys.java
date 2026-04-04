package helper;

import java.util.UUID;

public final class ChatKeys {
    private ChatKeys() {}
    public static String directKey(UUID a, UUID b) {
        return (a.compareTo(b) < 0) ? (a + ":" + b) : (b + ":" + a);
    }
}
