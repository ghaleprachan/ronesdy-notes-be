import { Schema } from 'mongoose';
import { JsonObject, JsonProperty } from 'typescript-json-serializer';

export enum RegisterTypeEnum {
  GOOGLE = 'google',
  EMAIL = 'email',
}

export enum Status {
  ACTIVE = 'ACTIVE',
  BANNED = 'BANNED',
}
@JsonObject()
export class UserDTO {
  @JsonProperty({ name: '_id' })
  _id?: string | undefined;

  @JsonProperty({ name: 'firstName', required: true })
  firstName?: string;

  @JsonProperty({ name: 'lastName', required: true })
  lastName?: string;

  @JsonProperty({ name: 'email', required: true })
  email!: string;

  @JsonProperty({ name: 'password' })
  password?: string;

  @JsonProperty({ name: 'registerType' })
  registerType!: RegisterTypeEnum;

  @JsonProperty({ name: 'allocatedStorage' })
  allocatedStorage?: number;

  @JsonProperty({ name: 'usedStorage' })
  usedStorage?: number;

  @JsonProperty({ name: 'isPushNotificationsEnabled'})
  isPushNotificationsEnabled?: boolean | null;

  @JsonProperty({ name: 'isPromotionalEmailsEnabled'})
  isPromotionalEmailsEnabled?: boolean | null;

  @JsonProperty({ name: 'subscriptionPlan'})
  subscriptionPlan?: Schema.Types.ObjectId | null;

  @JsonProperty({ name: 'storagePlan'})
  storagePlan?: Schema.Types.ObjectId | null;
  
  @JsonProperty({ name: 'otp' })
  otp?: string | null;

  @JsonProperty({ name: 'otpExpiration' })
  otpExpiration?: Date | null;

  @JsonProperty({ name: 'otpVerified' })
  otpVerified?: boolean;

  @JsonProperty({ name: 'admin' })
  admin?: boolean;

  setOTP(otp: string | null) {
    this.otp = otp;
  }

  setOTPExpiration(otpExpiration: Date | null) {
    this.otpExpiration = otpExpiration;
  }

  setOTPVerified(otpVerified: boolean) {
    this.otpVerified = otpVerified;
  }

  constructor(
    _id: string | undefined,
    firstName: string,
    lastName: string,
    email: string,
    password?: string,
  ) {
    this._id = _id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.password = password;
  }
}
