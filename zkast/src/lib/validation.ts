/**
 * Input validation module for the ZK Privacy Prediction Market.
 * Ensures data integrity before processing.
 * 
 * Future: These validations will also run on-chain via smart contract require() statements.
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateQuestion(question: string): ValidationResult {
  const trimmed = question.trim();
  if (!trimmed) {
    return { valid: false, error: "Question cannot be empty" };
  }
  if (trimmed.length < 10) {
    return { valid: false, error: "Question must be at least 10 characters" };
  }
  if (trimmed.length > 200) {
    return { valid: false, error: "Question must be 200 characters or less" };
  }
  return { valid: true };
}

export function validateVoteAmount(amount: unknown): ValidationResult {
  const num = Number(amount);
  if (isNaN(num) || !isFinite(num)) {
    return { valid: false, error: "Amount must be a valid number" };
  }
  if (!Number.isInteger(num)) {
    return { valid: false, error: "Amount must be a whole number" };
  }
  if (num <= 0) {
    return { valid: false, error: "Amount must be greater than zero" };
  }
  if (num > 100_000) {
    return { valid: false, error: "Maximum 100,000 tokens per vote" };
  }
  return { valid: true };
}

export function validateMarketId(id: unknown): ValidationResult {
  if (typeof id !== "string" || !id.trim()) {
    return { valid: false, error: "Invalid market ID" };
  }
  return { valid: true };
}
