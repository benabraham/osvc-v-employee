import { describe, expect, it } from 'vitest'
import { yearNoticeFor } from './year-notice'

const base = { hasOfficialData: true, hasCustomData: false, isUsingCustomData: false, isOfficialPromptAnswered: false }

describe('yearNoticeFor', () => {
  it('shows nothing for a year with official data and no custom numbers', () => {
    expect(yearNoticeFor(base)).toBe('none')
  })

  it('says the values are coming when a year has neither official nor custom data in use', () => {
    expect(yearNoticeFor({ ...base, hasOfficialData: false })).toBe('missing')
    expect(yearNoticeFor({ ...base, hasOfficialData: false, hasCustomData: true })).toBe('missing')
  })

  it('says custom values are in use for a year without official data', () => {
    expect(yearNoticeFor({ ...base, hasOfficialData: false, hasCustomData: true, isUsingCustomData: true })).toBe('customInUse')
  })

  it('asks once whether to switch when official data arrives for a year with custom numbers', () => {
    expect(yearNoticeFor({ ...base, hasCustomData: true, isUsingCustomData: true })).toBe('officialAvailable')
    expect(yearNoticeFor({ ...base, hasCustomData: true, isOfficialPromptAnswered: true })).toBe('none')
  })
})
