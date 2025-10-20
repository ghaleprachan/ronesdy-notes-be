import { JsonObject, JsonProperty } from 'typescript-json-serializer';

@JsonObject()
export class RenameFolderRequestDTO {
  @JsonProperty({ name: 'folderID' })
  folderID!: string;

  @JsonProperty({ name: 'folderName', required: true })
  folderName!: string;

  @JsonProperty({ name: 'userID'})
  userID?: string;
}
