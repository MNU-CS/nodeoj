import java.io.BufferedInputStream;
import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(new BufferedInputStream(System.in));
        try {
            int a = sc.nextInt(), b = sc.nextInt();
            System.out.println(a + b);
        } finally {
            sc.close();
        }
    }
}