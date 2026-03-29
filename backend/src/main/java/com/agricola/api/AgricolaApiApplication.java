package com.agricola.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class AgricolaApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(AgricolaApiApplication.class, args);
	}

}
