import { JsonObject, JsonProperty } from 'typescript-json-serializer';
import { CanvasDTO } from '../../../common/canvas.dto';
import { FileDTO } from '../../../common/file.dto';

@JsonObject()
export class CreateFileResponseDTO {
  @JsonProperty({ name: '_id' })
  _id?: string;

  @JsonProperty({ name: 'fileName', required: true })
  fileName!: string;

  @JsonProperty({ name: 'folderID' })
  folderID?: string;

  @JsonProperty({ name: 'userID', required: true })
  userID!: string | any;

  @JsonProperty({ name: 'createdAt' })
  createdAt?: string;

  @JsonProperty({ name: 'updatedAt' })
  updatedAt?: string;

  @JsonProperty({ name: 'isFavorite' })
  isFavorite?: boolean;

  @JsonProperty({ type: Array<CanvasDTO>, name: 'canvas' })
  canvas?: CanvasDTO[];

  @JsonProperty()
  localFileID?: string;

  @JsonProperty()
  fileTemplate?: string;

  @JsonProperty()
  link?: string | null;

  constructor(file: FileDTO, canvas: CanvasDTO[]) {
    this._id = file?._id ?? undefined;
    this.fileName = file?.fileName;
    this.folderID = file?.folderID;
    this.localFileID = file.localFileID;
    this.createdAt = file?.createdAt;
    this.updatedAt = file.updatedAt;
    this.isFavorite = file?.isFavorite;
    this.canvas = canvas;
    this.fileTemplate = file?.fileTemplate;
    this.link = file?.link;
  }
}
