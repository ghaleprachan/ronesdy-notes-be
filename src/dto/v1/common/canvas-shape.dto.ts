import { JsonObject, JsonProperty } from 'typescript-json-serializer';

@JsonObject()
export class CanvasShapeDTO {
  @JsonProperty()
  height?: number;

  @JsonProperty()
  width?: number;

  @JsonProperty()
  type?: string;

  @JsonProperty()
  x?: number;

  @JsonProperty()
  y?: number;

  @JsonProperty()
  color?: string;

  @JsonProperty()
  filled?: boolean;

  @JsonProperty()
  strokeWidth?: number | null;

  @JsonProperty()
  sides?: number | null;
  }