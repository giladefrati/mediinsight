import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Document } from "./Document";

@Entity("analyses")
@Index(["documentId", "createdAt"])
export class Analysis {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("uuid")
  documentId: string;

  @Column("text")
  summary: string;

  @Column("json")
  insights: {
    keyFindings: string[];
    concerns: string[];
    recommendations: string[];
  };

  @Column("json")
  healthCard: {
    overallStatus: "good" | "fair" | "concerning" | "critical";
    vitals: Array<{
      name: string;
      value: string;
      status: "normal" | "abnormal" | "borderline";
      referenceRange?: string;
    }>;
    conditions: string[];
    medications: string[];
  };

  @Column("json")
  timeline: Array<{
    date: string;
    event: string;
    type: "test" | "diagnosis" | "treatment" | "medication" | "other";
    details?: string;
  }>;

  @Column("json")
  suggestedQuestions: string[];

  @Column("varchar", { length: 50, default: "completed" })
  status: "processing" | "completed" | "failed";

  @Column("text", { nullable: true })
  errorMessage: string | null;

  @Column("int", { nullable: true })
  processingTimeSeconds: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Document, (document) => document.analyses, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "documentId" })
  document: Document;
}
