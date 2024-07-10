-- CreateEnum
CREATE TYPE "LeaderBoardStatus" AS ENUM ('CLOSED', 'ACTIVE', 'PENDING');

-- AlterTable
ALTER TABLE "LeaderBoard" ADD COLUMN     "status" "LeaderBoardStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "LeaderBoardReward" ALTER COLUMN "status" SET DEFAULT 'PENDING';
