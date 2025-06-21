import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "./User";
import { Analysis } from "./Analysis";

@Entity("documents")
@Index(["userId", "createdAt"])
export class Document {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("uuid")
  userId: string;

  @Column("varchar", { length: 255 })
  originalFileName: string;

  @Column("varchar", { length: 500 })
  firebaseStoragePath: string;

  @Column("varchar", { length: 500, nullable: true })
  firebaseStorageUrl: string | null;

  @Column("bigint")
  fileSizeBytes: number;

  @Column("varchar", { length: 50 })
  mimeType: string;

  @Column("text", { nullable: true })
  extractedText: string | null;

  @Column("varchar", { length: 50, default: "uploaded" })
  status: "uploaded" | "processing" | "completed" | "failed";

  @Column("text", { nullable: true })
  errorMessage: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.documents, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @OneToMany(() => Analysis, (analysis) => analysis.document)
  analyses: Analysis[];
}
