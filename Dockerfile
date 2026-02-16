ARG NODE_VERSION=22.14.0

################################################################################
# Use node image for base image for all stages.
FROM node:${NODE_VERSION}-alpine as base

# Set working directory for all build stages.
WORKDIR /usr/src/app
RUN npm install serve -g

################################################################################
# Create a stage for building the application.
FROM base as build

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy the rest of the source files into the image.
COPY . .

# Set Vite env variables at build time (Vite inlines them during build)
ARG VITE_APP_BACKEND=http://localhost:3001
ENV VITE_APP_BACKEND=${VITE_APP_BACKEND}

# Run the build script.
RUN yarn run build

################################################################################
# Create a new stage to run the application with minimal runtime dependencies
# where the necessary files are copied from the build stage.
FROM base as final

# Use production node environment by default.
ENV NODE_ENV production

# Run the application as a non-root user.
USER node

# Copy the built application from the build stage into the image.
COPY --from=build /usr/src/app/dist ./dist


# Expose the port that the application listens on.
EXPOSE 3000

# Run the application.
CMD ["serve","-s","dist"]
