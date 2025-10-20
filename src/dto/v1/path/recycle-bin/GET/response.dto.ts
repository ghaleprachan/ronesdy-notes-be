import { JsonObject, JsonProperty } from 'typescript-json-serializer';
import { FolderDTO } from '../../../common/folder.dto';
import { CanvasDTO } from '../../../common';

@JsonObject()
class FolderDto extends FolderDTO {
}

class FileDto {
  @JsonProperty({ name: '_id' })
  _id?: string;

  @JsonProperty({ name: 'fileName' })
  fileName?: string;

  @JsonProperty({ name: 'folderID' })
  folderID?: string;

  @JsonProperty({ name: 'userID', required: true })
  userID!: string | any;

  @JsonProperty()
  localFileID?: string;

  @JsonProperty({ name: 'isFavorite' })
  isFavorite?: boolean;

  @JsonProperty({ name: 'createdAt' })
  createdAt?: string;

  @JsonProperty({ name: 'updatedAt' })
  updatedAt?: string;

  @JsonProperty()
  fileTemplate?: string;

  @JsonProperty()
  lastCanvasTemplate?: string | null;

  @JsonProperty({ name: 'canvas' })
  canvas?: CanvasDTO[];

  @JsonProperty()
  link?: string | null;
}

@JsonObject()
export class GetRecycleBinResponseDTO {
  @JsonProperty()
  folder!: FolderDto[];

  @JsonProperty()
  file?: FileDto[];
}
