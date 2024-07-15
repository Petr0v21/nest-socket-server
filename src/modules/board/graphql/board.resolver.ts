import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { LeaderBoardService } from '../board.service';
import { SuccessOutput } from 'src/common/graphql/output/SuccessOutput';
import { CreateLeaderBoardArgs } from './args/CraeteLeaderBoardArgs';
import { BadRequestException } from '@nestjs/common';
import { UpdateLeaderBoardArgs } from './args/UpdateLeaderBoardArgs';
import { LeaderBoardRewardService } from '../reward.service';
import { UniqueArgs } from 'src/common/graphql/args/UniqueArgs';
import { LeaderBoardDto } from './dto/LeaderBoard.dto';
import { FindManyArgs } from 'src/common/graphql/args/FindManyArgs';
import { LeaderService } from '../leader.service';

@Resolver()
export class LeaderBoardResolver {
  constructor(
    private readonly leaderService: LeaderService,
    private readonly boardService: LeaderBoardService,
    private readonly rewardService: LeaderBoardRewardService,
  ) {}

  @Query(() => LeaderBoardDto, { nullable: true })
  async getLeaderBoard(@Args() { skip, take }: FindManyArgs) {
    return await this.boardService.getActualLeaderBoard({
      skipLeaders: skip,
      takeLeaders: take,
    });
  }

  @Mutation(() => SuccessOutput)
  async createLeaderBoard(
    @Args() { rewards, ...args }: CreateLeaderBoardArgs,
  ): Promise<SuccessOutput> {
    const checkResult = await this.boardService.checkDateRangeLeaderBoard(
      args.startDate,
      args.endDate,
    );

    if (checkResult) {
      throw new BadRequestException(
        'In this date range already exist leader board',
      );
    }
    const result = await this.boardService.createLeaderBoard({
      ...args,
    });

    if (result.id && rewards && rewards.length) {
      await this.rewardService.createLeaderBoardRewards(
        rewards.map((item) => ({
          ...item,
          leaderBoardId: result.id,
        })),
      );
    }

    return { success: !!result };
  }

  @Mutation(() => SuccessOutput)
  async updateLeaderBoard(
    @Args() { rewards, ...args }: UpdateLeaderBoardArgs,
  ): Promise<SuccessOutput> {
    const leaderBoard = await this.boardService.leaderBoard(args.id);

    if (!leaderBoard) {
      throw new BadRequestException('Record with this id not exist!');
    }

    const checkResult = await this.boardService.checkDateRangeLeaderBoard(
      args.startDate,
      args.endDate,
    );

    if (checkResult && checkResult.id !== args.id) {
      throw new BadRequestException(
        'In this date range already exist leader board',
      );
    }

    const result = await this.boardService.updateLeaderBoard({
      where: {
        id: args.id,
      },
      data: {
        ...args,
      },
    });

    if (result && rewards) {
      const deletedRewards = leaderBoard.rewards.filter(
        (item) => !rewards.find((rew) => rew.id === item.id),
      );

      await this.rewardService.deleteManyLeaderBoardReward(
        deletedRewards.map((item) => item.id),
      );

      for (let i = 0; i < rewards.length; i++) {
        const { id, ...body } = rewards[i];

        await this.rewardService.upsertLeaderBoardReward({
          create: {
            amount: body.amount!,
            order: body.order!,
            leaderBoard: {
              connect: {
                id: leaderBoard.id,
              },
            },
          },
          update: body,
          where: {
            id: id ?? '',
          },
        });
      }
    }

    return { success: !!result };
  }

  @Mutation(() => SuccessOutput)
  async deleteLeaderBoard(@Args() { id }: UniqueArgs): Promise<SuccessOutput> {
    const leaderBoard = await this.boardService.leaderBoard(id);

    if (!leaderBoard) {
      throw new BadRequestException('Record with this id not exist!');
    }

    await this.leaderService.deleteLeaders({
      leaderBoardId: leaderBoard.id,
    });

    await this.rewardService.deleteManyLeaderBoardReward(
      leaderBoard.rewards.map((item) => item.id),
    );

    const result = await this.boardService.deleteLeaderBoard({
      id,
    });

    return { success: !!result };
  }
}
