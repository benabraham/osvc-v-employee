import type { ChildInput, Inputs } from '../../model'

/** A change of one year's inputs, for `store.updateInputs`. */
export type InputsUpdate = (inputs: Inputs) => Inputs

/** A child added at the end of the list: 12 months, no ZTP/P card, no preschool fees. */
const NEW_CHILD: ChildInput = { months: 12, hasZtpP: false, preschoolFees: 0 }

/**
 * Merges a patch into the credits (spouse, disability, ZTP/P, student months, sales registration).
 *
 * @param {Partial<Inputs['credits']>} patch
 * @returns {InputsUpdate}
 */
export const withCredits = (patch: Partial<Inputs['credits']>): InputsUpdate => (inputs) => ({
  ...inputs,
  credits: { ...inputs.credits, ...patch },
})

/**
 * Merges a patch into the deductions (donations, mortgage interest, retirement products).
 *
 * @param {Partial<Inputs['deductions']>} patch
 * @returns {InputsUpdate}
 */
export const withDeductions = (patch: Partial<Inputs['deductions']>): InputsUpdate => (inputs) => ({
  ...inputs,
  deductions: { ...inputs.deductions, ...patch },
})

/**
 * Merges a patch into the voluntary sickness insurance (switch and monthly assessment base).
 *
 * @param {Partial<Inputs['sicknessInsurance']>} patch
 * @returns {InputsUpdate}
 */
export const withSicknessInsurance = (patch: Partial<Inputs['sicknessInsurance']>): InputsUpdate => (inputs) => ({
  ...inputs,
  sicknessInsurance: { ...inputs.sicknessInsurance, ...patch },
})

/**
 * Merges a patch into the overrides of the sheet's blue values; null clears one of them.
 *
 * @param {Partial<Inputs['overrides']>} patch
 * @returns {InputsUpdate}
 */
export const withOverrides = (patch: Partial<Inputs['overrides']>): InputsUpdate => (inputs) => ({
  ...inputs,
  overrides: { ...inputs.overrides, ...patch },
})

/**
 * Appends a child with the default values.
 *
 * @returns {Inputs} the updated inputs
 */
export const withChildAdded: InputsUpdate = (inputs) => ({ ...inputs, children: [...inputs.children, { ...NEW_CHILD }] })

/**
 * Changes some fields of the child at one position.
 *
 * @param {object} params
 * @param {number} params.index position in the children list
 * @param {Partial<ChildInput>} params.patch
 * @returns {InputsUpdate}
 */
export const withChildUpdated =
  ({ index, patch }: { index: number; patch: Partial<ChildInput> }): InputsUpdate =>
  (inputs) => ({
    ...inputs,
    children: inputs.children.map((child, position) => (position === index ? { ...child, ...patch } : child)),
  })

/**
 * Removes the child at one position.
 *
 * @param {number} index position in the children list
 * @returns {InputsUpdate}
 */
export const withChildRemoved =
  (index: number): InputsUpdate =>
  (inputs) => ({
    ...inputs,
    children: inputs.children.filter((_child, position) => position !== index),
  })
