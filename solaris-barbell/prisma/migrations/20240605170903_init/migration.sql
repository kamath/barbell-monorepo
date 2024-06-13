-- CreateTable
CREATE TABLE "GarageLastOpened" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "GarageLastOpened_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EndpointHit" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "endpoint" TEXT NOT NULL,
    "body" TEXT NOT NULL,

    CONSTRAINT "EndpointHit_pkey" PRIMARY KEY ("id")
);
