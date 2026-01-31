import mongoose from "mongoose";

/**
 * Validates if a string is a valid MongoDB ObjectId
 * @param id - The string to validate
 * @returns true if valid ObjectId, false otherwise
 */
export function isValidObjectId(id: string): boolean {
  if (!id || typeof id !== "string") {
    return false;
  }

  // Check if it's a valid ObjectId and matches the string representation
  // This prevents injection attacks with objects like {$gt: ""}
  return (
    mongoose.Types.ObjectId.isValid(id) &&
    new mongoose.Types.ObjectId(id).toString() === id
  );
}

/**
 * Validates and throws an error if the ID is not a valid ObjectId
 * Use this in API routes to prevent NoSQL injection
 * @param id - The ID to validate
 * @returns The validated ID string
 * @throws Error if ID is invalid
 */
export function validateObjectId(id: string): string {
  if (!isValidObjectId(id)) {
    throw new Error("Invalid ID format");
  }
  return id;
}

/**
 * Validates multiple ObjectIds at once
 * @param ids - Array of IDs to validate
 * @returns true if all are valid, false otherwise
 */
export function areValidObjectIds(ids: string[]): boolean {
  if (!Array.isArray(ids) || ids.length === 0) {
    return false;
  }
  return ids.every((id) => isValidObjectId(id));
}
