# Stage 1: Build the jar
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Copy maven wrapper and pom first (layer caching)
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn

# Download dependencies (cached unless pom.xml changes)
RUN ./mvnw dependency:go-offline -B

# Copy source and build
COPY src src
RUN ./mvnw package -DskipTests -B

# Stage 2: Run the jar
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

ENV JAVA_OPTS="\
  -Xms64m \
  -Xmx384m \
  -XX:+UseContainerSupport \
  -XX:MaxRAMPercentage=75.0 \
  -XX:+UseSerialGC \
  -XX:TieredStopAtLevel=1 \
  -Djava.security.egd=file:/dev/./urandom \
  -XX:+DisableExplicitGC \
  -noverify"

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]