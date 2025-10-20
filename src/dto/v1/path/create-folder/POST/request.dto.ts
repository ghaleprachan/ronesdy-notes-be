import { JsonObject, JsonProperty } from 'typescript-json-serializer';
import { FolderDTO } from '../../../common/folder.dto';

@JsonObject()
export class CreateFolderRequestDTO extends FolderDTO{
}
