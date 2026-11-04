import { formatMoney, formatNumber, formatPercent } from '../../i18n'
import { currentLocale } from '../../ui'

/**
 * An amount in Kč as text for the current language ("39 700 Kč"), for messages with placeholders.
 *
 * @param {number} value
 * @returns {string}
 */
export const moneyText = (value: number): string => formatMoney(value, currentLocale.value)

/**
 * A share as text for the current language ("15,9 %"), for messages with placeholders.
 *
 * @param {number} share fraction, 0.159 for 15.9 %
 * @returns {string}
 */
export const percentText = (share: number): string => formatPercent(share, currentLocale.value)

/**
 * A plain count or quantity as text for the current language ("1,5", "250").
 *
 * @param {number} value
 * @param {number} [maximumFractionDigits=0]
 * @returns {string}
 */
export const numberText = (value: number, maximumFractionDigits = 0): string =>
  formatNumber(value, { locale: currentLocale.value, maximumFractionDigits })

/**
 * The share of the invoiced amount, or 0 when nothing is invoiced (avoids dividing by zero).
 *
 * @param {object} params
 * @param {number} params.amount
 * @param {number} params.invoiced
 * @returns {number}
 */
export const shareOfInvoiced = ({ amount, invoiced }: { amount: number; invoiced: number }): number =>
  invoiced === 0 ? 0 : amount / invoiced
