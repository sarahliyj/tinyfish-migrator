import java.util.ArrayList;
import java.util.HashMap;

public final class User {
    private String name;
    private String email;
    private Integer age;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void printInfo() {
        if (name != null) {
            System.out.println("Name: " + name + ", Email: " + email);
        }
    }

    public static User fromMap(HashMap<String, String> map) {
        User user = new User();
        user.setName(map.get("name"));
        user.setEmail(map.get("email"));
        return user;
    }

    public boolean isAdult() {
        if (age != null) {
            return age >= 18;
        }
        return false;
    }

    public void process(Object item) {
        if (item instanceof String) {
            System.out.println("String: " + item);
        } else if (item instanceof Integer) {
            System.out.println("Integer: " + item);
        }
    }

    public void handleList() {
        ArrayList<String> names = new ArrayList<>();
        names.add("Alice");
        names.add("Bob");

        HashMap<String, Integer> scores = new HashMap<>();
        scores.put("Alice", 100);

        Runnable task = new Runnable() {
            @Override
            public void run() {
                System.out.println("Running task");
            }
        };
    }

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof User) {
            return this.name.equals(((User) obj).name);
        }
        return false;
    }
}
