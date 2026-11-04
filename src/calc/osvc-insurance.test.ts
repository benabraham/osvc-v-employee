import { describeFixtures } from './fixtures/run-fixtures'
import healthRows from './fixtures/osvc-health-insurance.json'
import socialRows from './fixtures/osvc-social-insurance.json'
import { calculateOsvcHealthInsurance, calculateOsvcSocialInsurance } from './osvc-insurance'

describeFixtures({ name: 'OSVČ health insurance (ZP)', rows: healthRows, calculate: calculateOsvcHealthInsurance })
describeFixtures({ name: 'OSVČ social insurance (SP)', rows: socialRows, calculate: calculateOsvcSocialInsurance })
