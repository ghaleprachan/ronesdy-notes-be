import { JsonObject, JsonProperty } from 'typescript-json-serializer';

@JsonObject()
class Size {
  @JsonProperty()
  height?: number;

  @JsonProperty()
  width?: number;
}

@JsonObject()
class PathObject {
  @JsonProperty()
  color?: string;

  @JsonProperty()
  data!: string[];

  @JsonProperty()
  id!: number;

  @JsonProperty()
  width?: number;
}

@JsonObject()
export class CanvasPathDTO {
  @JsonProperty()
  drawer?: null;

  @JsonProperty()
  path!: PathObject;

  @JsonProperty()
  size!: Size;
}
