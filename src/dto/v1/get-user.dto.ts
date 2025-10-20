import { JsonObject, JsonProperty } from 'typescript-json-serializer';

@JsonObject()
export class GetUserDTO {
  @JsonProperty({ name: '_id' })
  _id: string | undefined;

  @JsonProperty({ name: 'firstName', required: true })
  firstName!: string;

  @JsonProperty({ name: 'lastName', required: true })
  lastName!: string;

  @JsonProperty({ name: 'email', required: true })
  email!: string;
}
