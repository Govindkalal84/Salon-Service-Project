# Stage 1: Build the Maven application with Java 21
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy root pom and module folders
COPY pom.xml .
COPY booking-service ./booking-service
COPY category-service ./category-service
COPY eureka-server ./eureka-server
COPY gateway-server ./gateway-server
COPY notifications ./notifications
COPY payment-service ./payment-service
COPY review ./review
COPY salon-service ./salon-service
COPY service-offering ./service-offering
COPY user-service ./user-service

# Build argument with fallback default
ARG SERVICE_NAME=booking-service
ENV SERVICE_DIR=${SERVICE_NAME}

# Build only the requested module and its dependencies
RUN mvn clean package -pl ${SERVICE_DIR} -am -DskipTests

# Stage 2: Runtime image with Java 21
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Build argument with fallback default
ARG SERVICE_NAME=booking-service
ENV SERVICE_DIR=${SERVICE_NAME}

# Copy the generated JAR file from the build stage
COPY --from=build /app/${SERVICE_DIR}/target/*.jar app.jar

EXPOSE 8080 5005 5000 8070

ENTRYPOINT ["java", "-jar", "app.jar"]