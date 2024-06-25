FROM oven/bun:latest

COPY . .

RUN bun install
RUN bunx prisma generate
RUN bunx prisma migrate dev --schema=./src/prisma/schema.prisma
EXPOSE 3000
CMD ["bun", "run", "dev"]

