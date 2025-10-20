import { JsonObject, JsonProperty } from 'typescript-json-serializer';

@JsonObject()
export class VerifyOtpDTO {
  @JsonProperty()
  otp!: string;

  @JsonProperty()
  email!: string;
}
