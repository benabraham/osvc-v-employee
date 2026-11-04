import { describeFixtures } from './fixtures/run-fixtures'
import incomeTaxRows from './fixtures/osvc-income-tax.json'
import retirementRows from './fixtures/retirement-products-deduction.json'
import { calculateOsvcIncomeTax, calculateRetirementProductsDeduction } from './osvc-income-tax'

describeFixtures({ name: 'OSVČ income tax', rows: incomeTaxRows, calculate: calculateOsvcIncomeTax })
describeFixtures({
  name: 'Retirement products deduction',
  rows: retirementRows,
  calculate: calculateRetirementProductsDeduction,
})
