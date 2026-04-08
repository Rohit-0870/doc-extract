# Stage 1: Build the React app
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Pass build-time variables if needed (see section below)
# ARG REACT_APP_API_URL
# ENV REACT_APP_API_URL=$REACT_APP_API_URL
# RUN npm run build

# --- Version args ---
ARG BUILD_TIMESTAMP=unknown
ARG GIT_COMMIT=unknown
ARG SERVICE_NAME=frontend

# Write ver.json during build — shell is available in node:22-slim
RUN echo "{\"service\":\"${SERVICE_NAME}\",\"build_timestamp\":\"${BUILD_TIMESTAMP}\",\"git_commit\":\"${GIT_COMMIT}\"}" \
    > /app/ver.json

RUN npm run build || (echo "Build failed!" && exit 1)
RUN ls -la /app


# Stage 2: Serve with Nginx
FROM nginx:alpine
# Copy the build output to replace the default nginx contents
RUN rm /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# Copy ver.json from builder into nginx html root
COPY --from=build /app/ver.json /usr/share/nginx/html/ver.json

# Optional: Add a custom nginx config to handle React Router paths
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
