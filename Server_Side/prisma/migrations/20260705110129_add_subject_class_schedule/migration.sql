-- AlterTable
ALTER TABLE "subject_classes" ADD COLUMN     "endTime" TEXT,
ADD COLUMN     "scheduleDays" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN     "startTime" TEXT;
