-- CreateEnum
CREATE TYPE "Occupation" AS ENUM ('DEVELOPER', 'DESIGNER', 'MANAGER', 'OTHER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "occupation" "Occupation" NOT NULL DEFAULT 'OTHER';
