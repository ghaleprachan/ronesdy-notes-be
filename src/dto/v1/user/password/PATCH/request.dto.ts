import { JsonObject, JsonProperty } from 'typescript-json-serializer';

@JsonObject()
export class UpdatePasswordRequestDTO {
  @JsonProperty({ name: 'password', required: true })
  password!: string;
}
