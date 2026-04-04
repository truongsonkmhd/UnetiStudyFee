package com.truongsonkmhd.unetistudy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class UnetiStudyApplication {

	public static void main(String[] args) {
		SpringApplication.run(UnetiStudyApplication.class, args);
	}

}
