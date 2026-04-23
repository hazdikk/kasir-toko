package com.hazdik.kasirtoko;

import org.springframework.boot.SpringApplication;

public class TestKasirTokoApplication {

  public static void main(String[] args) {
    SpringApplication.from(KasirTokoApplication::main)
        .with(TestcontainersConfiguration.class)
        .run(args);
  }
}
