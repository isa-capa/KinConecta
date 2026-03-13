package org.generation.socialNetwork.configuration;

import jakarta.servlet.http.HttpServletRequest;
import org.generation.socialNetwork.configuration.exception.ResourceNotFoundException;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class StaticContentController {

    @GetMapping({
            "/",
            "/index.html",
            "/favicon.ico",
            "/assets/**",
            "/components/**",
            "/pages/**",
            "/scripts/**",
            "/styles/**"
    })
    public ResponseEntity<Resource> serveStaticContent(HttpServletRequest request) {
        String requestPath = request.getRequestURI();
        String resourcePath = "/".equals(requestPath) ? "static/index.html" : "static" + requestPath;
        ClassPathResource resource = new ClassPathResource(resourcePath);

        if (!resource.exists()) {
            throw new ResourceNotFoundException("Resource not found");
        }

        MediaType mediaType = MediaTypeFactory.getMediaType(resource)
                .orElse(MediaType.APPLICATION_OCTET_STREAM);

        return ResponseEntity.ok()
                .contentType(mediaType)
                .body(resource);
    }
}
