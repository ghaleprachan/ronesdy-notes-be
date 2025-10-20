import { JsonObject, JsonProperty } from 'typescript-json-serializer';

@JsonObject()
export class RenameFolderResponseDTO {
  @JsonProperty({ name: '_id' })
  _id!: string;

  @JsonProperty({ name: 'folderName', required: true })
  folderName!: string;

  @JsonProperty({ name: 'updated', required: true })
  updated!: boolean;

  @JsonProperty({ name: 'updatedAt' })
  updatedAt?: string;

  constructor(id: string, name:string, acknowledged: boolean, updatedAt: string){
    this._id = id;
    this.folderName = name;
    this.updated = acknowledged;
    this.updatedAt = updatedAt
  }
}
