import { JsonObject, JsonProperty } from 'typescript-json-serializer';

@JsonObject()
export class RenameFileRequestDTO {
  @JsonProperty({ name: 'fileID' })
  fileID!: string;

  @JsonProperty({ name: 'newFileName' })
  newFileName?: string;

  @JsonProperty({ name: 'folderID' })
  folderID?: string;

  @JsonProperty({ name: 'userID'})
  userID?: string;

  @JsonProperty()
  fileTemplate?: string;

  @JsonProperty({ name: 'isFavorite'})
  isFavorite?: boolean;

  @JsonProperty()
  lastCanvasTemplate?: string | null;

  constructor(request:any){
    this.lastCanvasTemplate = request?.canvasTemplate;
    this.fileID = request?.fileID;
  }
}
