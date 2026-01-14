# Solo Dockerfile for Quarkus Backend
FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /app
COPY pom.xml ./
COPY mvnw* ./
COPY .mvn ./.mvn

# Download dependencies
RUN mvn dependency:go-offline

# Copy source and build
COPY src ./src
RUN mvn package -DskipTests

# Runtime stage
FROM registry.access.redhat.com/ubi8/openjdk-21:1.18

ENV LANGUAGE='en_US:en'

# Copy application
COPY --from=builder --chown=185 /app/target/quarkus-app/lib/ /deployments/lib/
COPY --from=builder --chown=185 /app/target/quarkus-app/*.jar /deployments/
COPY --from=builder --chown=185 /app/target/quarkus-app/app/ /deployments/app/
COPY --from=builder --chown=185 /app/target/quarkus-app/quarkus/ /deployments/quarkus/

# Create uploads directory
RUN mkdir -p /deployments/uploads && chown -R 185:185 /deployments/uploads

EXPOSE 8080
USER 185

ENV JAVA_APP_JAR="/deployments/quarkus-run.jar"

ENTRYPOINT [ "/opt/jboss/container/java/run/run-java.sh" ]
