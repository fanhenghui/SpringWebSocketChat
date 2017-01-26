package wad;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class Chatti {

    public static void main(String[] args) {
        SpringApplication.run(Chatti.class, args);
    }
}
