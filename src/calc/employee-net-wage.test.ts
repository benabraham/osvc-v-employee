import { calculateEmployeeNetWage } from './employee-net-wage'
import netWageRows from './fixtures/employee-net-wage.json'
import { describeFixtures } from './fixtures/run-fixtures'

describeFixtures({
  name: 'Employee net wage',
  rows: netWageRows,
  calculate: calculateEmployeeNetWage,
  lawDifferences: Object.fromEntries(
    [38, 39, 40, 48, 49].map((index) => [`2024 NetWage2024 generated #${index}`, '2024 employee contribution is one 7.1 % rounded up once (zákon 589/1992 Sb. § 7 odst. 3); the library rounds 6.5 % and 0.6 % separately']),
  ),
})
