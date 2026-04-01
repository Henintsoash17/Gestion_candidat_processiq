import { Candidate } from "../models/candidate.model.js";

export class CandidateService {
  static async getAll(
    page: number = 1,
    limit: number = 10,
    filters: { status?: string; search?: string } = {}
  ) {
    const query: any = { isDeleted: false };

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { email: { $regex: filters.search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const candidates = await Candidate.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });
    const total = await Candidate.countDocuments(query);

    return {
      candidates: candidates.map((c) => ({ ...c.toObject(), id: c._id.toString() })),
      total,
    };
  }

  static async create(data: any) {
    const candidate = await Candidate.create(data);
    return { ...candidate.toObject(), id: candidate._id.toString() };
  }

  static async findById(id: string) {
    const candidate = await Candidate.findOne({ _id: id, isDeleted: false });
    return candidate ? { ...candidate.toObject(), id: candidate._id.toString() } : null;
  }

  static async update(id: string, data: any) {
    const candidate = await Candidate.findOneAndUpdate({ _id: id, isDeleted: false }, data, {
      new: true,
    });
    return candidate ? { ...candidate.toObject(), id: candidate._id.toString() } : null;
  }

  static async softDelete(id: string) {
    const candidate = await Candidate.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    return candidate ? { ...candidate.toObject(), id: candidate._id.toString() } : null;
  }

  static async validate(id: string) {
    await new Promise((r) => setTimeout(r, 2000));

    const candidate = await Candidate.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { status: "validated" },
      { new: true }
    );
    return candidate ? { ...candidate.toObject(), id: candidate._id.toString() } : null;
  }

  static async reject(id: string) {
    const candidate = await Candidate.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { status: "rejected" },
      { new: true }
    );
    return candidate ? { ...candidate.toObject(), id: candidate._id.toString() } : null;
  }
}
