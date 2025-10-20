import { JsonObject, JsonProperty } from 'typescript-json-serializer';

@JsonObject()
export class CreateFolderResponseDTO {
  @JsonProperty({ name: '_id' })
  _id!: string;

  @JsonProperty({ name: 'folderName', required: true })
  folderName!: string;

  @JsonProperty()
  localFolderID?: string;

  @JsonProperty({ name: 'createdAt' })
  createdAt!: string;

  @JsonProperty({ name: 'updatedAt' })
  updatedAt?: string;
}
