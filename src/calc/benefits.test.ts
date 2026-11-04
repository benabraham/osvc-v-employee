import {
  calculateCarersAllowance,
  calculateMaternityBenefit,
  calculateOsvcMaternityBenefit,
  calculateOsvcSicknessBenefit,
  calculateSalaryCompensation,
  calculateSicknessBenefit,
} from './benefits'
import carersRows from './fixtures/carers-allowance.json'
import maternityRows from './fixtures/maternity-benefit.json'
import osvcSicknessRows from './fixtures/osvc-sickness-benefit.json'
import { describeFixtures } from './fixtures/run-fixtures'
import salaryCompensationRows from './fixtures/salary-compensation.json'
import sicknessRows from './fixtures/sickness-benefit.json'

describeFixtures({ name: 'Employee sickness benefit', rows: sicknessRows, calculate: calculateSicknessBenefit })
describeFixtures({ name: 'OSVČ sickness benefit', rows: osvcSicknessRows, calculate: calculateOsvcSicknessBenefit })
describeFixtures({ name: "Carer's allowance (ošetřovné)", rows: carersRows, calculate: calculateCarersAllowance })
describeFixtures({
  name: 'Salary compensation (first 14 days)',
  rows: salaryCompensationRows,
  calculate: calculateSalaryCompensation,
})
describeFixtures({
  name: 'Maternity and paternity benefit',
  rows: maternityRows,
  calculate: (input) =>
    'monthlySicknessPremium' in input ? calculateOsvcMaternityBenefit(input) : calculateMaternityBenefit(input),
})
