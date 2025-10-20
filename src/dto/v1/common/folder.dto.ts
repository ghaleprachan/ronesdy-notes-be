import { JsonObject, JsonProperty } from 'typescript-json-serializer';
import { FileDTO } from './file.dto';

@JsonObject()
export class FolderDTO {
  @JsonProperty({ name: '_id' })
  _id?: string;

  @JsonProperty({ name: 'folderName', required: true })
  folderName!: string;

  @JsonProperty({ name: 'userID', required: true })
  userID?: string;

  @JsonProperty()
  localFolderID?: string;

  @JsonProperty()
  file?: FileDTO[];

  @JsonProperty({ name: 'createdAt' })
  createdAt?: string;
}
