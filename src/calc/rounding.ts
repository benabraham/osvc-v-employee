/**
 * Rounding that matches the reference Python library (written for Python 2) and Google Sheets ROUND:
 * the float's exact decimal value is rounded, and exact ties go away from zero.
 * `2.675` is stored as 2.67499…, so it rounds down to 2.67, like Python and Sheets do.
 *
 * @param {number} value
 * @param {number} [digits=0] decimal places to keep
 * @returns {number}
 */
export const roundHalfAwayFromZero = (value: number, digits = 0): number => {
  if (!Number.isFinite(value) || value === 0) return value
  const sign = value < 0 ? -1 : 1
  // toFixed(100) prints the exact binary value for the magnitudes used in tax maths
  const [whole = '0', fraction = ''] = Math.abs(value).toFixed(100).split('.')
  const kept = BigInt(whole + fraction.slice(0, digits))
  const isHalfOrMore = (fraction[digits] ?? '0') >= '5'
  const rounded = isHalfOrMore ? kept + 1n : kept
  return (sign * Number(rounded)) / 10 ** digits
}

/**
 * Python's float floor division `a // b`: exact floor of the true quotient,
 * which `Math.floor(a / b)` misses when the division itself rounds up to an integer.
 *
 * @param {number} dividend
 * @param {number} divisor
 * @returns {number}
 */
export const floorDivide = (dividend: number, divisor: number): number => {
  const remainder = dividend % divisor
  const adjusted = remainder !== 0 && (divisor < 0) !== (remainder < 0) ? remainder + divisor : remainder
  return Math.round((dividend - adjusted) / divisor)
}

/**
 * Python's modulo: the result takes the divisor's sign (`-150 % 100 === 50`).
 *
 * @param {number} dividend
 * @param {number} divisor
 * @returns {number}
 */
export const modulo = (dividend: number, divisor: number): number => ((dividend % divisor) + divisor) % divisor
