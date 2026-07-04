/*
  Warnings:

  - You are about to drop the column `departmentId` on the `classes` table. All the data in the column will be lost.
  - You are about to drop the column `departmentId` on the `subjects` table. All the data in the column will be lost.
  - Added the required column `branchId` to the `classes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `branchId` to the `subjects` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "classes" DROP CONSTRAINT "classes_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "subjects" DROP CONSTRAINT "subjects_departmentId_fkey";

-- AlterTable
ALTER TABLE "classes" DROP COLUMN "departmentId",
ADD COLUMN     "branchId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "subjects" DROP COLUMN "departmentId",
ADD COLUMN     "branchId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
