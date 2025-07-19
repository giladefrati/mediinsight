import "reflect-metadata";
import { config } from "dotenv";
import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Document } from "../entities/Document";
import { Analysis } from "../entities/Analysis";

// Load environment variables from .env.local
config({ path: ".env.local" });

export const AppDataSource = new DataSource({
  type: "postgres",
  ...(process.env.DATABASE_URL
    ? { url: process.env.DATABASE_URL }
    : {
        host: process.env.POSTGRES_HOST || "localhost",
        port: parseInt(process.env.POSTGRES_PORT || "5432"),
        username: process.env.POSTGRES_USER || "postgres",
        password: process.env.POSTGRES_PASSWORD || "postgres",
        database: process.env.POSTGRES_DATABASE || "postgres",
      }),
  ssl:
    process.env.DATABASE_URL?.includes("supabase.co") ||
    process.env.POSTGRES_HOST?.includes("supabase.co")
      ? { rejectUnauthorized: false }
      : false,
  synchronize: process.env.NODE_ENV !== "production", // Auto-sync in development
  logging: process.env.NODE_ENV === "development",
  entities: [User, Document, Analysis],
  migrations: ["src/migrations/*.ts"],
  subscribers: ["src/subscribers/*.ts"],
  // Connection pooling for production
  extra: {
    max: 20,
    min: 5,
    idle: 10000,
    evict: 60000,
    acquire: 30000,
  },
});

// Initialize the database connection
let isInitialized = false;

export const initializeDatabase = async () => {
  if (!isInitialized) {
    try {
      await AppDataSource.initialize();
      isInitialized = true;
      console.log("Database connection established successfully");
    } catch (error) {
      console.error("Error during database initialization:", error);
      throw error;
    }
  }
  return AppDataSource;
};

// Repository exports for easy access
export const getUserRepository = () => AppDataSource.getRepository(User);
export const getDocumentRepository = () =>
  AppDataSource.getRepository(Document);
export const getAnalysisRepository = () =>
  AppDataSource.getRepository(Analysis);
