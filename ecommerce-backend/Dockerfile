FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy the built jar — adjust path to match your build output
COPY target/*.jar app.jar

# Exact JVM tuning for Railway free (512MB container)
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