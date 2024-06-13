-- AlterTable
ALTER TABLE "EndpointHit" ADD COLUMN     "environmentId" TEXT NOT NULL DEFAULT 'PROD';

-- AlterTable
ALTER TABLE "GarageLastOpened" ADD COLUMN     "environmentId" TEXT NOT NULL DEFAULT 'PROD';

-- AlterTable
ALTER TABLE "GateLastOpened" ADD COLUMN     "environmentId" TEXT NOT NULL DEFAULT 'PROD';

-- AddForeignKey
ALTER TABLE "GarageLastOpened" ADD CONSTRAINT "GarageLastOpened_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "Environment"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GateLastOpened" ADD CONSTRAINT "GateLastOpened_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "Environment"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EndpointHit" ADD CONSTRAINT "EndpointHit_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "Environment"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
