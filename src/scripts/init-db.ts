#!/usr/bin/env tsx

import "reflect-metadata";
import { initializeDatabase } from "../lib/database";

async function initDB() {
  try {
    console.log("Initializing database connection...");

    const dataSource = await initializeDatabase();

    console.log("✅ Database connection established successfully");
    console.log("Database info:");
    console.log(`- Type: ${dataSource.options.type}`);
    console.log(`- Database: ${dataSource.options.database}`);

    console.log("\nRunning basic health check...");

    // Test basic query
    const result = await dataSource.query("SELECT NOW() as current_time");
    console.log(
      `✅ Database query successful - Current time: ${result[0].current_time}`
    );

    // List entities
    console.log("\nRegistered entities:");
    dataSource.entityMetadatas.forEach((metadata) => {
      console.log(`- ${metadata.name} -> ${metadata.tableName}`);
    });

    console.log("\n🎉 Database initialization completed successfully!");

    await dataSource.destroy();
    console.log("Database connection closed.");
  } catch (error) {
    console.error("❌ Database initialization failed:");
    console.error(error);
    process.exit(1);
  }
}

if (require.main === module) {
  initDB();
}
