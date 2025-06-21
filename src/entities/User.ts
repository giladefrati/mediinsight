import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from "typeorm";
import { Document } from "./Document";

@Entity("users")
@Index(["firebaseUid"], { unique: true })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("varchar", { length: 255, unique: true })
  firebaseUid: string;

  @Column("varchar", { length: 255 })
  email: string;

  @Column("varchar", { length: 255, nullable: true })
  displayName: string | null;

  @Column("varchar", { length: 500, nullable: true })
  photoURL: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToMany(() => Document, (document) => document.user)
  documents: Document[];
}
