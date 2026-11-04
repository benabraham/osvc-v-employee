import { formatMoney } from '../i18n/format'
import { currentLocale } from './locale'

/**
 * An amount in Kč, formatted for the current locale ("39 700 Kč").
 *
 * @param {object} props
 * @param {number} props.value
 * @param {boolean} [props.isApproximate] prefix "≈"
 * @param {boolean} [props.showSign] prefix "+" for positive values (year-on-year changes)
 */
export const Money = ({ value, isApproximate = false, showSign = false }: { value: number; isApproximate?: boolean; showSign?: boolean }) => (
  <span class="money">
    {isApproximate ? '≈ ' : ''}
    {showSign && value > 0 ? '+' : ''}
    {formatMoney(value, currentLocale.value)}
  </span>
)
