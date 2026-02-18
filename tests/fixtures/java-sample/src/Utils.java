import java.util.ArrayList;
import java.util.HashMap;

public class Utils {
    public static void log(String message) {
        if (message != null) {
            System.out.println("LOG: " + message);
        }
    }

    public static String format(Object value) {
        if (value instanceof String) {
            return "String: " + value;
        } else if (value instanceof Integer) {
            return "Int: " + value;
        }
        return value.toString();
    }

    public void processItems() {
        ArrayList<String> items = new ArrayList<>();
        HashMap<String, Object> config = new HashMap<>();

        try {
            for (String item : items) {
                config.put(item, item.length());
            }
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
        }
    }

    public String getName() {
        return "Utils";
    }

    public void setDebug(boolean debug) {
        // setter
    }

    public static void main(String[] args) {
        log("Starting...");
    }
}
