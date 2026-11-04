import { calculateEmployeeNetWage } from './employee-net-wage'
import netWageRows from './fixtures/employee-net-wage.json'
import { describeFixtures } from './fixtures/run-fixtures'

describeFixtures({ name: 'Employee net wage', rows: netWageRows, calculate: calculateEmployeeNetWage })
