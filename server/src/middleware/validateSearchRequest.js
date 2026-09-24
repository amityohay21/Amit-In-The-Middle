import { AppError } from "./errorHandler.js";

const ALLOWED_MODES = new Set(["minimax", "sum"]);

export function validateSearchRequest(req, _res, next) {
  const { addresses, optimizationMode } = req.body ?? {};

  if (!Array.isArray(addresses)) {
    return next(new AppError("addresses must be an array of strings", 400));
  }

  if (addresses.length < 2 || addresses.length > 4) {
    return next(
      new AppError("Provide between 2 and 4 addresses", 400, {
        received: addresses.length,
      })
    );
  }

  const trimmed = [];
  for (let index = 0; index < addresses.length; index += 1) {
    const address = addresses[index];
    if (typeof address !== "string" || !address.trim()) {
      return next(
        new AppError(`Address at index ${index} is empty or invalid`, 400, {
          participantIndex: index,
        })
      );
    }
    trimmed.push(address.trim());
  }

  if (!optimizationMode || !ALLOWED_MODES.has(optimizationMode)) {
    return next(
      new AppError('optimizationMode must be "minimax" or "sum"', 400)
    );
  }

  req.validatedSearch = {
    addresses: trimmed,
    optimizationMode,
  };
  next();
}
