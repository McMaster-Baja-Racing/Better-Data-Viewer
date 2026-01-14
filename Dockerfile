# All-in-One Dockerfile for Better Data Viewer
# Builds both frontend and backend into a single container
# Backend serves the frontend static files on port 8080

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app
COPY front-end/package*.json ./
RUN npm install --force

COPY front-end/ ./
RUN npm run build:frontend

# Stage 2: Build Backend
FROM maven:3.9-eclipse-temurin-21 AS backend-builder

WORKDIR /app
COPY backend/pom.xml ./
COPY backend/mvnw* ./
COPY backend/.mvn ./.mvn

RUN mvn dependency:go-offline

COPY backend/src ./src
RUN mvn package -DskipTests

# Stage 3: Runtime - Single Service
FROM registry.access.redhat.com/ubi8/openjdk-21:1.18

ENV LANGUAGE='en_US:en'

# Copy backend application
COPY --from=backend-builder --chown=185 /app/target/quarkus-app/lib/ /deployments/lib/
COPY --from=backend-builder --chown=185 /app/target/quarkus-app/*.jar /deployments/
COPY --from=backend-builder --chown=185 /app/target/quarkus-app/app/ /deployments/app/
COPY --from=backend-builder --chown=185 /app/target/quarkus-app/quarkus/ /deployments/quarkus/

# Copy frontend build to Quarkus static resources directory (served from classpath)
RUN mkdir -p /deployments/app/META-INF/resources && chown -R 185:185 /deployments/app/META-INF
COPY --from=frontend-builder --chown=185 /app/build/ /deployments/app/META-INF/resources/

# Create uploads directory (mount this as a volume!)
RUN mkdir -p /deployments/uploads && chown -R 185:185 /deployments/uploads

# Expose single port for both frontend and backend
EXPOSE 8080

USER 185

ENV JAVA_APP_JAR="/deployments/quarkus-run.jar"

ENTRYPOINT [ "/opt/jboss/container/java/run/run-java.sh" ]
