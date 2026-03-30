# Step 1: Build using Maven
FROM maven:3.9.9-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy all files
COPY . .

# Build jar
RUN mvn clean package -DskipTests

# Step 2: Run the app
FROM eclipse-temurin:17-jdk-jammy

WORKDIR /app

# Copy jar from builder
COPY --from=builder /app/target/*.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]