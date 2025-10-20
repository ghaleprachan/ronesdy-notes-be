import { JsonObject, JsonProperty } from 'typescript-json-serializer';

@JsonObject()
export class ResetPasswordDTO {
  @JsonProperty()
  password!: string;

  @JsonProperty()
  email!: string;

  @JsonProperty()
  token!: string;
}
