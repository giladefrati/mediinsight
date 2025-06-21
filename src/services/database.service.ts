import { Repository } from "typeorm";
import {
  initializeDatabase,
  getUserRepository,
  getDocumentRepository,
  getAnalysisRepository,
} from "../lib/database";
import { User } from "../entities/User";
import { Document } from "../entities/Document";
import { Analysis } from "../entities/Analysis";

export class DatabaseService {
  private userRepo: Repository<User>;
  private documentRepo: Repository<Document>;
  private analysisRepo: Repository<Analysis>;

  constructor() {
    this.initializeRepositories();
  }

  private async initializeRepositories() {
    await initializeDatabase();
    this.userRepo = getUserRepository() as Repository<User>;
    this.documentRepo = getDocumentRepository() as Repository<Document>;
    this.analysisRepo = getAnalysisRepository() as Repository<Analysis>;
  }

  // User operations
  async findOrCreateUser(
    firebaseUid: string,
    userData: {
      email: string;
      displayName?: string;
      photoURL?: string;
    }
  ): Promise<User> {
    await this.initializeRepositories();

    let user = await this.userRepo.findOne({ where: { firebaseUid } });

    if (!user) {
      user = this.userRepo.create({
        firebaseUid,
        email: userData.email,
        displayName: userData.displayName || null,
        photoURL: userData.photoURL || null,
      });
      await this.userRepo.save(user);
    } else {
      // Update user data if changed
      user.email = userData.email;
      user.displayName = userData.displayName || null;
      user.photoURL = userData.photoURL || null;
      await this.userRepo.save(user);
    }

    return user;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | null> {
    await this.initializeRepositories();
    return this.userRepo.findOne({ where: { firebaseUid } });
  }

  // Document operations
  async createDocument(
    userId: string,
    documentData: {
      originalFileName: string;
      firebaseStoragePath: string;
      firebaseStorageUrl?: string;
      fileSizeBytes: number;
      mimeType: string;
    }
  ): Promise<Document> {
    await this.initializeRepositories();

    const document = this.documentRepo.create({
      userId,
      ...documentData,
      status: "uploaded",
    });

    return this.documentRepo.save(document);
  }

  async getDocumentsByUserId(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<Document[]> {
    await this.initializeRepositories();

    return this.documentRepo.find({
      where: { userId },
      relations: ["analyses"],
      order: { createdAt: "DESC" },
      take: limit,
      skip: offset,
    });
  }

  async getDocumentById(
    documentId: string,
    userId: string
  ): Promise<Document | null> {
    await this.initializeRepositories();

    return this.documentRepo.findOne({
      where: { id: documentId, userId }, // Ensure user ownership
      relations: ["analyses"],
    });
  }

  async updateDocumentStatus(
    documentId: string,
    userId: string,
    status: Document["status"],
    errorMessage?: string,
    extractedText?: string
  ): Promise<void> {
    await this.initializeRepositories();

    await this.documentRepo.update(
      { id: documentId, userId }, // Ensure user ownership
      {
        status,
        errorMessage: errorMessage || null,
        extractedText: extractedText || undefined,
      }
    );
  }

  // Analysis operations
  async createAnalysis(
    documentId: string,
    analysisData: {
      summary: string;
      insights: Analysis["insights"];
      healthCard: Analysis["healthCard"];
      timeline: Analysis["timeline"];
      suggestedQuestions: string[];
      processingTimeSeconds?: number;
    }
  ): Promise<Analysis> {
    await this.initializeRepositories();

    const analysis = this.analysisRepo.create({
      documentId,
      ...analysisData,
      status: "completed",
    });

    return this.analysisRepo.save(analysis);
  }

  async getAnalysisById(
    analysisId: string,
    userId: string
  ): Promise<Analysis | null> {
    await this.initializeRepositories();

    // Join with document to ensure user ownership
    return this.analysisRepo
      .createQueryBuilder("analysis")
      .innerJoin("analysis.document", "document")
      .where("analysis.id = :analysisId", { analysisId })
      .andWhere("document.userId = :userId", { userId })
      .getOne();
  }

  async getAnalysesByUserId(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<Analysis[]> {
    await this.initializeRepositories();

    return this.analysisRepo
      .createQueryBuilder("analysis")
      .innerJoin("analysis.document", "document")
      .where("document.userId = :userId", { userId })
      .orderBy("analysis.createdAt", "DESC")
      .take(limit)
      .skip(offset)
      .getMany();
  }

  async updateAnalysisStatus(
    analysisId: string,
    userId: string,
    status: Analysis["status"],
    errorMessage?: string
  ): Promise<void> {
    await this.initializeRepositories();

    await this.analysisRepo
      .createQueryBuilder()
      .update(Analysis)
      .set({
        status,
        errorMessage: errorMessage || null,
      })
      .where("id = :analysisId", { analysisId })
      .andWhere(
        "documentId IN (SELECT id FROM documents WHERE userId = :userId)",
        { userId }
      )
      .execute();
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.initializeRepositories();
      await this.userRepo.query("SELECT 1");
      return true;
    } catch (error) {
      console.error("Database health check failed:", error);
      return false;
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
