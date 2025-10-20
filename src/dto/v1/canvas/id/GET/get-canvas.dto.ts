import { JsonObject, JsonProperty } from 'typescript-json-serializer';
import { CanvasDTO } from '../../../common/canvas.dto';

@JsonObject()
export class GetCanvasDTO {
  @JsonProperty({ name: 'fileName', required: true })
  fileName?: string;

  @JsonProperty({ name: '_id', required: true })
  _id?: string;

  @JsonProperty({ type: Array<CanvasDTO>, name: 'canvases' })
  canvases?: CanvasDTO[];

  constructor(fileID: string, fileName: string, canvases: any) {
    this._id = fileID;
    this.fileName = fileName;
    this.canvases = canvases;
  }
}
