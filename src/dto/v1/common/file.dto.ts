import { JsonObject, JsonProperty } from 'typescript-json-serializer';
import { CanvasDTO } from './canvas.dto';

@JsonObject()
export class FileDTO {
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

  @JsonProperty({ name: 'canvas' })
  canvas?: CanvasDTO[];

  @JsonProperty()
  link?: string | null;

  constructor(request: any, userID: string) {
    this.fileName = request?.file!.fileName;
    this.folderID = request?.folderID ?? undefined;
    this.localFileID = request?.file?.localFileID;
    this.userID = userID;
    this.fileTemplate = request?.file?.fileTemplate;
    this.lastCanvasTemplate = request?.file?.lastCanvasTemplate;
    this.link = request?.file!.link;
  }
}
