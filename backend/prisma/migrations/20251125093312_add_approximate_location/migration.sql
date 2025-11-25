/*
  Warnings:

  - Added the required column `exactLatitude` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `exactLongitude` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locationArea` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "exactLatitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "exactLongitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "locationArea" TEXT NOT NULL;
