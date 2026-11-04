import { useT } from '../../app/context'
import { Money } from '../../ui'
import type { compareBenefits } from './compare-benefits'

type Comparison = ReturnType<typeof compareBenefits>

/**
 * The side-by-side amounts: employee against OSVČ, for the sickness, maternity and paternity benefit.
 *
 * @param {object} props
 * @param {Comparison} props.comparison the result of compareBenefits
 * @param {number} props.maternityWeeks the weeks in the maternity row label
 */
export const BenefitComparisonTable = ({ comparison, maternityWeeks }: { comparison: Comparison; maternityWeeks: number }) => {
  const t = useT()
  const { employee, osvc } = comparison
  const rows = [
    {
      key: 'employerPay',
      label: t('benefits.compare.employerPay'),
      employee: employee.salaryCompensation.totalCompensation,
      osvc: 0,
      isTotal: false,
    },
    {
      key: 'sicknessBenefit',
      label: t('benefits.compare.sicknessBenefit'),
      employee: employee.sicknessBenefit.totalBenefit,
      osvc: osvc.sicknessBenefit.totalBenefit,
      isTotal: false,
    },
    {
      key: 'sicknessTotal',
      label: t('benefits.compare.sicknessTotal'),
      employee: employee.sicknessTotal,
      osvc: osvc.sicknessTotal,
      isTotal: true,
    },
    {
      key: 'dailySickness',
      label: t('benefits.compare.dailySickness'),
      employee: employee.sicknessBenefit.dailyBenefitDays15To30,
      osvc: osvc.sicknessBenefit.dailyBenefitDays15To30,
      isTotal: false,
    },
    {
      key: 'dailyMaternity',
      label: t('benefits.compare.dailyMaternity'),
      employee: employee.maternity.dailyBenefit,
      osvc: osvc.maternity.dailyBenefit,
      isTotal: false,
    },
    {
      key: 'maternityTotal',
      label: t('benefits.compare.maternityTotal', { weeks: maternityWeeks }),
      employee: employee.maternityTotal,
      osvc: osvc.maternityTotal,
      isTotal: true,
    },
    {
      key: 'paternityTotal',
      label: t('benefits.compare.paternityTotal'),
      employee: employee.paternityTotal,
      osvc: osvc.paternityTotal,
      isTotal: true,
    },
  ]

  return (
    <div class="table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th scope="col">{t('benefits.compare.column.item')}</th>
            <th scope="col">{t('benefits.compare.column.employee')}</th>
            <th scope="col">{t('benefits.compare.column.osvc')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <th scope="row">{row.isTotal ? <strong>{row.label}</strong> : row.label}</th>
              <td>
                <Money value={row.employee} />
              </td>
              <td>
                <Money value={row.osvc} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
