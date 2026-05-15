# 1. We must start with FROM
FROM node:20-alpine

# 2. Install pnpm
RUN npm install -g pnpm

# 3. Set work directory
WORKDIR /app

# 4. Copy package files
COPY package*.json pnpm-lock.yaml* ./

# 5. Install dependencies
RUN pnpm install

# 6. Copy everything else
COPY . .

# 7. Expose a port
EXPOSE 3000

# 8. Run the project
CMD ["pnpm", "dev"]
