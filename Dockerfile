# Use a Maven + JDK image to build
FROM maven:3.9.4-eclipse-temurin-17 AS build
WORKDIR /app

# Copy project files
COPY pom.xml .
COPY src ./src

# Build the JAR
RUN mvn clean package -DskipTests

# Second stage: slim JDK image
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app

# Copy the JAR from builder
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]