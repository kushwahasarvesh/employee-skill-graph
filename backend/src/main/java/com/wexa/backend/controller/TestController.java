package com.wexa.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import com.wexa.backend.service.DatabaseService;

@RestController
public class TestController {
    private final DatabaseService databaseService;

    public TestController(DatabaseService databaseService) {
        this.databaseService = databaseService;
    }

    @GetMapping("/test")
    public String testConnection() {
        return databaseService.verifyConnection();
    }
}