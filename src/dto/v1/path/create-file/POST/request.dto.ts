import { JsonObject, JsonProperty } from 'typescript-json-serializer';
import { CanvasDTO } from '../../../common/canvas.dto';
import { FileDTO } from '../../../common/file.dto';

@JsonObject()
class FileDto {
  @JsonProperty({ name: '_id' })
  _id?: string;

  @JsonProperty({ name: 'fileName', required: true })
  fileName!: string;

  @JsonProperty({ name: 'folderID' })
  folderID?: string;

  @JsonProperty({ name: 'userID' })
  userID?: string | any;

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
export class CreateFileRequestDTO {
  @JsonProperty()
  folderID?: string;

  @JsonProperty({ type: FileDto })
  file?: FileDto;
}
