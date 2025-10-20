import { JsonObject, JsonProperty } from 'typescript-json-serializer';

@JsonObject()
export class GetUserResponseDTO {
  @JsonProperty({ name: '_id' })
  _id!: string;

  @JsonProperty({ name: 'firstName', required: true })
  firstName!: string;

  @JsonProperty({ name: 'lastName', required: true })
  lastName!: string;

  @JsonProperty({ name: 'email', required: true })
  email!: string;

  @JsonProperty({ name: 'createdAt' })
  createdAt?: string;

  @JsonProperty({ name: 'updatedAt' })    
  updatedAt?: string;

  @JsonProperty({ name: 'isPromotionalEmailsEnabled' })
  isPromotionalEmailsEnabled?: boolean | null;

  @JsonProperty({ name: 'isPushNotificationsEnabled' })
  isPushNotificationsEnabled?: boolean | null;
}
