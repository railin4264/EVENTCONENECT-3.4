# Multi-stage build for EventConnect Mobile (React Native + Expo)
FROM node:18-alpine AS base

# Install dependencies for native modules and Android development
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    openjdk11-jdk \
    wget \
    unzip

# Set JAVA_HOME for Android SDK
ENV JAVA_HOME=/usr/lib/jvm/java-11-openjdk

# Install Android SDK
ENV ANDROID_HOME=/opt/android-sdk
ENV PATH=${PATH}:${ANDROID_HOME}/tools:${ANDROID_HOME}/platform-tools

RUN mkdir -p ${ANDROID_HOME} && \
    cd ${ANDROID_HOME} && \
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip && \
    unzip commandlinetools-linux-9477386_latest.zip && \
    rm commandlinetools-linux-9477386_latest.zip

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Install Expo CLI globally
RUN npm install -g @expo/cli

# Copy application code
COPY . .

# Expose port for Expo dev server
EXPOSE 8081
EXPOSE 19000
EXPOSE 19001
EXPOSE 19002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:19000/ || exit 1

# Start Expo dev server
CMD ["npx", "expo", "start", "--host", "0.0.0.0"]

# Development stage
FROM base AS development

# Copy application code
COPY . .

# Start in development mode
CMD ["npm", "start"]

# Test stage
FROM base AS test

# Copy application code
COPY . .

# Run tests
CMD ["npm", "test"]