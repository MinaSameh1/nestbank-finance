// This is used to have a message for the developer to understand
export const ErrorMessages = {
  NOT_FOUND: 'Resource Not Found',
  NOT_FOUND_ID: (name?: string, id?: unknown) =>
    `${name} Resource ${id} Not Found`,
  ACCOUNT_ALREADY_EXISTS: 'User Already Has An Account!!',
  CANNOT_UPDATE_USER_ID: 'Cannot Change User ID!!',
  USER_DOES_NOT_EXIST: 'User Does Not Exist!',
  FROM_ACCOUNT_DOES_NOT_EXIST: 'From Account Does Not Exist!',
  TO_ACCOUNT_DOES_NOT_EXIST: 'To Account Does Not Exist!',
  AMOUNT_MUST_BE_POSITIVE: 'Amount Must Be Positive!',
  NOT_ENOUGH_MONEY: 'Not Enough Money!',
  TO_ACCOUNT_INACTIVE: 'To Account Inactive! Cannot Transfer Money!',
  ALREADY_REFUNDED: 'Transaction Already Refunded!',
  REFUND_NOT_ALLOWED: 'Refund Not Allowed!',
  ACCOUNT_INACTIVE: 'Account Inactive! Cannot Transfer Money!',
  FROM_ACCOUNT_INACTIVE: 'From Account Inactive! Cannot Transfer Money!',
}

// Used for the developer to check against and show a localized message
export const ErrorCodes = {
  NOT_FOUND: 'NOT_FOUND',
  ACCOUNT_ALREADY_EXISTS: 'ACCOUNT_ALREADY_EXISTS',
  CANNOT_UPDATE_USER_ID: 'CANNOT_CHANGE_USER_ID',
  USER_DOES_NOT_EXIST: 'USER_DOES_NOT_EXIST',
  FROM_ACCOUNT_DOES_NOT_EXIST: 'FROM_ACCOUNT_DOES_NOT_EXIST',
  TO_ACCOUNT_DOES_NOT_EXIST: 'TO_ACCOUNT_DOES_NOT_EXIST',
  AMOUNT_MUST_BE_POSITIVE: 'AMOUNT_MUST_BE_POSITIVE',
  NOT_ENOUGH_MONEY: 'NOT_ENOUGH_MONEY',
  TO_ACCOUNT_INACTIVE: 'TO_ACCOUNT_INACTIVE',
  ALREADY_REFUNDED: 'ALREADY_REFUNDED',
  REFUND_NOT_ALLOWED: 'REFUND_NOT_ALLOWED',
  ACCOUNT_INACTIVE: 'ACCOUNT_INACTIVE',
  FROM_ACCOUNT_INACTIVE: 'FROM_ACCOUNT_INACTIVE',
}

export const SuccessMessages = {
  SUCCESSFULLY_DELETED_ID: (name?: string, id?: unknown) =>
    `${name} Resource ${id} Successfully Deleted`,
  SUCCESSFULLY_UPDATED_ID: (name?: string, id?: unknown) =>
    `${name} Resource ${id} Successfully Updated`,
}
