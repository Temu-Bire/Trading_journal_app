import { TradeModel } from "./trade.model.js";
import type { CreateTradeDTO, UpdateTradeDTO, TradeQueryFilters, ITrade } from "./trade.types.js";

export class TradeRepository {
  static async create(userId: string, data: CreateTradeDTO): Promise<ITrade> {
    return await TradeModel.create({
      ...data,
      userId,
      status: "open",
    });
  }

  static async findManyByUser(userId: string, filters: TradeQueryFilters) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    const query: Record<string, any> = { userId };

    if (filters.symbol) query.symbol = filters.symbol.toUpperCase();
    if (filters.status) query.status = filters.status;
    if (filters.direction) query.direction = filters.direction;

    const [trades, total] = await Promise.all([
      TradeModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean<ITrade[]>(),
      TradeModel.countDocuments(query),
    ]);

    return {
      trades,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async findByIdAndUser(tradeId: string, userId: string): Promise<ITrade | null> {
    return await TradeModel.findOne({ _id: tradeId, userId }).lean<ITrade>();
  }

  static async findDocumentByIdAndUser(tradeId: string, userId: string) {
    return await TradeModel.findOne({ _id: tradeId, userId });
  }

  static async updateByIdAndUser(
    tradeId: string,
    userId: string,
    updates: Partial<ITrade>
  ): Promise<ITrade | null> {
    return await TradeModel.findOneAndUpdate(
      { _id: tradeId, userId },
      { $set: updates },
      { new: true, runValidators: true }
    ).lean<ITrade>();
  }

  static async deleteByIdAndUser(tradeId: string, userId: string): Promise<boolean> {
    const result = await TradeModel.deleteOne({ _id: tradeId, userId });
    return result.deletedCount > 0;
  }
}