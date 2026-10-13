import { TradeModel } from "../models/trade.model.js";
import type { CreateTradeDTO, TradeQueryFilters, ITrade } from "../types/trade.types.js";

export class TradeRepository {
  static async create(userId: string, data: CreateTradeDTO): Promise<ITrade> {
    const qty = data.quantity ?? data.lotSize ?? 1;
    const createData: Record<string, any> = {
      ...data,
      quantity: qty,
      lotSize: qty,
      userId,
      status: "open",
    };
    return (await TradeModel.create(createData)) as unknown as ITrade;
  }

  static async findManyByUser(userId: string, filters: TradeQueryFilters) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    const query: Record<string, any> = { userId };

    if (filters.symbol) query.symbol = filters.symbol.toUpperCase();
    if (filters.market) query.market = filters.market.toLowerCase();
    if (filters.status) query.status = filters.status;
    if (filters.direction) query.direction = filters.direction;

    if (filters.startDate || filters.endDate) {
      query.entryDate = {};
      if (filters.startDate) query.entryDate.$gte = filters.startDate;
      if (filters.endDate) query.entryDate.$lte = filters.endDate;
    }

    const sortField = filters.sortBy || "createdAt";
    const sortOrder = filters.sortOrder === "asc" ? 1 : -1;
    const sortOptions = { [sortField]: sortOrder } as Record<string, 1 | -1>;

    const [trades, total] = await Promise.all([
      TradeModel.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean<ITrade[]>(),
      TradeModel.countDocuments(query),
    ]);

    return {
      trades,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
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

  static async findAllByUser(userId: string): Promise<ITrade[]> {
    return await TradeModel.find({ userId }).sort({ entryDate: -1 }).lean<ITrade[]>();
  }
}
