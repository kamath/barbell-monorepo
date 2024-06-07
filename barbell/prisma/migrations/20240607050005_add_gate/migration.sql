-- CreateTable
CREATE TABLE "GateLastOpened" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "GateLastOpened_pkey" PRIMARY KEY ("id")
);
