import "reflect-metadata";
import { container } from "@/config/container";

/**
 * Reuse production container
 * DB is already overridden by mongodb-memory-server
 */
export const testContainer = container;
