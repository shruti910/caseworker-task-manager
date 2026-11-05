package uk.gov.hmcts.dts.taskmanager.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenAPIConfig {

    @Bean
    public OpenAPI taskManagerOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("HMCTS DTS Caseworker Task Management API")
                        .description("RESTful service providing task lifecycle operations for HMCTS caseworkers. " +
                                "Supports task creation, querying with sorting/filtering, status updates, and deletions.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Caseworker Task Manager Support")
                                .email("support@example.com"))
                        .license(new License()
                                .name("Practice Assessment License")
                                .url("https://example.com/license")));
    }
}

