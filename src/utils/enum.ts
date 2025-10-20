// File: ControllerEnums.ts
export namespace USER_CONTROLLER {
  export enum SUCCESS {
    LOGIN_SUCCESSFUL = 'Login successful',
    USER_REGISTERED = 'User registered successfully',
    USER_FETCHED = 'User fetched successfully',
    PASSWORD_UPDATED = 'Password updated successfully',
    VALID_TOKEN = 'Validated token successfully',
    PROFILE_UPDATED = 'Profile update successful',
    QUERY_ADDED = 'Added query successful',
    USER_DELETED = 'User account deleted successfully',
    OTP_SENT = 'OTP sent successfully',
    PURCHASE_HISTORY_FETCHED= 'Purchase history fetched successfully'
  }

  export enum VALIDATION {
    ERROR = 'Validation Error',
    RECIEPT_NOT_FOUND = 'Receipt is required'
  }

  export enum AUTH {
    EMAIL_ALREADY_EXISTS = 'Email Id already exist',
    EMAIL_NOT_FOUND = 'The email does not exist',
    SAME_AS_OLD_PASSWORD = 'Password is the same as old one',
    WRONG_PASSWORD = 'Wrong password submitted',
    INVALID_OTP = 'Invalid OTP',
    OTP_EXPIRED = 'OTP has expired',
    PASSWORD_NOT_FOUND = 'Password not found',
    USER_NOT_FOUND = 'User does not exist',
    INCORRECT_PARAMETERS = 'Incorrect parameters passed',
    OTP_VERIFIED_SUCCESSFULLY = 'OTP verified successfully',
  }
}

export namespace PATH_CONTROLLER {
  export enum SUCCESS {
    FILE_CREATED = 'File created successfully',
    FOLDER_CREATED = 'Folder created successfully',
    FILE_UPDATED = 'File updated successfully',
    FOLDER_UPDATED = 'Folder updated successfully',
    FILE_DELETED = 'File deleted successfully',
    FOLDER_DELETED = 'Folder deleted successfully',
    FILE_FETCHED = 'File fetched successfully',
    FOLDERS_AND_FILES_FETCHED = 'All files and folders fetched',
    FOLDER_RESTORED = 'Folder restored successfully',
    FILE_RESTORED = 'File restored successfully',
    FILES_AND_FOLDERS_RESTORED = 'Files and folders restored successfully',
    FILE_MOVED_TO_RECYCLE = 'File moved to recycle successfully',
    FOLDER_MOVED_TO_RECYCLE = 'Folder moved to recycle successfully',
    BIN_EMPTIED = 'Bin cleaned successfully',
  }

  export enum VALIDATION {
    NO_FILE_FOUND = 'File does not exist',
    NO_ACCESS_FILE = 'Trying to access the wrong file',
    NO_ACCESS_FOLDER = 'Trying to access the wrong folder',
    FILES_AND_FOLDERS_NOT_FOUND = 'No files and folders found',
    INCORRECT_PARAMETERS = 'Incorrect parameters passed',
  }
}

export namespace CANVAS_CONTROLLER {
  export enum SUCCESS {
    CANVAS_CREATED = 'Canvas created successfully',
    CANVAS_UPDATED = 'Canvas updated successfully',
    CANVAS_DELETED = 'Canvas deleted successfully',
  }

  export enum VALIDATION {
    NO_ACCESS = 'Trying to access the wrong canvas',
  }
}

export namespace MARKETPLACE_CONTROLLER {
  export enum SUCCESS {
    FILE_UPLOADED= "File successfully uploaded to marketplace",
    ADDED_TO_CART= 'Item added to cart successfully.',
    CART_FETCHED= 'Cart items fetched successfully.',
    UPLOADS_FETCHED= 'User uploads fetched successfully',
    FILE_DETAILS_FETCHED= 'File details fetched successfully',
    FILE_UPDATED= 'File updated successfully',
    DRAFT_FETCHED= 'Draft files fetched successfully',
    REMOVED_FROM_CART= 'File removed from cart successfully.',
  }

  export enum VALIDATION {
    NO_FILE_ID= 'File ID must be provided',
    UPLOAD_FAILED= 'Failed to upload file to marketplace',
    ALREADY_IN_CART= 'This item is already in your cart.',
    NO_LISTING_ID= 'Listing ID must be provided',
    NO_FILE_FOUND= 'File not found',
    EDIT_UNAUTHORIZED= 'Unauthorized to edit this file',
    REMOVE_FROM_CART_FAILED= 'Failed to remove file from cart.',
    ADD_PURCHASE_HISTORY_FAILED= 'Failed to add purchase history.',
    FETCH_PURCHASE_HISTORY_FAILED= 'Failed to fetch purchase history.',
    FETCH_SALES_REPORT_FAILED= 'Failed to fetch sales report'
  }

  export enum STATUS {
    APPROVED = 'APPROVED',
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    REJECTED = 'REJECTED'
  }
}

export namespace WALLET_CONTROLLER {
  export enum SUCCESS {
    BALANCE_RETRIEVED= 'Wallet balance retrieved successfully',
    PAYMENT_METHOD_ADDED= 'Payment method added to account',
    WITHDRAW_BALANCE_REQUESTED= 'Balance withdraw request has been submitted.'
  }

  export enum VALIDATION {
    RETRIEVE_BALANCE_FAILED = 'Unable to retrieve user balance',
    STRIPE_ID_REQUIRED= 'Stripe customer ID is required',
    STRIPE_CREATION_FAILED= 'Failed to create stripe account',
    PAYMENT_METHOD_CREATION_FAILED= 'Failed to add payment method',
    PAYMENT_METHOD_NOT_FOUND= 'Payment method not found',
    WALLET_NOT_FOUND= 'Wallet not found',
  }
}

export enum CONTROLLERS {
  USER_CONTROLLER = 'User Controller',
  CANVAS_CONTROLLER = 'Canvas Controller',
  PATH_CONTROLLER = 'Path Controller',
}

export enum PURCHASE_TYPES {
  IAP = 'iap',
  SUBSCRIPTION = 'subscription'
}

export enum DEDUCTIONS {
  APPLE_COMMISION = 30,
  DEFAULT_APP_COMMISION = 22
}

export namespace MIDDLEWARE {
  export enum FAILURE {
    NO_USER = 'User not found',
    AUTH_FAILED = 'Authentication failed',
    INVALID_TOKEN = 'Invalid token',
    NOT_ADMIN = 'User does not have admin access'
  }
}

export namespace COLLECTIONS {
  export enum names {
    STORAGE_PLANS = 'storagePlans',
    FILES = 'files',
    CANVAS = 'canvas'
  }

  export enum planFields {
    STORAGE = 'storagePlan',
    SUBSCRIPTION = 'subscriptionPlan'
  }

  export enum plans {
    FREEMIUM = 'Freemium'
  }

  export enum FAILURE {
    PLAN_NOT_FOUND = 'Plan not found'
  }
}

export namespace ADMIN_CONTROLLER {
  export enum SUCCESS {
    DASHBOARD_FETCHED= 'Admin Dashboard fetched successfully',
    REQUESTS_FETCHED= 'Requests fetched successfully',
    STATUS_UPDATED= 'Request status updated successfully',
    USERS_FETCHED= 'All users fetched successfully',
    USER_UPDATED= 'User updated',
    ADMINS_FETCHED= 'All admins fetched successfully',
    ADMIN_DELETED= 'Admin deleted successfully',
    ADMIN_ADDED= 'Admin Added successfully'
  }

  export enum VALIDATION {
    NO_STATUS_PROVIDED= 'No status provided for update' 
  }

  export enum FAILURE {
    REQUEST_NOT_FOUND= 'Request not found',
    USER_NOT_FOUND= 'User not found'
  }
}

export namespace APPLE_CONTROLLER {
  export enum APPLE_RECIEPT_URL {
    SANDBOX = 'https://sandbox.itunes.apple.com/verifyReceipt',
    PRODUCTION = 'https://buy.itunes.apple.com/verifyReceipt',
  }

  export enum SUCCESS {
    VALID= 'Reciept verified successfully'
  }

  export enum FAILURE {
    INVALID= 'Reciept is invalid'
  }
}
