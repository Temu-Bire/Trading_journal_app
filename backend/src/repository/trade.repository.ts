import { TradeModel } from "../models/trade.model.js";
import type {
  CreateTradeDTO,
  TradeQueryFilters,
  ITrade,
  AllowedSortField,
} from "../types/trade.types.js";
import { ALLOWED_SORT_FIELDS } from "../types/trade.types.js";

export class TradeRepository {
  static async create(userId: string, data: CreateTradeDTO): Promise<ITrade> {
    const qty = data.quantity ?? data.lotSize ?? 1;
    const contractSize = data.contractSize ?? 1;
    const entryDate = data.entryAt ?? data.entryDate ?? data.entryTime ?? new Date();

    const createData: Record<string, any> = {
      ...data,
      userId,
      quantity: qty,
      lotSize: qty,
      contractSize,
      entryAt: entryDate,
      entryDate,
      status: "open",
    };

    const doc = await TradeModel.create(createData);
    return doc.toObject() as unknown as ITrade;
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
      query.$or = [
        {
          entryAt: {
            ...(filters.startDate ? { $gte: filters.startDate } : {}),
            ...(filters.endDate ? { $lte: filters.endDate } : {}),
          },
        },
        {
          entryDate: {
            ...(filters.startDate ? { $gte: filters.startDate } : {}),
            ...(filters.endDate ? { $lte: filters.endDate } : {}),
          },
        },
      ];
    }

    // Explicit allowlist validation for sorting
    const requestedSort = filters.sortBy as AllowedSortField | undefined;
    const sortField: AllowedSortField =
      requestedSort && (ALLOWED_SORT_FIELDS as readonly string[]).includes(requestedSort)
        ? requestedSort
        : "createdAt";

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

  static async findAllByUser(
    userId: string,
    filter: Record<string, any> = {}
  ): Promise<ITrade[]> {
    return await TradeModel.find({ userId, ...filter })
      .sort({ entryAt: -1, entryDate: -1 })
      .lean<ITrade[]>();
  }
}
