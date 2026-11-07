export const PASSWORD = process.env.SAUCE_PASSWORD ?? 'secret_sauce';

/**
 * saucedemo ships several accounts that behave differently on purpose. Treating
 * them as test data rather than as separate specs keeps the account-specific
 * behaviour in one place.
 */
export const USERS = {
  standard: 'standard_user',
  lockedOut: 'locked_out_user',
  problem: 'problem_user',
  performanceGlitch: 'performance_glitch_user',
  error: 'error_user',
  visual: 'visual_user',
} as const;

export const LOGIN_ERRORS = {
  lockedOut: 'Epic sadface: Sorry, this user has been locked out.',
  badCredentials: 'Epic sadface: Username and password do not match any user in this service',
  usernameRequired: 'Epic sadface: Username is required',
  passwordRequired: 'Epic sadface: Password is required',
} as const;

export const CHECKOUT_ERRORS = {
  firstName: 'Error: First Name is required',
  lastName: 'Error: Last Name is required',
  postalCode: 'Error: Postal Code is required',
} as const;

export const EXPECTED_ITEM_COUNT = 6;

export const SORT = {
  nameAsc: 'az',
  nameDesc: 'za',
  priceAsc: 'lohi',
  priceDesc: 'hilo',
} as const;
