package com.wexa.backend.service;

import org.neo4j.driver.Driver;
import org.neo4j.driver.Session;
import org.springframework.stereotype.Service;

@Service
public class DatabaseService {

    private final Driver driver;

    public DatabaseService(Driver driver) {
        this.driver = driver;
    }

    public String verifyConnection() {

        try (Session session = driver.session()) {

            String message = session.executeRead(tx ->
                    tx.run("RETURN 'Connected Successfully' AS message")
                      .single()
                      .get("message")
                      .asString());

            return message;
        }
    }
}