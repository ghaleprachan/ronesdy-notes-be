import { JsonObject, JsonProperty } from 'typescript-json-serializer';

@JsonObject()
export class ContactUsDTO {
  @JsonProperty()
  title?: string;

  @JsonProperty()
  body?: string;

  @JsonProperty()
  userID?: string;
}
