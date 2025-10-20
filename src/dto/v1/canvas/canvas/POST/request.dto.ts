import { JsonObject } from 'typescript-json-serializer';
import { CanvasDTO } from '../../../common/canvas.dto';

@JsonObject()
export class CreateCanvasRequestDTO extends CanvasDTO {}
