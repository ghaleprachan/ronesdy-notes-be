import { JsonObject, JsonProperty } from 'typescript-json-serializer';
import { CanvasDTO } from '../../../../common/canvas.dto';
import { FileDTO } from '../../../../common/file.dto';

@JsonObject()
export class GetCanvasResponseDTO {
  @JsonProperty({ name: '_id' })
  _id?: string;

  @JsonProperty({ name: 'fileName', required: true })
  fileName!: string;

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

  @JsonProperty({ name: 'canvases' })
  canvases?: CanvasDTO[];

  @JsonProperty()
  link?: string | null;

  constructor(file: any, canvases: any, userID: string) {
    this._id = file._id;
    this.userID = userID;
    this.fileName = file.fileName;
    this.localFileID = file.localFileID;
    this.isFavorite = file.isFavorite;
    this.fileTemplate = file.fileTemplate;
    this.lastCanvasTemplate = file.lastCanvasTemplate;
    this.canvases = canvases;
    this.link = file?.link;
  }
}
