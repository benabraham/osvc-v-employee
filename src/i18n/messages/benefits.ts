import type { MessageBundle } from '../types'

/** Strings of the "benefits" feature. Keys start with 'benefits.'; every key exists in cs and en. */
export const benefitsMessages: MessageBundle = {
  cs: {
    'benefits.title': 'Dávky',
    'benefits.intro': 'Zaměstnanec je na nemocenské pojištěn automaticky. OSVČ ji má jen při dobrovolném nemocenském pojištění.',
    'benefits.noData': 'Pro tento rok nejsou hodnoty, takže dávky nejde spočítat. Vyber rok s daty, nebo zadej vlastní hodnoty.',

    'benefits.insurance.heading': 'Dobrovolné nemocenské pojištění OSVČ',
    'benefits.insurance.status': 'Ve výpočtu',
    'benefits.insurance.statusOn': 'zapnuto',
    'benefits.insurance.statusOff': 'vypnuto',
    'benefits.insurance.premium': 'Měsíční pojistné',
    'benefits.insurance.base': 'Měsíční vyměřovací základ',
    'benefits.insurance.minimumNote': 'Pojištění je vypnuté. Níže je minimální pojistné, jako kdybys platil(a) minimum.',
    'benefits.insurance.enableLink': 'Zapnout ve výpočtu',
    'benefits.pension.note': 'Důchod OSVČ bývá nižší než důchod zaměstnance. Aplikace důchody nepočítá.',

    'benefits.inputs.heading': 'Vstupy',
    'benefits.inputs.help': 'Předvyplněno z výpočtu. Změny se nikam neukládají.',
    'benefits.inputs.employeeGross': 'Hrubá měsíční mzda zaměstnance',
    'benefits.inputs.employeeGrossHelp': 'Předvyplněno hrubým ekvivalentem z výpočtu.',
    'benefits.inputs.premium': 'Měsíční pojistné OSVČ na nemocenskou',
    'benefits.inputs.premiumHelp': 'Když je pojištění vypnuté, je předvyplněné minimální pojistné roku.',
    'benefits.inputs.sicknessDays': 'Délka nemoci',
    'benefits.inputs.sicknessDaysHelp':
      'Kalendářní dny. Zaměstnavatel platí náhradu mzdy za prvních 14 dní, nemocenská začíná 15. dnem.',
    'benefits.inputs.multipleBirth': 'Dvě nebo více dětí najednou (37 týdnů)',
    'benefits.inputs.multipleBirthHelp':
      'Peněžitá pomoc v mateřství trvá 28 týdnů, po porodu dvou nebo více dětí 37 týdnů (§ 33 zákona 187/2006 Sb.).',
    'benefits.inputs.insuredDays': 'Dny pojištění za posledních 2 roky',
    'benefits.inputs.insuredDaysHelp': 'Mateřská potřebuje {required} dní pojištění v posledních dvou letech (§ 32 odst. 2).',
    'benefits.inputs.osvcDaysLastYear': 'Dny OSVČ nemocenského za poslední rok',
    'benefits.inputs.osvcDaysLastYearHelp': 'Mateřská OSVČ potřebuje {required} dní OSVČ nemocenského v posledním roce (§ 32 odst. 3).',
    'benefits.inputs.osvcMonths': 'Měsíce OSVČ nemocenského před nárokem',
    'benefits.inputs.osvcMonthsHelp': 'OSVČ čeká na nemocenskou a otcovskou 3 měsíce pojištění (§ 24, § 38a odst. 3).',
    'benefits.inputs.fromJob':
      'Navazuji na zaměstnání: OSVČ pojištění začalo do 8 dnů po jeho skončení a v posledních 3 měsících jsem byl(a) v něm pojištěn(a)',

    'benefits.compare.heading': 'Porovnání dávek',
    'benefits.compare.caption': 'Částky za zadanou dobu při stejném měsíčním příjmu.',
    'benefits.compare.column.item': 'Dávka',
    'benefits.compare.column.employee': 'Zaměstnanec',
    'benefits.compare.column.osvc': 'OSVČ',
    'benefits.compare.employerPay': 'Náhrada mzdy od zaměstnavatele (1.–14. den)',
    'benefits.compare.sicknessBenefit': 'Nemocenská od 15. dne',
    'benefits.compare.sicknessTotal': 'Celkem za nemoc',
    'benefits.compare.dailySickness': 'Denní nemocenská (15.–30. den)',
    'benefits.compare.dailyMaternity': 'Denní peněžitá pomoc v mateřství',
    'benefits.compare.maternityTotal': 'Mateřská za {weeks} týdnů',
    'benefits.compare.paternityTotal': 'Otcovská za 14 dní',
    'benefits.compare.osvcNoPay': 'OSVČ za prvních 14 dní nedostává nic.',

    'benefits.assumptions.heading': 'Jak počítáme',
    'benefits.assumptions.compensation':
      'Náhrada mzdy: 60 % průměrného hodinového výdělku za pracovní hodiny prvních 14 dní, počítáme 10 pracovních dnů po 8 hodinách. Hodinový výdělek je hrubá měsíční mzda × 12 ÷ pracovní hodiny roku. Redukční hranice jsou denní hranice × 0,175 (§ 192 odst. 2 zákoníku práce).',
    'benefits.assumptions.sickness':
      'Nemocenská: denní vyměřovací základ se upraví redukčními hranicemi (§ 21 odst. 1 písm. a) zákona 187/2006 Sb.). Činí 60 % do 30. dne, 66 % od 31. do 60. dne a 72 % od 61. dne (§ 29 odst. 1).',
    'benefits.assumptions.osvc':
      'OSVČ: vyměřovací základ se odvodí z pojistného: pojistné × 100 ÷ 2,7 %, zaokrouhleno nahoru. Dávky z něj počítáme stejně jako u zaměstnance.',
    'benefits.assumptions.maternity':
      'Mateřská a otcovská: denní dávka je 70 % denního vyměřovacího základu (§ 37 a § 38c zákona 187/2006 Sb.), který se upraví redukčními hranicemi podle § 21 odst. 1 písm. b). Platí se za každý kalendářní den.',

    'benefits.eligibility.heading': 'Nárok',
    'benefits.eligibility.intro': 'Orientační podle vstupů výše. Nárok posuzuje ČSSZ.',
    'benefits.eligibility.column.benefit': 'Dávka',
    'benefits.eligibility.sickness': 'Nemocenská',
    'benefits.eligibility.maternity': 'Mateřská',
    'benefits.eligibility.paternity': 'Otcovská',
    'benefits.eligibility.yes': 'Ano',
    'benefits.eligibility.no': 'Ne',
    'benefits.eligibility.noWaitingPeriod': 'Bez čekací doby.',
    'benefits.eligibility.reason.insuredDays': 'Chybí dny pojištění: potřeba {required} za posledních 2 roky.',
    'benefits.eligibility.reason.osvcDays': 'Chybí dny OSVČ nemocenského: potřeba {required} za poslední rok.',
    'benefits.eligibility.reason.waitingPeriod':
      'Chybí čekací doba: 3 měsíce OSVČ nemocenského těsně před nárokem, nebo navázání na zaměstnání.',
    'benefits.eligibility.osvcNote': 'Bez dobrovolného nemocenského pojištění OSVČ nemá nárok na tyto dávky.',
  },
  en: {
    'benefits.title': 'Benefits',
    'benefits.intro': 'An employee is covered by sickness insurance automatically. A freelancer is covered only with voluntary sickness insurance.',
    'benefits.noData': 'There are no values for this year, so benefits cannot be calculated. Choose a year with data, or enter your own values.',

    'benefits.insurance.heading': 'Voluntary freelancer sickness insurance',
    'benefits.insurance.status': 'In the calculation',
    'benefits.insurance.statusOn': 'on',
    'benefits.insurance.statusOff': 'off',
    'benefits.insurance.premium': 'Monthly premium',
    'benefits.insurance.base': 'Monthly assessment base',
    'benefits.insurance.minimumNote': 'The insurance is off. Below we use the minimum premium, as if you paid the minimum.',
    'benefits.insurance.enableLink': 'Turn on in the calculation',
    'benefits.pension.note': 'A freelancer’s pension is usually lower than an employee’s. The app does not calculate pensions.',

    'benefits.inputs.heading': 'Inputs',
    'benefits.inputs.help': 'Prefilled from the calculation. Changes are not saved anywhere.',
    'benefits.inputs.employeeGross': 'Employee gross monthly wage',
    'benefits.inputs.employeeGrossHelp': 'Prefilled with the gross equivalent from the calculation.',
    'benefits.inputs.premium': 'Freelancer monthly sickness premium',
    'benefits.inputs.premiumHelp': 'When the insurance is off, the minimum premium of the year is prefilled.',
    'benefits.inputs.sicknessDays': 'Length of sickness',
    'benefits.inputs.sicknessDaysHelp':
      'Calendar days. The employer pays salary compensation for the first 14 days; sickness benefit starts on day 15.',
    'benefits.inputs.multipleBirth': 'Two or more children at once (37 weeks)',
    'benefits.inputs.multipleBirthHelp':
      'Maternity benefit lasts 28 weeks, or 37 weeks after a birth of two or more children (§ 33 of Act 187/2006 Coll.).',
    'benefits.inputs.insuredDays': 'Insured days in the last 2 years',
    'benefits.inputs.insuredDaysHelp': 'Maternity benefit needs {required} insured days in the last two years (§ 32(2)).',
    'benefits.inputs.osvcDaysLastYear': 'Freelancer sickness insurance days in the last year',
    'benefits.inputs.osvcDaysLastYearHelp': 'A freelancer needs {required} days of sickness insurance in the last year for maternity benefit (§ 32(3)).',
    'benefits.inputs.osvcMonths': 'Months of freelancer sickness insurance before the claim',
    'benefits.inputs.osvcMonthsHelp': 'A freelancer waits 3 months of insurance for sickness and paternity benefit (§ 24, § 38a(3)).',
    'benefits.inputs.fromJob':
      'I continue from a job: freelancer insurance started within 8 days after it ended, and I was insured in that job for its last 3 months',

    'benefits.compare.heading': 'Benefit comparison',
    'benefits.compare.caption': 'Amounts for the period entered, with the same monthly income.',
    'benefits.compare.column.item': 'Benefit',
    'benefits.compare.column.employee': 'Employee',
    'benefits.compare.column.osvc': 'Freelancer',
    'benefits.compare.employerPay': 'Salary compensation from the employer (days 1–14)',
    'benefits.compare.sicknessBenefit': 'Sickness benefit from day 15',
    'benefits.compare.sicknessTotal': 'Total for sickness',
    'benefits.compare.dailySickness': 'Daily sickness benefit (days 15–30)',
    'benefits.compare.dailyMaternity': 'Daily maternity benefit',
    'benefits.compare.maternityTotal': 'Maternity benefit for {weeks} weeks',
    'benefits.compare.paternityTotal': 'Paternity benefit for 14 days',
    'benefits.compare.osvcNoPay': 'A freelancer gets nothing for the first 14 days.',

    'benefits.assumptions.heading': 'How we calculate',
    'benefits.assumptions.compensation':
      'Salary compensation: 60 % of the average hourly earnings for the working hours of the first 14 days, counted as 10 working days of 8 hours. Hourly earnings are the gross monthly wage × 12 ÷ working hours of the year. The reduction thresholds are the daily thresholds × 0.175 (§ 192(2) of the Labour Code).',
    'benefits.assumptions.sickness':
      'Sickness benefit: the daily assessment base is reduced by the thresholds (§ 21(1)(a) of Act 187/2006 Coll.). It is 60 % up to day 30, 66 % from day 31 to day 60, and 72 % from day 61 (§ 29(1)).',
    'benefits.assumptions.osvc':
      'Freelancer: the assessment base is derived from the premium: premium × 100 ÷ 2.7 %, rounded up. Benefits are calculated from it as for an employee.',
    'benefits.assumptions.maternity':
      'Maternity and paternity: the daily amount is 70 % of the daily assessment base (§ 37 and § 38c of Act 187/2006 Coll.), reduced by the thresholds of § 21(1)(b), paid for every calendar day.',

    'benefits.eligibility.heading': 'Eligibility',
    'benefits.eligibility.intro': 'Indicative, based on the answers above. The Czech Social Security Administration (ČSSZ) decides.',
    'benefits.eligibility.column.benefit': 'Benefit',
    'benefits.eligibility.sickness': 'Sickness',
    'benefits.eligibility.maternity': 'Maternity',
    'benefits.eligibility.paternity': 'Paternity',
    'benefits.eligibility.yes': 'Yes',
    'benefits.eligibility.no': 'No',
    'benefits.eligibility.noWaitingPeriod': 'No waiting period.',
    'benefits.eligibility.reason.insuredDays': 'Missing insured days: {required} needed in the last 2 years.',
    'benefits.eligibility.reason.osvcDays': 'Missing freelancer sickness insurance days: {required} needed in the last year.',
    'benefits.eligibility.reason.waitingPeriod':
      'Missing waiting period: 3 months of freelancer sickness insurance right before the claim, or a continuation from a job.',
    'benefits.eligibility.osvcNote': 'Without voluntary freelancer sickness insurance, a freelancer is not entitled to these benefits.',
  },
}
