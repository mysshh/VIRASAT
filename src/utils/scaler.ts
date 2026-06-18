/**
 * Scaler and unit converter utility for botanical ingredients.
 * Comfortably parses ranges, fractions, integers, and floats, multiplies them
 * by a portion multiplier, and optionally maps units to their metric equivalents.
 */

// Common fraction map
const FRACTIONS: Record<string, number> = {
  "1/2": 0.5,
  "1/4": 0.25,
  "1/3": 0.333,
  "2/3": 0.666,
  "3/4": 0.75,
  "1/8": 0.125,
};

// Decimal to beautiful fractional string for aesthetic matching
function decimalToFraction(val: number): string {
  const tolerance = 0.05;
  const whole = Math.floor(val);
  const remainder = val - whole;

  if (remainder < tolerance) return whole > 0 ? `${whole}` : "0";
  
  for (const [fracStr, fracVal] of Object.entries(FRACTIONS)) {
    if (Math.abs(remainder - fracVal) < tolerance) {
      return whole > 0 ? `${whole} ${fracStr}` : fracStr;
    }
  }

  // Fallback to 1 decimal place if it doesn't match clean culinary fractions
  return val.toFixed(1).replace(/\.0$/, "");
}

/**
 * Scales quantities inside a natural ingredient description string,
 * and converts them to metric units (e.g. cups -> ml, inches -> cm) if requested.
 */
export function scaleAndConvertIngredient(
  ingredient: string,
  multiplier: number,
  useMetric: boolean
): string {
  if (multiplier === 1 && !useMetric) return ingredient;

  // Let's inspect the string for numbers, ranges, and fractions
  // 1. Match Ranges: e.g., "10-12 fresh Tulsi", "2-3 cloves"
  const rangeRegex = /(\d+)\s*-\s*(\d+)/g;
  let processed = ingredient.replace(rangeRegex, (_, p1, p2) => {
    const min = parseFloat(p1) * multiplier;
    const max = parseFloat(p2) * multiplier;
    return `${Math.round(min)}-${Math.round(max)}`;
  });

  // 2. Match mixed-number fractions: e.g., "1 1/2", "2 3/4"
  const mixedFractionRegex = /(\d+)\s+([1-3]\/[2-4])/g;
  processed = processed.replace(mixedFractionRegex, (_, whole, frac) => {
    const fractionalValue = FRACTIONS[frac] || 0;
    const total = (parseFloat(whole) + fractionalValue) * multiplier;
    return decimalToFraction(total);
  });

  // 3. Match pure standalone fractions: e.g., "1/2 tsp", "1/4 tsp"
  const pureFractionRegex = /\b([1-3]\/[2-8])\b/g;
  processed = processed.replace(pureFractionRegex, (_, frac) => {
    const fractionalValue = FRACTIONS[frac] || 0.5;
    const total = fractionalValue * multiplier;
    return decimalToFraction(total);
  });

  // 4. Match integer/decimal numbers followed by units: e.g., "2 cups", "1.5 kg", "1 inch"
  // Avoiding replacing years or numbers deep inside brackets
  const numberUnitRegex = /\b(\d+(\.\d+)?)\s*(cups?|inch(es)?|tbsp|teaspoons?|tsps?|tablespoons?|gols?|ml|grams?|pcs?|pieces?)\b/gi;
  processed = processed.replace(numberUnitRegex, (_, num, __, unit) => {
    const origValue = parseFloat(num);
    let scaledValue = origValue * multiplier;
    let targetUnit = unit;

    // Metric conversions
    if (useMetric) {
      const lowerUnit = unit.toLowerCase();
      if (lowerUnit.startsWith("cup")) {
        scaledValue = Math.round(scaledValue * 240);
        targetUnit = "ml";
      } else if (lowerUnit.startsWith("inch")) {
        scaledValue = parseFloat((scaledValue * 2.54).toFixed(1));
        targetUnit = "cm";
      } else if (lowerUnit === "tsp" || lowerUnit.startsWith("teaspoon")) {
        scaledValue = Math.round(scaledValue * 5);
        targetUnit = "ml";
      } else if (lowerUnit === "tbsp" || lowerUnit.startsWith("tablespoon")) {
        scaledValue = Math.round(scaledValue * 15);
        targetUnit = "ml";
      }
    }

    // Format final number
    const formattedNum = scaledValue % 1 === 0 ? `${scaledValue}` : scaledValue.toFixed(1).replace(/\.0$/, "");
    return `${formattedNum} ${targetUnit}`;
  });

  // 5. Standalone numbers at the beginning of the ingredient: e.g., "2 lemons"
  // Match only at start, or preceded by start + optional spaces
  const startNumberRegex = /^(\d+(\.\d+)?)\s+([a-zA-Z])/;
  processed = processed.replace(startNumberRegex, (_, num, __, nextChar) => {
    const origValue = parseFloat(num);
    const scaledValue = origValue * multiplier;
    const formattedNum = scaledValue % 1 === 0 ? `${scaledValue}` : decimalToFraction(scaledValue);
    return `${formattedNum} ${nextChar}`;
  });

  return processed;
}
