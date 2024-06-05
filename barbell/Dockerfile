FROM oven/bun:latest

COPY . .

RUN bun install
RUN bunx prisma generate
RUN bunx prisma migrate dev
EXPOSE 3000
CMD ["bun", "./src/index.ts"]

