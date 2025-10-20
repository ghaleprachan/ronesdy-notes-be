import { JsonObject, JsonProperty } from 'typescript-json-serializer';
import { CanvasDTO } from '../../../common/canvas.dto';

@JsonObject()
class FileDto {
  @JsonProperty()
  fileName!: string;

  @JsonProperty()
  _id!: string;

  @JsonProperty({ name: 'isFavorite' })
  isFavorite?: boolean;

  @JsonProperty()
  lastCanvasTemplate?: string | null;

  @JsonProperty()
  createdAt!: string;

  @JsonProperty({ name: 'updatedAt' })
  updatedAt?: string;

  @JsonProperty()
  localFileID?: string;

  @JsonProperty()
  fileTemplate?: string;

  @JsonProperty({ name: 'canvas' })
  canvas?: CanvasDTO;
}

@JsonObject()
class FolderDto {
  @JsonProperty()
  folderID!: string;

  @JsonProperty()
  file?: FileDto[];

  @JsonProperty()
  createdAt!: string;

  @JsonProperty({ name: 'updatedAt' })
  updatedAt?: string;

  @JsonProperty()
  localFolderID?: string;
}

@JsonObject()
export class GetAllPathsResponseDTO {
  @JsonProperty()
  folders!: FolderDto[];

  @JsonProperty()
  files?: FileDto[];
}
