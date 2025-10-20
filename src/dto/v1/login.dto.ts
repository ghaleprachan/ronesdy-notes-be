import { JsonObject, JsonProperty } from 'typescript-json-serializer';

@JsonObject()
export class LoginDTO {
  @JsonProperty({ name: 'email', required: true })
  email!: string;

  @JsonProperty({ name: 'password'})
  password?: string;

  @JsonProperty({ name: 'registerType'})
  registerType?: string;
}
