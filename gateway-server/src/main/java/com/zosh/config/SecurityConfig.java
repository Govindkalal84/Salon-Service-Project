package com.zosh.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverterAdapter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import reactor.core.publisher.Mono;

import java.lang.reflect.Array;
import java.util.Arrays;
import java.util.Collections;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public org.springframework.security.oauth2.jwt.ReactiveJwtDecoder jwtDecoder() {
        return org.springframework.security.oauth2.jwt.ReactiveJwtDecoders
                .fromIssuerLocation("https://lemur-18.cloud-iam.com/auth/realms/salon-auth-test");
    }

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {

        http.authorizeExchange(exchanges -> exchanges
                .pathMatchers("/auth/**").permitAll()
                .pathMatchers("/api/notifications/ws/**").permitAll()
                .pathMatchers("/api/categories/salon-owner/**",
                        "/api/notification/salon-owner/**",
                        "/api/service-offering/salon-owner/**")
                .hasAnyRole("SALON_OWNER")
                .pathMatchers("/api/salons/**",
                        "/api/categories/**",
                        "/api/notifications/**",
                        "/api/bookings/**",
                        "/api/payments/**",
                        "/api/service-offering/**",
                        "/api/users/**",
                        "/api/reviews/**")
                .hasAnyRole("CUSTOMER","SALON_OWNER","ADMIN")


        ).oauth2ResourceServer(oAuth2ResourceServerSpec -> oAuth2ResourceServerSpec
                .jwt(jwtSpec -> jwtSpec.jwtAuthenticationConverter(grantAuthoritiesExtractor())));

    http.csrf(ServerHttpSecurity.CsrfSpec::disable)
            .cors(cors-> cors.configurationSource(corsConfigrationSource()));


        return http.build();

    }

    private CorsConfigurationSource corsConfigrationSource() {

        CorsConfiguration configuration=new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000",
                "http://localhost:5170"

        ));
        configuration.setAllowedMethods(Arrays.asList("GET","POST","PUT", "DELETE","OPTIONS","PATCH"));
        configuration.setAllowedHeaders(Collections.singletonList("*"));
        configuration.setExposedHeaders(Collections.singletonList("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source=new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);


        return source;
    }

    private Converter<Jwt,? extends Mono<? extends AbstractAuthenticationToken>> grantAuthoritiesExtractor() {

        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(
                new KeycloakConverter());

        return new ReactiveJwtAuthenticationConverterAdapter(jwtAuthenticationConverter);

    }

}
