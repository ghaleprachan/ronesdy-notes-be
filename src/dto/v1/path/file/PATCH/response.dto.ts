import { JsonObject, JsonProperty } from 'typescript-json-serializer';

@JsonObject()
export class RenameFileResponseDTO {
  @JsonProperty({ name: '_id' })
  _id?: string;

  @JsonProperty({ name: 'fileName', required: true })
  fileName?: string;

  @JsonProperty({ name: 'folderID' })
  folderID?: string;

  @JsonProperty({ name: 'updated', required: true })
  updated!: boolean;

  @JsonProperty({ name: 'isFavorite' })
  isFavorite?: boolean;

  @JsonProperty({ name: 'updatedAt' })
  updatedAt?: string;

  @JsonProperty()
  lastCanvasTemplate?: string | null;

  @JsonProperty()
  fileTemplate?: string;

  constructor(request: any, acknowledged: boolean, updatedAt: string) {
    this._id = request?.id;
    this.fileName = request?.name;
    this.updated = acknowledged;
    this.updatedAt = updatedAt;
    this.isFavorite = request?.isFavorite;
    this.folderID = request?.folderID;
    this.fileTemplate = request?.fileTemplate;
  }
}
