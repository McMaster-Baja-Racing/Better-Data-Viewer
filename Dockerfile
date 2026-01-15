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

# Stage 2: Build Rust Library
FROM rust:1.75-alpine AS rust-builder

WORKDIR /app
COPY binary-to-csv-lib/ ./

RUN apk add --no-cache musl-dev && \
    cargo build --release

# Stage 3: Build Backend
FROM maven:3.9-eclipse-temurin-21 AS backend-builder

WORKDIR /app
COPY backend/pom.xml ./
COPY backend/mvnw* ./
COPY backend/.mvn ./.mvn

RUN mvn dependency:go-offline

# Copy backend source
COPY backend/src ./src

# Copy frontend build into backend resources BEFORE building
COPY --from=frontend-builder /app/build/ ./src/main/resources/META-INF/resources/

# Now build backend with frontend included
RUN mvn package -DskipTests

# Stage 4: Runtime - Single Service
FROM registry.access.redhat.com/ubi8/openjdk-21:1.18

ENV LANGUAGE='en_US:en'

# Run as root to avoid permission issues with mounted volumes
USER root

# Copy backend application
COPY --from=backend-builder /app/target/quarkus-app/lib/ /deployments/lib/
COPY --from=backend-builder /app/target/quarkus-app/*.jar /deployments/
COPY --from=backend-builder /app/target/quarkus-app/app/ /deployments/app/
COPY --from=backend-builder /app/target/quarkus-app/quarkus/ /deployments/quarkus/

# Copy Rust library to standard location
RUN mkdir -p /deployments/lib/native
COPY --from=rust-builder /app/target/release/libbinary_to_csv_lib.so /deployments/lib/native/

# Create uploads directory
RUN mkdir -p /deployments/uploads

# Expose single port for both frontend and backend
EXPOSE 8080

ENV JAVA_APP_JAR="/deployments/quarkus-run.jar"

ENTRYPOINT [ "/opt/jboss/container/java/run/run-java.sh" ]
