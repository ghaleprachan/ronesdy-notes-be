import { JsonObject, JsonProperty } from 'typescript-json-serializer';

@JsonObject()
export class UpdateUserProfileRequestDTO {
  @JsonProperty({ name: 'firstName', required: true })
  firstName!: string;

  @JsonProperty({ name: 'lastName', required: true })
  lastName!: string;

  @JsonProperty({ name: 'isPushNotificationsEnabled'})
  isPushNotificationsEnabled?: boolean | null;

  @JsonProperty({ name: 'isPromotionalEmailsEnabled'})
  isPromotionalEmailsEnabled?: boolean | null;
}
