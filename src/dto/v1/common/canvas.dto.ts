import { JsonObject, JsonProperty } from 'typescript-json-serializer';
import { CanvasPathDTO } from './canvas-path.dto';
import { CanvasShapeDTO } from './canvas-shape.dto';

@JsonObject()
export class CanvasDTO {
  @JsonProperty()
  _id?: string;

  @JsonProperty({ name: 'fileID' })
  fileID?: string;

  @JsonProperty()
  localCanvasID?: string;

  @JsonProperty()
  pageNo!: number;

  @JsonProperty({ name: 'paths' })
  paths?: CanvasPathDTO[];

  @JsonProperty({ name: 'shapes' })
  shapes?: CanvasShapeDTO[];

  @JsonProperty({ name: 'isBookmarked' })
  isBookmarked?: boolean;

  @JsonProperty({ name: 'createdAt' })
  createdAt?: string;

  @JsonProperty()
  canvasTemplate?: string | null;

  @JsonProperty({ name: 'updatedAt' })
  updatedAt?: string;

  @JsonProperty()
  localFileID?: string | null;
}
